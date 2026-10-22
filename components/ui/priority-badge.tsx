import { getPriorityConfig, type PriorityVariant } from '@/lib/utils/status-config'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: PriorityVariant
  className?: string
  size?: 'sm' | 'md'
}

/**
 * PriorityBadge component
 * Displays a styled badge for priority values using centralized config
 * 
 * @example
 * <PriorityBadge priority="urgent" />
 * <PriorityBadge priority="hot" size="sm" />
 */
export function PriorityBadge({ priority, className, size = 'md' }: PriorityBadgeProps) {
  const config = getPriorityConfig(priority)
  
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
