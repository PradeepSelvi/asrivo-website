/**
 * PhoneLink Component
 * Renders company phone number with proper formatting
 * Uses centralized config to prevent inconsistencies
 */

import { COMPANY } from '@/config/company'
import { Phone } from 'lucide-react'

interface PhoneLinkProps {
  showIcon?: boolean
  className?: string
  iconClassName?: string
}

export function PhoneLink({ 
  showIcon = true, 
  className = '',
  iconClassName = 'h-4 w-4'
}: PhoneLinkProps) {
  return (
    <a
      href={COMPANY.contact.phone.href}
      className={`inline-flex items-center gap-2 hover:text-primary transition-colors ${className}`}
    >
      {showIcon && <Phone className={iconClassName} />}
      {COMPANY.contact.phone.display}
    </a>
  )
}

export function PhoneNumber({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      {COMPANY.contact.phone.display}
    </span>
  )
}
