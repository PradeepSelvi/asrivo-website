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
        className={`group rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-8 transition-all duration-500 relative overflow-hidden ${
          featured 
            ? 'border-primary/30 shadow-2xl shadow-primary/20 hover:shadow-3xl hover:border-primary/50 scale-[1.05] z-10' 
            : 'border-primary/20 shadow-lg hover:shadow-2xl hover:border-primary/40'
        }`}
        style={{ transform, transition: 'transform 0.1s ease-out' }}
      >
        {/* Premium animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent transition-opacity duration-500 ${featured ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'}`} />
        
        {/* Enhanced glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-tr-2xl" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          {/* Premium Avatar with multiple rings */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm scale-125" />
            
            {/* Featured premium spotlight */}
            {featured && (
              <>
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-primary/50 via-accent/30 to-primary/50 blur-2xl opacity-80 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 blur-lg opacity-60" />
              </>
            )}
            
            <div className={`relative h-36 w-36 overflow-hidden rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-500 ${
              featured 
                ? 'from-primary/50 to-accent/50 ring-4 ring-primary/50 shadow-2xl shadow-primary/40 group-hover:ring-primary/70 group-hover:scale-110 group-hover:shadow-accent/50' 
                : 'from-primary/40 to-accent/40 ring-4 ring-primary/30 shadow-lg group-hover:ring-primary/60 group-hover:scale-110'
            }`}>
                {showInitials ? (
                  <span className="text-3xl font-bold text-primary select-none">{initials}</span>
                ) : (
                  <img
                    src={avatarSrc!}
                    alt={`${name} profile`}
                    className="h-full w-full object-cover object-center"
                    onError={() => setImgError(true)}
                  />
                )}
            </div>
            
            {/* Enhanced floating particles */}
            <div className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-500 shadow-lg" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-gradient-to-br from-accent to-primary opacity-0 group-hover:opacity-100 animate-float-reverse transition-opacity duration-500 shadow-lg" />
            <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-primary/60 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500" />
          </div>
          
          <h3 className="mt-8 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
          <p className="text-sm font-semibold text-primary/90 mt-1">{role}</p>

          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors max-w-full px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30"
              aria-label={`Email ${name}`}
            >
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          )}

          {bio && (
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{bio}</p>
          )}
          
          {/* Enhanced social links */}
          <div className="mt-7 flex justify-center gap-3">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/80 text-muted-foreground transition-all duration-300 hover:from-[#0077B5] hover:to-[#005885] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-[#0077B5]/40"
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
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/80 text-muted-foreground transition-all duration-300 hover:from-[#333] hover:to-[#1a1a1a] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-gray-500/40"
                aria-label={`${name}'s GitHub profile`}
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/80 text-muted-foreground transition-all duration-300 hover:from-[#EA4335] hover:to-[#c5351f] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-[#EA4335]/40"
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

  // Use management card style for all team members
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

        {email && (
          <a
            href={`mailto:${email}`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground hover:text-primary transition-colors max-w-full px-3 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/60"
            aria-label={`Email ${name}`}
          >
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{email}</span>
          </a>
        )}

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
