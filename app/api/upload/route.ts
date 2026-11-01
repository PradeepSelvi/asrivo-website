import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth-middleware'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { uploadRateLimit } from '@/lib/utils/rate-limit'
import { randomBytes } from 'crypto'
import { issueUploadCapability } from '@/lib/utils/upload-capability'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Designated submission buckets permitted for anonymous/public uploads (Finding F-018 / CWE-862)
const PUBLIC_SUBMISSION_BUCKETS = new Set([
  'inquiry-documents',
])

// Managed media buckets requiring administrator authorization
const MANAGED_MEDIA_BUCKETS = new Set([
  'project-images',
  'team-members',
])

// User-specific bucket requiring authenticated ownership
const USER_PROFILE_BUCKET = 'user-profiles'

// Strictly allowed buckets across the application upload endpoint
const ALLOWED_BUCKETS = new Set([
  ...PUBLIC_SUBMISSION_BUCKETS,
  ...MANAGED_MEDIA_BUCKETS,
  USER_PROFILE_BUCKET,
])

// Strictly allowed folders per bucket (Finding F-017 / CWE-22 Path Traversal Prevention)
const ALLOWED_FOLDERS_BY_BUCKET: Record<string, Set<string>> = {
  'inquiry-documents': new Set(['', 'prds', 'documents']),
  'user-profiles': new Set(['avatars', 'covers']),
  'team-members': new Set(['', 'photos']),
  'project-images': new Set(['', 'covers', 'gallery']),
}

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

    // Validate bucket — prevent arbitrary bucket access (path traversal & authorization bypass)
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

    // Determine uploader identity and session (CWE-862 / CWE-863)
    let authUser: { id: string; email?: string } | null = null
    let serverSupabase: Awaited<ReturnType<typeof createServerClient>> | null = null
    try {
      serverSupabase = await createServerClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
      if (user) {
        authUser = { id: user.id, email: user.email }
      }
    } catch {
      // Anonymous submission
    }

    // ── Authorization Gate (Finding F-018 / CWE-862) ──────────────────────────
    // 1. Anonymous uploads are strictly limited to designated submission buckets
    if (!authUser && !PUBLIC_SUBMISSION_BUCKETS.has(bucketInput)) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for protected storage destination.' },
        { status: 401 }
      )
    }

    // 2. Managed media buckets require verified administrator authorization
    if (MANAGED_MEDIA_BUCKETS.has(bucketInput)) {
      const adminAuth = await requireAdmin(request)
      if (adminAuth.error) return adminAuth.error
    }

    // 3. User profile uploads require authenticated ownership
    if (bucketInput === USER_PROFILE_BUCKET && !authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for user profile uploads.' },
        { status: 401 }
      )
    }

    const emailInput = (formData.get('email') as string | null)?.trim() || authUser?.email || null

    // Strictly validate folder to prevent path traversal, bucket escape, or filename truncation (CWE-22)
    const rawFolder = (formData.get('folder') as string | null)?.trim() ?? ''
    if (rawFolder) {
      // Reject percent escapes, dot segments, backslashes, URL query/fragment delimiters
      if (
        rawFolder.includes('%') ||
        rawFolder.includes('.') ||
        rawFolder.includes('\\') ||
        rawFolder.includes('#') ||
        rawFolder.includes('?') ||
        rawFolder.includes(':') ||
        rawFolder.includes('@')
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid folder path. Traversal, escapes, and URL delimiters are prohibited.' },
          { status: 400 }
        )
      }

      const segments = rawFolder.split('/').filter(Boolean)
      if (segments.length > 2) {
        return NextResponse.json(
          { success: false, error: 'Folder depth exceeds allowed limit.' },
          { status: 400 }
        )
      }

      for (const segment of segments) {
        if (!/^[a-zA-Z0-9_-]{1,50}$/.test(segment)) {
          return NextResponse.json(
            { success: false, error: 'Folder segment contains invalid characters.' },
            { status: 400 }
          )
        }
      }

      const normalizedFolder = segments.join('/')
      const allowedFolders = ALLOWED_FOLDERS_BY_BUCKET[bucketInput]
      if (allowedFolders && !allowedFolders.has(normalizedFolder)) {
        return NextResponse.json(
          { success: false, error: 'Folder is not permitted for the selected bucket.' },
          { status: 400 }
        )
      }
    }

    // Derive server-controlled folder prefix and storage client according to destination
    let folder = ''
    let storage = createApiClient({ useServiceRole: true }).storage

    if (bucketInput === USER_PROFILE_BUCKET) {
      // Enforce authenticated ownership: profile folders are strictly derived from verified user ID
      const profileType = rawFolder === 'covers' ? 'covers' : 'avatars'
      folder = `${profileType}/${authUser!.id}`
      // Use caller-scoped session storage client for profile ownership
      if (serverSupabase) {
        storage = serverSupabase.storage
      }
    } else if (bucketInput === 'inquiry-documents') {
      // Designated submission bucket: enforce server-selected prefix ('prds' or 'documents')
      folder = (rawFolder === 'documents' || rawFolder === 'prds') ? rawFolder : 'prds'
    } else {
      // Managed media buckets (admin verified)
      folder = rawFolder ? rawFolder.split('/').filter(Boolean).join('/') : ''
    }

    // Generate safe filename immutably bound to user identity if authenticated
    const ext = EXT_MAP[file.type] ?? 'bin'
    let fileName: string
    if (bucketInput === 'inquiry-documents' && authUser) {
      fileName = `prd_${authUser.id}_${Date.now()}_${randomBytes(6).toString('hex')}.${ext}`
    } else if (bucketInput === 'inquiry-documents') {
      fileName = `prd_pub_${Date.now()}_${randomBytes(8).toString('hex')}.${ext}`
    } else {
      fileName = `${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`
    }
    const safePath = folder ? `${folder}/${fileName}` : fileName

    // Verify that the final path strictly ends with the generated filename and contains no traversal sequences
    if (
      !safePath.endsWith(fileName) ||
      safePath.includes('..') ||
      safePath.includes('\\') ||
      safePath.includes('#') ||
      safePath.includes('?') ||
      safePath.includes('%')
    ) {
      return NextResponse.json({ success: false, error: 'Invalid final storage path.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await storage
      .from(bucketInput)
      .upload(safePath, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('Supabase storage error:', error.message)
      return NextResponse.json({ success: false, error: 'Upload failed.' }, { status: 500 })
    }

    // Verify the storage provider did not mutate the approved object path
    if (data.path !== safePath) {
      console.error('Storage path mismatch detected:', { expected: safePath, actual: data.path })
      return NextResponse.json({ success: false, error: 'Upload destination verification failed.' }, { status: 500 })
    }

    const { data: { publicUrl } } = storage.from(bucketInput).getPublicUrl(data.path)

    // Issue cryptographic upload capability token for inquiry documents (Finding F-012 / CWE-863)
    let uploadToken: string | null = null
    if (bucketInput === 'inquiry-documents') {
      uploadToken = issueUploadCapability({
        bucket: bucketInput,
        path: data.path,
        userId: authUser?.id || null,
        email: emailInput,
      })
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      uploadToken,
    })
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
