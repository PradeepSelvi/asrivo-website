import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string }> }
) {
  try {
    // ── 1. Decode and sanitize the requested path ──────────────────────────────
    const params = await context.params
    const filePath = decodeURIComponent(params.path)

    // Guard against path-traversal: reject any segment that navigates upward.
    if (filePath.split('/').some((seg) => seg === '..' || seg === '.')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // ── 2. Require authentication ──────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // ── 3. Require admin membership ────────────────────────────────────────────
    // `createClient()` uses the caller session; use the service-role client for
    // the admin_profiles lookup so RLS never blocks the check itself.
    const adminSupabase = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await adminSupabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Forbidden: admin access required' },
        { status: 403 }
      )
    }

    // ── 4. Download file from Supabase Storage ─────────────────────────────────
    const { data, error } = await supabase.storage
      .from('partnership-documents')
      .download(filePath)

    if (error) {
      console.error('Download error:', error)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // ── 5. Stream the file back with appropriate headers ───────────────────────
    const buffer = Buffer.from(await data.arrayBuffer())

    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'pdf') contentType = 'application/pdf'
    else if (ext === 'doc') contentType = 'application/msword'
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    // Use a safe filename — strip directory components before setting the header.
    const safeFilename = filePath.split('/').pop() ?? 'download'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

