/**
 * WhatsAppLink Component
 * Renders WhatsApp link with company number
 * Uses centralized config to prevent inconsistencies
 */

import { getWhatsAppLink } from '@/config/company'
import { MessageCircle } from 'lucide-react'

interface WhatsAppLinkProps {
  message?: string
  showIcon?: boolean
  className?: string
  children?: React.ReactNode
}

export function WhatsAppLink({ 
  message,
  showIcon = true,
  className = '',
  children
}: WhatsAppLinkProps) {
  return (
    <a
      href={getWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 hover:text-primary transition-colors ${className}`}
    >
      {showIcon && <MessageCircle className="h-4 w-4" />}
      {children || 'Chat on WhatsApp'}
    </a>
  )
}
