import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] | string }> }
) {
  try {
    const params = await context.params
    const rawPath = Array.isArray(params.path) ? params.path.join('/') : params.path
    let filePath = decodeURIComponent(rawPath)

    // Handle full public URL or relative paths
    if (filePath.includes('inquiry-documents/')) {
      filePath = filePath.split('inquiry-documents/').pop() || filePath
    }

    // Strip leading slashes and query strings
    filePath = filePath.replace(/^\/+/, '').split('?')[0]

    // Guard against path traversal
    if (filePath.split('/').some((seg) => seg === '..' || seg === '.')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // 1. Require authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access inquiry documents' },
        { status: 401 }
      )
    }

    // 2. Check reviewer authorization (admin_profiles)
    const adminSupabase = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await adminSupabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let isAuthorized = !!adminProfile

    // 3. If not admin, check if caller is the submitting owner of the inquiry
    if (!isAuthorized && user.email) {
      const cleanFilename = filePath.split('/').pop() || filePath
      const { data: inquiry } = await adminSupabase
        .from('client_inquiries')
        .select('id')
        .ilike('prd_file_url', `%${cleanFilename}%`)
        .eq('email', user.email.toLowerCase())
        .maybeSingle()

      if (inquiry) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access this document' },
        { status: 403 }
      )
    }

    // 4. Generate short-lived signed URL (valid for 5 minutes)
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from('inquiry-documents')
      .createSignedUrl(filePath, 300)

    if (signError || !signedData?.signedUrl) {
      console.error('Failed to generate signed URL for inquiry document:', signError)
      return NextResponse.json({ error: 'Failed to generate document download link' }, { status: 404 })
    }

    // Return JSON if caller explicitly requests application/json
    const acceptHeader = request.headers.get('accept') || ''
    if (acceptHeader.includes('application/json')) {
      return NextResponse.json({ success: true, signedUrl: signedData.signedUrl })
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
