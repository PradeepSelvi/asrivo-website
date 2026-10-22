import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/utils/audit-logger'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || undefined
    const resourceType = searchParams.get('resourceType') || undefined
    const userId = searchParams.get('userId') || undefined
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch audit logs
    const result = await getAuditLogs({
      action: action as any,
      resourceType: resourceType as any,
      userId,
      startDate,
      endDate,
      limit,
      offset,
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
