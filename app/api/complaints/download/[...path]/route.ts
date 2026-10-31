import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'proof of complain'

// Strict allowlist: only server-generated complaint evidence filenames are permitted
// Formats: proof_<userId>_<timestamp>_<hex>.<ext> or legacy proof_<timestamp>_<hex>.<ext>
const SAFE_PROOF_REGEX = /^proof_[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp|pdf)$/i

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] | string }> }
) {
  try {
    // 1. Reject any encoded path syntax, traversal sequences, or URL delimiters (CWE-863)
    const rawUrl = request.url || ''
    if (rawUrl.includes('%') || rawUrl.includes('\\') || rawUrl.includes('#') || rawUrl.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid request: encoded paths, traversal syntax, and delimiters are prohibited.' },
        { status: 400 }
      )
    }

    const params = await context.params
    const rawPath = Array.isArray(params.path) ? params.path.join('/') : params.path
    let filePath = rawPath

    // Handle full prefix or relative paths
    if (filePath.includes('proof%20of%20complain/')) {
      filePath = filePath.split('proof%20of%20complain/').pop() || filePath
    } else if (filePath.includes('proof of complain/')) {
      filePath = filePath.split('proof of complain/').pop() || filePath
    }

    const cleanFilename = filePath.split('/').pop() || filePath

    // Enforce strict server-generated filename format and single extension
    if (!cleanFilename || !SAFE_PROOF_REGEX.test(cleanFilename) || cleanFilename.split('.').length !== 2) {
      return NextResponse.json(
        { error: 'Invalid evidence filename format.' },
        { status: 400 }
      )
    }

    // 2. Require user authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access complaint evidence' },
        { status: 401 }
      )
    }

    // 3. Check administrator authorization
    const adminSupabase = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await adminSupabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = !!adminProfile

    // 4. Resolve download from trusted database record to bind authorization to exact object
    let query = adminSupabase
      .from('complaints')
      .select('id, proof_document_url, email')
      .or(`proof_document_url.eq.${cleanFilename},proof_document_url.like.%/${cleanFilename}`)

    // If caller is not an administrator, enforce ownership checks
    if (!isAdmin) {
      if (!user.email) {
        return NextResponse.json(
          { error: 'Forbidden: A verified email address is required.' },
          { status: 403 }
        )
      }

      // If filename is bound to a user ID, verify caller matches
      const parts = cleanFilename.split('_')
      if (parts.length >= 4) {
        const ownerId = parts[1]
        if (ownerId !== user.id) {
          return NextResponse.json(
            { error: 'Forbidden: You do not own this evidence object.' },
            { status: 403 }
          )
        }
      }

      // Restrict query to complaints owned by caller's verified email
      query = query.eq('email', user.email.toLowerCase())
    }

    const { data: complaint, error: dbError } = await query.maybeSingle()

    if (dbError || !complaint || !complaint.proof_document_url) {
      return NextResponse.json(
        { error: 'Complaint evidence record not found or access denied.' },
        { status: 404 }
      )
    }

    // Extract exact canonical object key from the verified database record
    const canonicalObjectKey = complaint.proof_document_url.split('/').pop() || cleanFilename

    if (!SAFE_PROOF_REGEX.test(canonicalObjectKey)) {
      return NextResponse.json({ error: 'Invalid canonical attachment format.' }, { status: 400 })
    }

    // 5. Issue short-lived signed URL for the verified canonical key in the fixed bucket
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(canonicalObjectKey, 300)

    if (signError || !signedData?.signedUrl) {
      console.error('Error creating signed URL for complaint evidence:', signError?.message)
      return NextResponse.json(
        { error: 'Evidence file not found in storage.' },
        { status: 404 }
      )
    }

    // Return JSON if requested
    if (request.nextUrl.searchParams.get('format') === 'json') {
      return NextResponse.json({ success: true, url: signedData.signedUrl })
    }

    // Otherwise redirect directly to temporary signed URL
    return NextResponse.redirect(signedData.signedUrl)
  } catch (error) {
    console.error('Complaint evidence download server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
