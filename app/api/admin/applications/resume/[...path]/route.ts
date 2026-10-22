import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { createApiClient } from '@/lib/supabase/api-client'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'resumes'

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

    // 2. Extract and sanitize file path
    const params = await context.params
    if (!params.path || params.path.length === 0) {
      return NextResponse.json({ error: 'Resume path not specified' }, { status: 400 })
    }

    const rawPath = params.path.map((segment) => decodeURIComponent(segment)).join('/')
    const safePath = rawPath.replace(/\.\./g, '').replace(/^\/+/, '')

    const supabase = createApiClient({ useServiceRole: true })
    let { data, error } = await supabase.storage.from(BUCKET_NAME).download(safePath)

    // Fallback if uploaded directly at root or under resumes/ folder
    if ((error || !data) && safePath.startsWith('resumes/')) {
      const altPath = safePath.replace(/^resumes\//, '')
      const retry = await supabase.storage.from(BUCKET_NAME).download(altPath)
      if (!retry.error && retry.data) {
        data = retry.data
        error = null
      }
    } else if ((error || !data) && !safePath.startsWith('resumes/')) {
      const altPath = `resumes/${safePath}`
      const retry = await supabase.storage.from(BUCKET_NAME).download(altPath)
      if (!retry.error && retry.data) {
        data = retry.data
        error = null
      }
    }

    if (error || !data) {
      console.error('Error downloading resume:', error)
      return NextResponse.json(
        { error: 'Resume document not found' },
        { status: 404 }
      )
    }

    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = safePath.split('/').pop() || 'Resume.pdf'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving resume PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
