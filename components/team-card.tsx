"use client"

import { useState } from "react"
import { Linkedin, Github, Mail } from "lucide-react"
import { useTilt } from "@/hooks/use-scroll-animation"

interface TeamCardProps {
  name: string
  role: string
  image?: string
  bio?: string
  linkedin?: string
  github?: string
  email?: string
  variant?: "management" | "team"
  index?: number
  featured?: boolean
}

export function TeamCard({
  name,
  role,
  image,
  bio,
  linkedin,
  github,
  email,
  variant = "team",
  index = 0,
  featured = false,
}: TeamCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarSrc = image?.trim() ? image.trim() : null
  const [imgError, setImgError] = useState(false)
  const showInitials = !avatarSrc || imgError
  const { ref: tiltRef, transform } = useTilt(8)

  if (variant === "management") {
    return (
      <div 
        ref={tiltRef}
        className={`group rounded-2xl border bg-card p-8 transition-all duration-500 relative overflow-hidden ${
          featured 
            ? 'border-primary/20 shadow-xl shadow-primary/10 hover:shadow-2xl hover:border-primary/40 scale-[1.03] z-10' 
            : 'border-border hover:shadow-2xl hover:border-primary/30'
        }`}
        style={{ transform, transition: 'transform 0.1s ease-out' }}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 transition-opacity duration-500 ${featured ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'}`} />
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          {/* Avatar with animated ring */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm scale-110" />
            {/* Featured spotlight glow */}
            {featured && (
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-accent/40 via-primary/20 to-accent/30 blur-xl opacity-70 animate-pulse" style={{ animationDuration: '3s' }} />
            )}
            <div className={`relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-500 ${
              featured 
                ? 'from-primary/40 to-accent/40 ring-4 ring-primary/40 shadow-lg shadow-accent/30 group-hover:ring-primary/60 group-hover:scale-110' 
                : 'from-primary/30 to-accent/30 ring-4 ring-border group-hover:ring-primary/50 group-hover:scale-105'
            }`}>
                {showInitials ? (
                  <span className="text-2xl font-bold text-primary select-none">{initials}</span>
                ) : (
                  <img
                    src={avatarSrc!}
                    alt={`${name} profile`}
                    className="h-full w-full object-cover object-center"
                    onError={() => setImgError(true)}
                  />
                )}
            </div>
            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/50 opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-500" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-accent/50 opacity-0 group-hover:opacity-100 animate-float-reverse transition-opacity duration-500" />
          </div>
          
          <h3 className="mt-6 text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
          <p className="text-sm font-medium text-primary">{role}</p>
          {bio && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{bio}</p>
          )}
          
          {/* Social links with hover effects */}
          <div className="mt-6 flex justify-center gap-3">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#0077B5] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-[#0077B5]/30"
                aria-label={`${name}'s LinkedIn profile`}
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#333] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-gray-500/30"
                aria-label={`${name}'s GitHub profile`}
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#EA4335] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-[#EA4335]/30"
                aria-label={`Email ${name}`}
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={tiltRef}
      className="group rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-xl hover:border-primary/30 relative overflow-hidden"
      style={{ transform, transition: 'transform 0.1s ease-out' }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="relative">
          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-full animate-ripple opacity-0 group-hover:opacity-100 border-2 border-primary/30" />
          <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-border group-hover:ring-primary/40 transition-all duration-500 group-hover:scale-105">
            {showInitials ? (
              <span className="text-xl font-bold text-primary select-none">{initials}</span>
            ) : (
              <img
                src={avatarSrc!}
                alt={`${name} profile`}
                className="h-full w-full object-cover object-center"
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </div>
        
        <h3 className="mt-5 text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-primary font-medium">{role}</p>
        
        {bio && (
          <p className="mt-3 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 max-h-0 group-hover:max-h-24 overflow-hidden">
            {bio}
          </p>
        )}
        
        <div className="mt-4 flex justify-center gap-2">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#0077B5] hover:text-white hover:scale-110"
              aria-label={`${name}'s LinkedIn profile`}
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#333] hover:text-white hover:scale-110"
              aria-label={`${name}'s GitHub profile`}
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#EA4335] hover:text-white hover:scale-110"
              aria-label={`Email ${name}`}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
