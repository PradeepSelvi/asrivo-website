"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, FileText, Loader2, CheckCircle, X } from "lucide-react"
import Link from "next/link"

export default function RaiseComplaintPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [priority, setPriority] = useState('medium')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setUploadError(null)
    
    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('File size must be less than 3MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPEG, PNG, WebP, and PDF files are allowed')
      return
    }

    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/complaints/upload', {
        method: 'POST',
        body: formData,
      })

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        setUploadError('Server returned invalid response')
        setUploadingFile(false)
        return
      }

      if (response.ok) {
        setUploadedFile({ url: result.fileUrl, name: file.name, type: file.type })
      } else {
        console.error('Upload failed:', result)
        setUploadError(result.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload file. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name')?.toString(),
      email: formData.get('email')?.toString(),
      phone: formData.get('phone')?.toString() || null,
      subject: formData.get('subject')?.toString(),
      description: formData.get('description')?.toString(),
      category: formData.get('category')?.toString() || null,
      priority,
      proofDocumentUrl: uploadedFile?.url || null,
    }

    console.log('Submitting complaint data:', data)

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to submit complaint'
        console.error('Submission error:', errorMessage)
        alert(`Error: ${errorMessage}`)
        setLoading(false)
        return
      }

      setSubmitted(true)

    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit complaint')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-foreground">Complaint Submitted!</h3>
            <p className="mt-2 text-muted-foreground">
              Thank you for bringing this to our attention. Our team will review your complaint and respond within 48 hours.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Complaint
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Back to Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 lg:py-20">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/contact">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contact
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Raise a Complaint</h1>
          <p className="text-muted-foreground mt-2">
            Please provide detailed information about your complaint. Our team will review and respond within 48 hours.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (234) 567-890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Brief description of your complaint"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., Service Quality, Billing, Technical Issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General inquiry</SelectItem>
                  <SelectItem value="medium">Medium - Issue affecting work</SelectItem>
                  <SelectItem value="high">High - Significant problem</SelectItem>
                  <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please provide a detailed description of your complaint, including any relevant dates, reference numbers, or specific incidents..."
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofDocument">Proof Document (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload supporting evidence (images or PDF, max 3MB)
              </p>
              
              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                    {uploadedFile.type.startsWith('image/') && (
                      <span className="text-xs text-muted-foreground">(Image)</span>
                    )}
                    {uploadedFile.type === 'application/pdf' && (
                      <span className="text-xs text-muted-foreground">(PDF)</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    id="proofDocument"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="cursor-pointer"
                    disabled={uploadingFile}
                  />
                  {uploadingFile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
              
              {uploadError && (
                <p className="text-xs text-destructive mt-1">{uploadError}</p>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-600">
                <strong>Note:</strong> Please be as specific as possible. Include dates, times, and any supporting information that will help us investigate your complaint effectively.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </Button>
              <Button type="button" variant="outline" size="lg" asChild>
                <Link href="/contact">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
