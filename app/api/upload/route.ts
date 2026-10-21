import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { uploadRateLimit } from '@/lib/utils/rate-limit'
import { randomBytes } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Strictly allowed buckets — prevents arbitrary bucket access
const ALLOWED_BUCKETS = new Set([
  'inquiry-documents',
  'partnership-documents',
  'user-profiles',
])

const VALID_DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
])
const VALID_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])
const VALID_TYPES = new Set([...VALID_DOC_TYPES, ...VALID_IMAGE_TYPES])

const EXT_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 uploads per hour per IP
  const limited = await applyRateLimit(request, uploadRateLimit)
  if (limited) return limited

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucketInput = (formData.get('bucket') as string | null) ?? 'inquiry-documents'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 })
    }

    // Validate bucket — prevent arbitrary bucket access (path traversal)
    if (!ALLOWED_BUCKETS.has(bucketInput)) {
      return NextResponse.json({ success: false, error: 'Invalid upload destination.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File exceeds 10 MB limit.' }, { status: 400 })
    }

    if (!VALID_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed. Accepted: JPG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT.' },
        { status: 400 }
      )
    }

    const folder = (formData.get('folder') as string | null)?.replace(/^\/+|\/+$/g, '') ?? ''
    const supabase = createApiClient({ useServiceRole: true })

    // Generate a safe filename — never use the original filename from the client
    const ext = EXT_MAP[file.type] ?? 'bin'
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`
    const safePath = folder ? `${folder}/${fileName}` : fileName

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(bucketInput)
      .upload(safePath, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('Supabase storage error:', error.message)
      return NextResponse.json({ success: false, error: 'Upload failed.' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from(bucketInput).getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: publicUrl, path: data.path })
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
