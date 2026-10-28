import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { createApiClient } from '@/lib/supabase/api-client'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'project-images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
])

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
}

export async function POST(request: NextRequest) {
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
        const supabase = createApiClient({ useServiceRole: true })
        const { data: tokenData } = await supabase.auth.getUser(token)
        if (tokenData?.user) {
          const { data: profile } = await supabase
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
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      )
    }

    // 2. Read multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file was provided.' },
        { status: 400 }
      )
    }

    // 3. File size constraint validation
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10 MB limit (Selected: ${sizeMB} MB). Please choose a smaller image.`,
        },
        { status: 400 }
      )
    }

    // 4. File type validation (strictly jpg, jpeg, png)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file format. Only JPG, JPEG, and PNG images are allowed.',
        },
        { status: 400 }
      )
    }

    // 5. Generate secure, unique filename
    const ext = EXTENSION_MAP[file.type] || 'jpg'
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`
    const safePath = `projects/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = createApiClient({ useServiceRole: true })

    // 6. Upload file to Supabase private storage bucket
    let { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(safePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '31536000',
      })

    // If bucket doesn't exist, auto-create it as private with strict MIME types
    if (error && error.message.toLowerCase().includes('bucket not found')) {
      console.warn(`Bucket "${BUCKET_NAME}" not found. Creating it as private...`)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      })

      if (!createError) {
        const retryResult = await supabase.storage
          .from(BUCKET_NAME)
          .upload(safePath, buffer, {
            contentType: file.type,
            upsert: false,
            cacheControl: '31536000',
          })
        data = retryResult.data
        error = retryResult.error
      }
    }

    if (error) {
      console.error('Supabase project image upload error:', error.message)
      return NextResponse.json(
        { success: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    // 7. Return the proxy URL that securely serves this private image
    const servedUrl = `/api/projects/images/${safePath}`

    return NextResponse.json({
      success: true,
      url: servedUrl,
      path: safePath,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Admin project upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error during upload.',
      },
      { status: 500 }
    )
  }
}
