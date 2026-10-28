import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'resumes'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit

export async function POST(request: NextRequest) {
  // Rate limiting to protect upload endpoint
  const limited = await applyRateLimit(request, formSubmitRateLimit)
  if (limited) return limited

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No resume file provided.' },
        { status: 400 }
      )
    }

    // 1. Strict PDF MIME type check
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file format. Resume must be in PDF format (.pdf).',
        },
        { status: 400 }
      )
    }

    // 2. Strict extension check
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file extension. Only .pdf files are accepted.',
        },
        { status: 400 }
      )
    }

    // 3. Strict 10 MB size limit
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10 MB limit (Uploaded: ${sizeMB} MB). Please upload a smaller PDF file.`,
        },
        { status: 400 }
      )
    }

    // 4. Generate cryptographically safe random filename
    const safeFileName = `${Date.now()}-${randomBytes(8).toString('hex')}.pdf`
    const safePath = `resumes/${safeFileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = createApiClient({ useServiceRole: true })

    // 5. Upload to resumes bucket
    let { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(safePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    // Auto-create bucket if missing and retry
    if (error && error.message.toLowerCase().includes('bucket not found')) {
      console.warn(`Bucket "${BUCKET_NAME}" not found. Creating it now...`)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ['application/pdf'],
      })

      if (!createError) {
        const retry = await supabase.storage
          .from(BUCKET_NAME)
          .upload(safePath, buffer, {
            contentType: 'application/pdf',
            upsert: false,
          })
        data = retry.data
        error = retry.error
      }
    }

    if (error) {
      console.error('Resume upload error:', error)
      return NextResponse.json(
        { success: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Return the secure admin view URL for the uploaded resume
    const resumeViewUrl = `/api/admin/applications/resume/${data?.path || safePath}`

    return NextResponse.json({
      success: true,
      url: resumeViewUrl,
      path: data?.path || safePath,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Resume upload exception:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error during upload.',
      },
      { status: 500 }
    )
  }
}
