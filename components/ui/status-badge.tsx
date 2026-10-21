import { getStatusConfig, type StatusVariant } from '@/lib/utils/status-config'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
  size?: 'sm' | 'md'
}

/**
 * StatusBadge component
 * Displays a styled badge for status values using centralized config
 * 
 * @example
 * <StatusBadge status="new" />
 * <StatusBadge status="in_progress" size="sm" />
 */
export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span
      className={cn(
        'inline-block rounded-full font-bold uppercase tracking-wider w-fit',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  )
}
