import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { uploadRateLimit } from '@/lib/utils/rate-limit'
import { randomBytes } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, uploadRateLimit)
  if (limited) return limited

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const partnershipId = formData.get('partnershipId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!documentType || !['agreement', 'noc', 'proposal'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type (PDF ONLY)
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Check uploader identity if authenticated
    let authUser: { id: string; email?: string } | null = null
    try {
      const serverSupabase = await createServerClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
      if (user) {
        authUser = { id: user.id, email: user.email }
      }
    } catch {
      // Anonymous submission
    }

    // Generate unique, safe filename immutably bound to user identity if authenticated
    const fileExt = 'pdf'
    const timestamp = Date.now()
    const randomHex = randomBytes(6).toString('hex')
    const fileName = authUser
      ? `${documentType}_${authUser.id}_${timestamp}_${randomHex}.${fileExt}`
      : `${documentType}_${timestamp}_${randomHex}.${fileExt}`

    // Sanitize partnershipId folder if provided (alphanumeric/hyphens only)
    const sanitizedFolder = partnershipId && /^[a-zA-Z0-9_-]+$/.test(partnershipId)
      ? partnershipId
      : 'temp'
    const filePath = `${sanitizedFolder}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = createApiClient({ useServiceRole: true })

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('partnership-documents')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Partnership upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      fileUrl: uploadData.path,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Server error during partnership upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
