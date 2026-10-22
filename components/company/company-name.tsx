/**
 * CompanyName Component
 * Renders company name with consistent branding
 * Uses centralized config to prevent inconsistencies
 */

import { COMPANY } from '@/config/company'

interface CompanyNameProps {
  variant?: 'legal' | 'display' | 'short'
  className?: string
}

export function CompanyName({ 
  variant = 'display',
  className = ''
}: CompanyNameProps) {
  const name = COMPANY.name[variant]
  
  return (
    <span className={className}>
      {name}
    </span>
  )
}
