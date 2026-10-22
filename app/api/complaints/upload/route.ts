import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { uploadRateLimit } from '@/lib/utils/rate-limit'
import { randomBytes } from 'crypto'

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
])

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 uploads per hour per IP
  const limited = await applyRateLimit(request, uploadRateLimit)
  if (limited) return limited

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File exceeds 3 MB limit.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 })
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Safe filename — never trust client-supplied filename
    const ext = EXT_MAP[file.type] ?? 'bin'
    const safeName = `proof_${Date.now()}_${randomBytes(6).toString('hex')}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proof of complain')
      .upload(safeName, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('Complaint upload error:', uploadError.message)
      return NextResponse.json({ success: false, error: 'Failed to upload file.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fileUrl: uploadData.path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error('Complaint upload server error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
