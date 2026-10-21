/**
 * Centralized status and priority configuration
 * Defines color schemes and labels for status badges across all modules
 */

export type StatusVariant = 
  // Contact statuses
  | 'unread' | 'read' | 'responded'
  // Inquiry statuses
  | 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  // Complaint statuses
  | 'in_progress' | 'resolved' | 'closed'
  // Consultation statuses
  | 'pending' | 'scheduled' | 'completed' | 'cancelled'
  // Lead statuses
  | 'lost'
  // Deal statuses
  | 'negotiation' | 'won'
  // Partnership statuses
  | 'under_review' | 'approved' | 'active' | 'declined'

export type PriorityVariant = 
  | 'urgent' | 'high' | 'medium' | 'low'
  | 'hot' | 'warm' | 'cold'

export interface StatusConfig {
  label: string
  color: string // Tailwind classes for background, text, and border
}

/**
 * Get configuration for a status badge
 * @param status - The status value from the database
 * @returns Status configuration with label and color classes
 */
export function getStatusConfig(status: StatusVariant): StatusConfig {
  const configs: Record<StatusVariant, StatusConfig> = {
    // Contact statuses
    unread: {
      label: 'Unread',
      color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    },
    read: {
      label: 'Read',
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    responded: {
      label: 'Responded',
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },

    // Inquiry statuses
    new: {
      label: 'New',
      color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    },
    contacted: {
      label: 'Contacted',
      color: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    },
    qualified: {
      label: 'Qualified',
      color: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
    },
    converted: {
      label: 'Converted',
      color: 'bg-green-500/10 text-green-600 border border-green-500/20',
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-500/10 text-red-600 border border-red-500/20',
    },

    // Complaint statuses
    in_progress: {
      label: 'In Progress',
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    resolved: {
      label: 'Resolved',
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    closed: {
      label: 'Closed',
      color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    },

    // Consultation statuses
    pending: {
      label: 'Pending',
      color: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    },
    scheduled: {
      label: 'Scheduled',
      color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-500/10 text-green-600 border border-green-500/20',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-500/10 text-red-600 border border-red-500/20',
    },

    // Lead statuses
    lost: {
      label: 'Lost',
      color: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
    },

    // Deal statuses
    negotiation: {
      label: 'Negotiation',
      color: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
    },
    won: {
      label: 'Won',
      color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    },

    // Partnership statuses
    under_review: {
      label: 'Under Review',
      color: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    },
    approved: {
      label: 'Approved',
      color: 'bg-green-500/10 text-green-600 border border-green-500/20',
    },
    active: {
      label: 'Active',
      color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    },
    declined: {
      label: 'Declined',
      color: 'bg-red-500/10 text-red-600 border border-red-500/20',
    },
  }

  return configs[status] || {
    label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    color: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
  }
}

/**
 * Get configuration for a priority badge
 * @param priority - The priority value from the database
 * @returns Priority configuration with label and color classes
 */
export function getPriorityConfig(priority: PriorityVariant): StatusConfig {
  const configs: Record<PriorityVariant, StatusConfig> = {
    // Standard priority levels
    urgent: {
      label: 'Urgent',
      color: 'bg-red-500/20 text-red-500 border border-red-500/30',
    },
    high: {
      label: 'High',
      color: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
    },
    medium: {
      label: 'Medium',
      color: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
    },
    low: {
      label: 'Low',
      color: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
    },

    // Lead temperature priority
    hot: {
      label: 'Hot',
      color: 'bg-red-500/10 text-red-500 border border-red-500/20',
    },
    warm: {
      label: 'Warm',
      color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    },
    cold: {
      label: 'Cold',
      color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    },
  }

  return configs[priority] || {
    label: priority.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    color: 'bg-gray-500/20 text-gray-500 border border-gray-500/30',
  }
}
