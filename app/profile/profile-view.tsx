'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Calendar, Edit, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase/profile-actions'

interface ProfileViewProps {
  initialProfile: UserProfile | undefined
  user: SupabaseUser
}

export function ProfileView({ initialProfile, user }: ProfileViewProps) {
  const displayName = initialProfile?.full_name || user.email?.split('@')[0] || 'User'
  const avatar = initialProfile?.avatar_url
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          {/* Profile Header with Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/20">
            {initialProfile?.cover_image_url ? (
              <img
                src={initialProfile.cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20" />
            )}
            <div className="absolute -bottom-16 left-8">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-32 h-32 rounded-full border-4 border-background object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button asChild>
                <Link href="/profile/settings">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* Profile Info */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {initialProfile?.phone && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{initialProfile.phone}</p>
                    </div>
                  </div>
                )}

                {initialProfile?.location && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{initialProfile.location}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {initialProfile?.bio && (
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Bio</p>
                    <p className="text-sm">{initialProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats or Additional Info */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Bookings</div>
          </div>
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Consultations</div>
          </div>
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Inquiries</div>
          </div>
        </div>
      </div>
    </div>
  )
}
