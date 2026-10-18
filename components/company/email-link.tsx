/**
 * EmailLink Component
 * Renders company email links
 * Uses centralized config to prevent inconsistencies
 */

import { COMPANY } from '@/config/company'
import { Mail } from 'lucide-react'

interface EmailLinkProps {
  type?: 'primary' | 'support' | 'careers'
  showIcon?: boolean
  className?: string
  iconClassName?: string
}

export function EmailLink({ 
  type = 'primary',
  showIcon = true,
  className = '',
  iconClassName = 'h-4 w-4'
}: EmailLinkProps) {
  const email = COMPANY.contact.email[type]
  
  return (
    <a
      href={`mailto:${email}`}
      className={`inline-flex items-center gap-2 hover:text-primary transition-colors ${className}`}
      aria-label={`Email us at ${email}`}
    >
      {showIcon && <Mail className={iconClassName} />}
      {email}
    </a>
  )
}

export function EmailAddress({ 
  type = 'primary',
  className = '' 
}: { 
  type?: 'primary' | 'support' | 'careers'
  className?: string 
}) {
  return (
    <span className={className}>
      {COMPANY.contact.email[type]}
    </span>
  )
}
