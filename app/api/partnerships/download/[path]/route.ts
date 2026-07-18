import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string }> }
) {
  try {
    const params = await context.params
    const filePath = decodeURIComponent(params.path)

    // Create authenticated Supabase client
    const supabase = await createClient()
    
    // Verify user is authenticated (admin)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('partnership-documents')
      .download(filePath)

    if (error) {
      console.error('Download error:', error)
      return NextResponse.json(
        { error: 'File not found', details: error.message },
        { status: 404 }
      )
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await data.arrayBuffer())

    // Determine content type from file extension
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === 'pdf') contentType = 'application/pdf'
    else if (ext === 'doc') contentType = 'application/msword'
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    // Return file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
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
