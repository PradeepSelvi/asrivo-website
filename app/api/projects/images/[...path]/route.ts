import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import path from 'path'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'project-images'

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

// Strict allowlist for segment characters: alphanumeric, dash, underscore, dot
const SAFE_SEGMENT_REGEX = /^[a-zA-Z0-9_\-\.]+$/

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // 1. Check raw URL for encoded traversal or delimiters
    const rawUrl = request.url || ''
    if (rawUrl.includes('%') || rawUrl.includes('\\') || rawUrl.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid request: encoded characters and traversal syntax are prohibited.' },
        { status: 400 }
      )
    }

    const params = await context.params
    if (!params.path || params.path.length === 0) {
      return NextResponse.json({ error: 'Image path not specified' }, { status: 400 })
    }

    // 2. Validate each segment against strict pattern
    for (const segment of params.path) {
      if (segment.includes('%') || segment.includes('\\') || segment.includes('/')) {
        return NextResponse.json({ error: 'Invalid path characters' }, { status: 400 })
      }

      if (!SAFE_SEGMENT_REGEX.test(segment)) {
        return NextResponse.json({ error: 'Invalid path format' }, { status: 400 })
      }

      if (segment === '.' || segment === '..') {
        return NextResponse.json({ error: 'Path traversal attempt detected' }, { status: 400 })
      }
    }

    // 3. Normalize and verify path remains within target namespace
    const joinedPath = params.path.join('/')
    const normalized = path.posix.normalize(joinedPath)

    if (normalized.startsWith('..') || normalized.startsWith('/') || normalized.includes('/../')) {
      return NextResponse.json({ error: 'Invalid normalized path' }, { status: 400 })
    }

    // 4. Enforce valid image extension and disallow multiple dots
    const fileName = params.path[params.path.length - 1]
    if (fileName.split('.').length !== 2) {
      return NextResponse.json({ error: 'Invalid file naming format' }, { status: 400 })
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_MAP[ext]
    if (!contentType) {
      return NextResponse.json({ error: 'Unsupported file type. Only standard images permitted.' }, { status: 400 })
    }

    // 5. Download file from bucket using service role client
    const supabase = createApiClient({ useServiceRole: true })
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(normalized)

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
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error serving project image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
