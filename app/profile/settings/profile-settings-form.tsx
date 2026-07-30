'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, FileText, Loader2, Save, Camera, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateUserProfile } from '@/lib/supabase/profile-actions'
import type { UserProfile } from '@/lib/supabase/profile-actions'
import { toast } from 'sonner'

interface ProfileSettingsFormProps {
  initialProfile: UserProfile | undefined
  userEmail: string
}

export function ProfileSettingsForm({ initialProfile, userEmail }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || '',
    phone: initialProfile?.phone || '',
    location: initialProfile?.location || '',
    bio: initialProfile?.bio || '',
    avatar_url: initialProfile?.avatar_url || '',
    cover_image_url: initialProfile?.cover_image_url || '',
  })

  const handleImageUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') setUploadingAvatar(true)
    else setUploadingCover(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.success && data.url) {
        // Update local state
        setFormData((prev) => ({
          ...prev,
          [type === 'avatar' ? 'avatar_url' : 'cover_image_url']: data.url,
        }))
        
        // Update profile in database immediately
        await updateUserProfile({
          [type === 'avatar' ? 'avatar_url' : 'cover_image_url']: data.url,
        })
        
        toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover image'} uploaded successfully!`)
        
        // Refresh the page to update all components
        router.refresh()
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to upload ${type === 'avatar' ? 'profile picture' : 'cover image'}`)
    } finally {
      if (type === 'avatar') setUploadingAvatar(false)
      else setUploadingCover(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      handleImageUpload(file, 'avatar')
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }
      handleImageUpload(file, 'cover')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateUserProfile(formData)

      if (result.success) {
        toast.success('Profile updated successfully!')
        router.push('/profile')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const displayName = formData.full_name || userEmail.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          Cover Image
        </label>
        <div className="relative h-48 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors bg-muted/30">
          {formData.cover_image_url ? (
            <img
              src={formData.cover_image_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-accent/20">
              <p className="text-sm text-muted-foreground">No cover image</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="gap-2"
            >
              {uploadingCover ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Change Cover
                </>
              )}
            </Button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground">Recommended: 1200x400px, Max 10MB</p>
      </div>

      {/* Avatar Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-background object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Upload profile picture</h3>
            <p className="text-sm text-muted-foreground mb-3">
              JPG, PNG or GIF. Max 5MB.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="full_name" className="text-sm font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Location
        </label>
        <input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="City, Country"
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading || uploadingAvatar || uploadingCover}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading || uploadingAvatar || uploadingCover}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
