'use client'

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2, RefreshCw, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TeamImageUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const MAX_FILE_SIZE_MB = 2
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export default function TeamImageUpload({
  value,
  onChange,
  disabled = false,
}: TeamImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showManualUrl, setShowManualUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file constraints
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.'
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return `File size is too large (${actualSizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
    }

    return null
  }

  // Handle uploading the validated file
  const handleUpload = async (file: File) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const validationError = validateFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    setUploadProgress(`Uploading ${file.name} (${(file.size / 1024).toFixed(0)} KB)...`)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Get active access token from Supabase client session if available
      let token: string | undefined
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        token = session?.access_token
      } catch (sessionErr) {
        // Fallback to cookie-only authentication
      }

      const response = await fetch('/api/admin/team/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload image. Please try again.')
      }

      // Successfully uploaded
      onChange(result.url)
      setSuccessMessage('Image uploaded successfully (under 2 MB limit).')
    } catch (err) {
      console.error('Image upload error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !uploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || uploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemoveImage = () => {
    onChange('')
    setErrorMessage(null)
    setSuccessMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        id="team-image-file-input"
      />

      {/* Upload Zone / Preview Area */}
      {value ? (
        /* Image Preview State */
        <div className="relative rounded-2xl border border-border bg-card p-4 transition-all shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-background/50 shadow-md flex items-center justify-center">
                <img
                  src={value}
                  alt="Team member preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on broken image
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Info & Action Buttons */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Image Selected
                </span>
                <span className="text-[11px] text-muted-foreground">Max 2 MB enforced</span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-md font-mono" title={value}>
                {value}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {uploading ? 'Uploading...' : 'Replace Image'}
                </button>

                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-red-400 border border-destructive/20 transition-all disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-border bg-card hover:border-indigo-500/50 hover:bg-muted/40'
          } ${disabled || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Upload Icon with animated ring */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isDragging
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-muted text-muted-foreground group-hover:bg-indigo-600/10 group-hover:text-indigo-400'
              }`}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              ) : (
                <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
              )}
            </div>

            {/* Instruction Texts */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {uploading ? (
                  uploadProgress || 'Uploading image...'
                ) : (
                  <>
                    <span className="text-indigo-400 font-bold group-hover:underline">
                      Click to upload
                    </span>{' '}
                    or drag & drop
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP, or GIF (strictly max 2 MB)
              </p>
            </div>

            {/* Constraint Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-400">
              <span>Constraint:</span>
              <strong className="text-indigo-300">Max 2 MB</strong>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-300">Upload Constraint Error</p>
            <p className="text-red-200/90 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Manual URL toggle fallback */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="w-3 h-3" />
          {showManualUrl ? 'Hide manual URL input' : 'Or enter an external image URL manually'}
        </button>

        {showManualUrl && (
          <div className="mt-2 space-y-1.5">
            <input
              type="url"
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                setErrorMessage(null)
              }}
              disabled={disabled || uploading}
              placeholder="https://example.com/team-photo.jpg"
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground">
              Provide a direct image link if you prefer not uploading to Supabase Storage.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
