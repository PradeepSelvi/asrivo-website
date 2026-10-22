'use client'

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, ExternalLink, Link2 } from 'lucide-react'

interface ResumeUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  required?: boolean
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_FILE_SIZE_MB = 10

export default function ResumeUpload({
  value,
  onChange,
  disabled = false,
  required = false,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null)
  const [showManualLink, setShowManualLink] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate that the file is strictly a PDF and under size limit
  const validatePdf = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const isPdfType = file.type === 'application/pdf' || ext === 'pdf'

    if (!isPdfType) {
      return 'Invalid file format. Resume must be in PDF format (.pdf).'
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return `File size is too large (${actualSizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
    }

    return null
  }

  const handleUpload = async (file: File) => {
    setErrorMessage(null)

    const validationError = validatePdf(file)
    if (validationError) {
      setErrorMessage(validationError)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    const sizeKB = (file.size / 1024).toFixed(0)
    setUploadProgress(`Uploading ${file.name} (${sizeKB} KB)...`)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/job-applications/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload resume. Please try again.')
      }

      setUploadedFileName(file.name)
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`)
      onChange(result.url)
    } catch (err) {
      console.error('Resume upload error:', err)
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

  const handleRemove = () => {
    onChange('')
    setUploadedFileName(null)
    setUploadedFileSize(null)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Hidden File Input strictly accepting PDF */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        id="resume-pdf-file-input"
      />

      {value ? (
        /* Uploaded Resume State */
        <div className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                    {uploadedFileName || value.split('/').pop() || 'Resume.pdf'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    PDF Uploaded
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {uploadedFileSize || 'PDF Document'} &bull; Ready for submission
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Replace PDF
              </button>

              <button
                type="button"
                disabled={disabled || uploading}
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-red-500 border border-destructive/20 transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
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
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all group ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40'
          } ${disabled || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isDragging
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-primary/10 text-primary group-hover:bg-primary/20'
              }`}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {uploading ? (
                  uploadProgress || 'Uploading PDF resume...'
                ) : (
                  <>
                    <span className="text-primary font-bold group-hover:underline">
                      Click to upload resume
                    </span>{' '}
                    or drag & drop
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF format only (.pdf) &bull; Maximum file size 10 MB {required && <span className="text-destructive">*</span>}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Document Format Required</span>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Upload Error</p>
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

      {/* Manual Link fallback option */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowManualLink(!showManualLink)}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="w-3 h-3" />
          {showManualLink ? 'Hide link option' : 'Or enter a link to your resume (Google Drive, Dropbox)'}
        </button>

        {showManualLink && (
          <div className="mt-2 space-y-1.5">
            <input
              type="url"
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                setErrorMessage(null)
              }}
              disabled={disabled || uploading}
              placeholder="https://drive.google.com/..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground">
              Make sure link sharing is set to "Anyone with the link can view"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
