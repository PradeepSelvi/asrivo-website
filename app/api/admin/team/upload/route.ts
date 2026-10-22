import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { createApiClient } from '@/lib/supabase/api-client'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'team-members'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB constraint

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication (supports cookies, Authorization Bearer token)
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

    // 3. Strict 2 MB constraint validation
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 2 MB limit (Selected file: ${sizeMB} MB). Please choose an image smaller than 2 MB.`,
        },
        { status: 400 }
      )
    }

    // 4. File type validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file format. Allowed formats: JPG, PNG, WebP, and GIF.',
        },
        { status: 400 }
      )
    }

    // 5. Generate secure, unique filename
    const ext = EXTENSION_MAP[file.type] || 'jpg'
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`
    const safePath = `avatars/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = createApiClient({ useServiceRole: true })

    // 6. Upload file to Supabase storage
    let { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(safePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600',
      })

    // If bucket doesn't exist, auto-create it with 2MB limit and retry
    if (error && error.message.toLowerCase().includes('bucket not found')) {
      console.warn(`Bucket "${BUCKET_NAME}" not found. Creating it now...`)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      })

      if (!createError) {
        const retryResult = await supabase.storage
          .from(BUCKET_NAME)
          .upload(safePath, buffer, {
            contentType: file.type,
            upsert: false,
            cacheControl: '3600',
          })
        data = retryResult.data
        error = retryResult.error
      }
    }

    if (error) {
      console.error('Supabase team member image upload error:', error.message)
      return NextResponse.json(
        { success: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    // 7. Generate public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data?.path || safePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data?.path || safePath,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Admin team upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error during upload.',
      },
      { status: 500 }
    )
  }
}
