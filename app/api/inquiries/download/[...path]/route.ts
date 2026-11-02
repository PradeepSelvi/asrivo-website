import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { extractCanonicalInquiryPath, SAFE_INQUIRY_PATH_REGEX } from '@/lib/utils/upload-capability'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] | string }> }
) {
  try {
    // 1. Guard against traversal, backslashes, and URI fragments (CWE-22)
    const rawUrl = request.url || ''
    if (rawUrl.includes('\\') || rawUrl.includes('#') || rawUrl.includes('..')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const params = await context.params
    const rawPath = Array.isArray(params.path) ? params.path.join('/') : params.path
    let filePath = decodeURIComponent(rawPath)

    // Handle full public URL or relative paths
    if (filePath.includes('inquiry-documents/')) {
      filePath = filePath.split('inquiry-documents/').pop() || filePath
    }

    // Strip leading slashes and query strings
    filePath = filePath.replace(/^\/+/, '').split('?')[0]

    // Guard against path traversal segments
    if (filePath.split('/').some((seg) => seg === '..' || seg === '.' || seg === '')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Strict regex validation for inquiry document paths
    if (!SAFE_INQUIRY_PATH_REGEX.test(filePath)) {
      return NextResponse.json({ error: 'Invalid document path format' }, { status: 400 })
    }

    // 2. Require authentication
    const supabase = await createClient()
    let { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
      if (token) {
        const adminSupabase = createApiClient({ useServiceRole: true })
        const { data: tokenData } = await adminSupabase.auth.getUser(token)
        if (tokenData?.user) {
          user = tokenData.user
          authError = null
        }
      }
    }

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access inquiry documents' },
        { status: 401 }
      )
    }

    // 3. Check reviewer authorization (admin_profiles)
    const adminSupabase = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await adminSupabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = !!adminProfile

    if (!isAdmin && !user.email) {
      return NextResponse.json(
        { error: 'Forbidden: A verified email address is required to access inquiry documents' },
        { status: 403 }
      )
    }

    const cleanFilename = filePath.split('/').pop() || filePath

    // 4. Immutable user identity check (Finding cd25acbb-6e11-40ea-9be0-7fa76e762222 / CWE-863)
    // If filename is bound to a specific user ID (prd_<userId>_...), verify caller matches that user
    if (!isAdmin && cleanFilename.startsWith('prd_') && !cleanFilename.startsWith('prd_pub_')) {
      const parts = cleanFilename.split('_')
      if (parts.length >= 4) {
        const ownerId = parts[1]
        if (ownerId !== user.id) {
          return NextResponse.json(
            { error: 'Forbidden: You do not own this document.' },
            { status: 403 }
          )
        }
      }
    }

    // 5. Authorize strictly against trusted database record (Finding F-012)
    // Matches exact canonical path or exact suffix, never loose substring
    let query = adminSupabase
      .from('client_inquiries')
      .select('id, email, prd_file_url')
      .or(`prd_file_url.eq.${filePath},prd_file_url.like.%/${filePath},prd_file_url.like.%/${cleanFilename}`)

    // If caller is not an administrator, enforce ownership against caller's verified email
    if (!isAdmin && user.email) {
      query = query.eq('email', user.email.toLowerCase())
    }

    const { data: inquiries, error: dbError } = await query.limit(1)
    const inquiry = inquiries?.[0]

    if (dbError || !inquiry || !inquiry.prd_file_url) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access this document or document not found' },
        { status: 403 }
      )
    }

    // Extract exact canonical object key from the trusted database record
    const canonicalKey = extractCanonicalInquiryPath(inquiry.prd_file_url)

    // Ensure the trusted database record matches the requested file
    if (!canonicalKey.endsWith(cleanFilename)) {
      return NextResponse.json(
        { error: 'Forbidden: Document reference mismatch' },
        { status: 403 }
      )
    }

    if (!SAFE_INQUIRY_PATH_REGEX.test(canonicalKey)) {
      return NextResponse.json(
        { error: 'Invalid document attachment format in record' },
        { status: 400 }
      )
    }

    // 6. Generate short-lived signed URL for the trusted canonical key (valid for 5 minutes)
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from('inquiry-documents')
      .createSignedUrl(canonicalKey, 300)

    if (signError || !signedData?.signedUrl) {
      console.error('Failed to generate signed URL for inquiry document:', signError)
      return NextResponse.json({ error: 'Failed to generate document download link' }, { status: 404 })
    }

    // Return JSON if caller explicitly requests application/json or ?format=json
    const acceptHeader = request.headers.get('accept') || ''
    const formatParam = request.nextUrl.searchParams.get('format')
    if (formatParam === 'json' || acceptHeader.includes('application/json')) {
      return NextResponse.json({ success: true, signedUrl: signedData.signedUrl, url: signedData.signedUrl })
    }

    // Redirect browser directly to temporary signed URL for immediate download
    return NextResponse.redirect(signedData.signedUrl, 302)
  } catch (error) {
    console.error('Inquiry document download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
