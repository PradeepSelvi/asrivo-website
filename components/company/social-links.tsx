/**
 * SocialLinks Component
 * Renders company social media links
 * Uses centralized config to prevent inconsistencies
 */

import { COMPANY } from '@/config/company'
import { Linkedin, Github, Twitter, Instagram, Mail } from 'lucide-react'

const iconMap = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  email: Mail,
}

interface SocialLinksProps {
  className?: string
  iconClassName?: string
  showLabels?: boolean
}

export function SocialLinks({ 
  className = 'flex gap-4',
  iconClassName = 'h-5 w-5',
  showLabels = false
}: SocialLinksProps) {
  const socials = [
    { name: 'LinkedIn', key: 'linkedin' as const, href: COMPANY.social.linkedin },
    { name: 'GitHub', key: 'github' as const, href: COMPANY.social.github },
    { name: 'X (Twitter)', key: 'twitter' as const, href: COMPANY.social.twitter },
    { name: 'Instagram', key: 'instagram' as const, href: COMPANY.social.instagram },
    { name: 'Email', key: 'email' as const, href: COMPANY.social.email },
  ].filter(social => social.href) // Only show configured socials

  return (
    <div className={className}>
      {socials.map((social) => {
        const Icon = iconMap[social.key]
        return (
          <a
            key={social.key}
            href={social.href}
            target={social.key !== 'email' ? '_blank' : undefined}
            rel={social.key !== 'email' ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label={social.name}
          >
            <Icon className={iconClassName} />
            {showLabels && <span>{social.name}</span>}
          </a>
        )
      })}
    </div>
  )
}

export function SocialLink({ 
  platform,
  className = '',
  iconClassName = 'h-5 w-5'
}: { 
  platform: keyof typeof COMPANY.social
  className?: string
  iconClassName?: string
}) {
  const href = COMPANY.social[platform]
  if (!href) return null

  const Icon = iconMap[platform]
  const names = {
    linkedin: 'LinkedIn',
    github: 'GitHub', 
    twitter: 'X (Twitter)',
    instagram: 'Instagram',
    email: 'Email',
  }

  return (
    <a
      href={href}
      target={platform !== 'email' ? '_blank' : undefined}
      rel={platform !== 'email' ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center justify-center hover:text-primary transition-colors ${className}`}
      aria-label={names[platform]}
    >
      <Icon className={iconClassName} />
    </a>
  )
}
