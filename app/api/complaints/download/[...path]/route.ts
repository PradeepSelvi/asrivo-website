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
    if (filePath.includes('proof%20of%20complain/')) {
      filePath = filePath.split('proof%20of%20complain/').pop() || filePath
    } else if (filePath.includes('proof of complain/')) {
      filePath = filePath.split('proof of complain/').pop() || filePath
    }

    // Guard against path traversal
    if (filePath.split('/').some((seg) => seg === '..' || seg === '.')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // 1. Require authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access complaint evidence' },
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

    // 3. If not admin, check if caller is the verified owner of the complaint
    if (!isAuthorized && user.email) {
      const cleanFilename = filePath.split('/').pop() || filePath
      const { data: complaint } = await adminSupabase
        .from('complaints')
        .select('id')
        .ilike('proof_document_url', `%${cleanFilename}%`)
        .eq('email', user.email.toLowerCase())
        .maybeSingle()

      if (complaint) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have authorization to view this complaint evidence' },
        { status: 403 }
      )
    }

    // 4. Issue a short-lived signed URL (300 seconds = 5 minutes)
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from('proof of complain')
      .createSignedUrl(filePath, 300)

    if (signError || !signedData?.signedUrl) {
      console.error('Error creating signed URL for complaint evidence:', signError?.message)
      return NextResponse.json(
        { error: 'File not found or failed to issue signed URL' },
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
