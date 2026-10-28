import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'project-images'

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params
    if (!params.path || params.path.length === 0) {
      return NextResponse.json({ error: 'Image path not specified' }, { status: 400 })
    }

    // Sanitize path against directory traversal
    const rawPath = params.path.map((segment) => decodeURIComponent(segment)).join('/')
    const safePath = rawPath.replace(/\.\./g, '').replace(/^\/+/, '')

    const ext = safePath.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_MAP[ext] || 'application/octet-stream'

    const supabase = createApiClient({ useServiceRole: true })
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(safePath)

    if (error || !data) {
      return NextResponse.json({ error: 'Project image not found' }, { status: 404 })
    }

    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving project image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
