/**
 * AddressDisplay Component
 * Renders company address
 * Uses centralized config to prevent inconsistencies
 */

import { COMPANY, getFullAddress } from '@/config/company'
import { MapPin } from 'lucide-react'

interface AddressDisplayProps {
  showIcon?: boolean
  className?: string
  iconClassName?: string
  format?: 'full' | 'short'
}

export function AddressDisplay({ 
  showIcon = true,
  className = '',
  iconClassName = 'h-4 w-4',
  format = 'full'
}: AddressDisplayProps) {
  const address = format === 'full' ? getFullAddress() : COMPANY.contact.address.full
  
  return (
    <div className={`inline-flex items-start gap-2 ${className}`}>
      {showIcon && <MapPin className={`${iconClassName} mt-1 flex-shrink-0`} />}
      <span className="whitespace-pre-line">{address}</span>
    </div>
  )
}

export function AddressLink({ 
  showIcon = true,
  className = '',
  iconClassName = 'h-4 w-4'
}: Omit<AddressDisplayProps, 'format'>) {
  return (
    <a
      href={COMPANY.contact.address.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-start gap-2 hover:text-primary transition-colors ${className}`}
    >
      {showIcon && <MapPin className={`${iconClassName} mt-1 flex-shrink-0`} />}
      <span className="whitespace-pre-line">{getFullAddress()}</span>
    </a>
  )
}
