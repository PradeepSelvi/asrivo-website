import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { createApiClient } from '@/lib/supabase/api-client'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'resumes'

// Strict whitelist for server-generated resume file names:
// e.g. "1730268481234-a1b2c3d4e5f67890.pdf" or standard alphanumeric hyphen/underscore
const SAFE_RESUME_FILENAME_REGEX = /^[a-zA-Z0-9_-]+\.pdf$/i

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // 1. Verify admin authentication
    let adminUser = (await getCurrentAdmin()).user

    if (!adminUser) {
      const authHeader = request.headers.get('authorization')
      const token =
        (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) ||
        request.cookies.get('sb-access-token')?.value ||
        request.cookies.get('supabase-auth-token')?.value

      if (token) {
        const supabaseAuth = createApiClient({ useServiceRole: true })
        const { data: tokenData } = await supabaseAuth.auth.getUser(token)
        if (tokenData?.user) {
          const { data: profile } = await supabaseAuth
            .from('admin_profiles')
            .select('role, email')
            .eq('id', tokenData.user.id)
            .single()

          if (profile && (profile.role === 'high' || profile.role === 'low')) {
            adminUser = {
              id: tokenData.user.id,
              email: tokenData.user.email || profile.email,
              role: profile.role,
            }
          }
        }
      }
    }

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required to view candidate resumes.' },
        { status: 401 }
      )
    }

    // 2. Reject encoded characters and traversal syntax from the raw URL (CWE-22)
    const rawUrl = request.url || ''
    if (rawUrl.includes('%') || rawUrl.includes('\\') || rawUrl.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid request: encoded characters and traversal syntax are prohibited.' },
        { status: 400 }
      )
    }

    const params = await context.params
    if (!params.path || params.path.length === 0 || params.path.length > 2) {
      return NextResponse.json({ error: 'Invalid resume path structure' }, { status: 400 })
    }

    // If 2 segments, first must be 'resumes'
    if (params.path.length === 2 && params.path[0] !== 'resumes') {
      return NextResponse.json({ error: 'Invalid resume storage prefix' }, { status: 400 })
    }

    // The final segment is the file name
    const fileName = params.path[params.path.length - 1]

    // Validate strictly against server-controlled format: alphanumeric/hyphen/underscore with exactly one .pdf extension
    if (!SAFE_RESUME_FILENAME_REGEX.test(fileName) || fileName.split('.').length !== 2) {
      return NextResponse.json(
        { error: 'Invalid resume filename format. Traversal syntax and unauthorized extensions are rejected.' },
        { status: 400 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })

    // 3. Resolve resume identifier to database records to prevent unauthorized object access
    const { data: matchedApp, error: dbError } = await supabase
      .from('job_applications')
      .select('id')
      .ilike('resume_url', `%${fileName}%`)
      .limit(1)
      .maybeSingle()

    if (dbError || !matchedApp) {
      return NextResponse.json(
        { error: 'Resume not found or does not belong to a valid application.' },
        { status: 404 }
      )
    }

    // 4. Download file using verified server-controlled object key
    // First try with resumes/ prefix, then fallback without prefix
    let downloadResult = await supabase.storage.from(BUCKET_NAME).download(`resumes/${fileName}`)
    if (downloadResult.error || !downloadResult.data) {
      downloadResult = await supabase.storage.from(BUCKET_NAME).download(fileName)
    }

    const { data, error } = downloadResult

    if (error || !data) {
      console.error('Error downloading resume from storage:', error)
      return NextResponse.json(
        { error: 'Resume document not found in storage' },
        { status: 404 }
      )
    }

    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error serving resume PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
