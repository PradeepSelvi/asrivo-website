import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'

export const dynamic = 'force-dynamic'

const SAFE_PARTNERSHIP_REGEX = /^([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(pdf|doc|docx)$/i

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string | string[] }> }
) {
  try {
    // ── 1. Guard against path-traversal, backslashes, and URI fragments (CWE-22) ─
    const rawUrl = request.url || ''
    if (rawUrl.includes('\\') || rawUrl.includes('#') || rawUrl.includes('..')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const params = await context.params
    const rawPath = Array.isArray(params.path) ? params.path.join('/') : params.path
    let filePath = decodeURIComponent(rawPath)

    if (filePath.includes('partnership-documents/')) {
      filePath = filePath.split('partnership-documents/').pop() || filePath
    }
    filePath = filePath.replace(/^\/+/, '').split('?')[0]

    // Reject traversal segments
    if (filePath.split('/').some((seg) => seg === '..' || seg === '.' || seg === '')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    if (!SAFE_PARTNERSHIP_REGEX.test(filePath)) {
      return NextResponse.json({ error: 'Invalid file path format' }, { status: 400 })
    }

    // ── 2. Require authentication (CWE-862) ───────────────────────────────────
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
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // ── 3. Check administrator authorization ───────────────────────────────────
    const adminSupabase = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await adminSupabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = !!adminProfile

    const cleanFilename = filePath.split('/').pop() || filePath

    // ── 4. Authorize against trusted database record (Finding f72d2a11 / CWE-862)
    let query = adminSupabase
      .from('partnerships')
      .select('id, email, agreement_document_url, noc_document_url, proposal_document_url')
      .or(
        `agreement_document_url.eq.${filePath},noc_document_url.eq.${filePath},proposal_document_url.eq.${filePath},agreement_document_url.like.%/${cleanFilename},noc_document_url.like.%/${cleanFilename},proposal_document_url.like.%/${cleanFilename}`
      )

    // If caller is not an administrator, enforce ownership against caller's verified email
    if (!isAdmin) {
      if (!user.email) {
        return NextResponse.json(
          { error: 'Forbidden: A verified email address is required' },
          { status: 403 }
        )
      }
      query = query.eq('email', user.email.toLowerCase())
    }

    const { data: partnerships, error: dbError } = await query.limit(1)
    const partnership = partnerships?.[0]

    if (dbError || !partnership) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access this document or document not found' },
        { status: 403 }
      )
    }

    // Resolve exact canonical storage path from trusted database record
    const docUrls = [
      partnership.agreement_document_url,
      partnership.noc_document_url,
      partnership.proposal_document_url,
    ].filter(Boolean) as string[]

    const matchedUrl = docUrls.find((u) => {
      let clean = u.trim()
      if (clean.includes('partnership-documents/')) {
        clean = clean.split('partnership-documents/').pop() || clean
      }
      clean = clean.replace(/^\/+/, '').split('?')[0]
      return clean === filePath || clean.endsWith(`/${cleanFilename}`) || clean === cleanFilename
    })

    if (!matchedUrl) {
      return NextResponse.json(
        { error: 'Forbidden: Document reference mismatch' },
        { status: 403 }
      )
    }

    let canonicalPath = matchedUrl.trim()
    if (canonicalPath.includes('partnership-documents/')) {
      canonicalPath = canonicalPath.split('partnership-documents/').pop() || canonicalPath
    }
    const safeCanonicalPath = canonicalPath.replace(/^\/+/, '').split('?')[0]

    // ── 5. Download file from Supabase Storage using verified canonical key ───
    const { data, error } = await adminSupabase.storage
      .from('partnership-documents')
      .download(safeCanonicalPath)

    if (error || !data) {
      console.error('Partnership document download error:', error)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // ── 6. Stream the file back with secure headers ───────────────────────────
    const buffer = Buffer.from(await data.arrayBuffer())

    const ext = safeCanonicalPath.split('.').pop()?.toLowerCase()
    let contentType = 'application/pdf'
    if (ext === 'doc') contentType = 'application/msword'
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Server error downloading partnership document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
