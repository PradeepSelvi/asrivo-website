/**
 * BusinessHours Component
 * Renders company business hours
 * Uses centralized config to prevent inconsistencies
 */

import { COMPANY, getBusinessHours } from '@/config/company'
import { Clock } from 'lucide-react'

interface BusinessHoursProps {
  showIcon?: boolean
  className?: string
  iconClassName?: string
}

export function BusinessHours({ 
  showIcon = true,
  className = '',
  iconClassName = 'h-4 w-4'
}: BusinessHoursProps) {
  return (
    <div className={`inline-flex items-start gap-2 ${className}`}>
      {showIcon && <Clock className={`${iconClassName} mt-1 flex-shrink-0`} />}
      <div>
        <p className="font-medium">{COMPANY.hours.days}</p>
        <p className="text-sm">{COMPANY.hours.time} {COMPANY.hours.timezone}</p>
      </div>
    </div>
  )
}

export function BusinessHoursText({ className = '' }: { className?: string }) {
  return (
    <span className={`whitespace-pre-line ${className}`}>
      {getBusinessHours()}
    </span>
  )
}

export function isSupportAvailable() {
  if (COMPANY.hours.support247) return true
  
  const now = new Date()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  const hour = now.getHours()
  
  // Mon-Sat = 1-6
  if (day === 0) return false // Sunday closed
  
  // 9 AM to 6 PM (9-18)
  return hour >= 9 && hour < 18
}
