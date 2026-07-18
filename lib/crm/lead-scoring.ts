/**
 * Lead Scoring Algorithm
 * Calculates a score from 0-100 based on various lead attributes
 */

export interface LeadScoringInput {
  company_size?: string
  company_revenue?: string
  job_title?: string
  industry?: string
  lead_source?: string
  contact_attempts?: number
  last_contacted_at?: string
  phone?: string
  company_name?: string
  company_website?: string
  email_domain?: string
}

export function calculateLeadScore(lead: LeadScoringInput): number {
  let score = 0
  
  // Company Size (0-25 points)
  if (lead.company_size === 'enterprise') score += 25
  else if (lead.company_size === 'medium') score += 20
  else if (lead.company_size === 'small') score += 15
  else if (lead.company_size === 'startup') score += 10
  
  // Revenue Potential (0-15 points)
  if (lead.company_revenue) {
    if (lead.company_revenue.includes('10M+') || lead.company_revenue.includes('100M+')) score += 15
    else if (lead.company_revenue.includes('5M') || lead.company_revenue.includes('1M')) score += 10
    else score += 5
  }
  
  // Job Title/Seniority (0-15 points)
  if (lead.job_title) {
    const title = lead.job_title.toLowerCase()
    if (title.includes('ceo') || title.includes('founder') || title.includes('owner')) score += 15
    else if (title.includes('cto') || title.includes('cfo') || title.includes('vp') || title.includes('director')) score += 12
    else if (title.includes('manager') || title.includes('head')) score += 8
    else score += 4
  }
  
  // Lead Source Quality (0-15 points)
  if (lead.lead_source === 'referral') score += 15
  else if (lead.lead_source === 'partner') score += 12
  else if (lead.lead_source === 'event') score += 10
  else if (lead.lead_source === 'linkedin') score += 8
  else if (lead.lead_source === 'website') score += 6
  else if (lead.lead_source === 'cold-outreach') score += 3
  
  // Engagement Level (0-10 points)
  if (lead.contact_attempts && lead.contact_attempts > 0) {
    score += Math.min(lead.contact_attempts * 2, 10)
  }
  
  // Recent Activity Bonus (0-5 points)
  if (lead.last_contacted_at) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceContact <= 7) score += 5
    else if (daysSinceContact <= 30) score += 3
  }
  
  // Profile Completeness (0-10 points)
  let completeness = 0
  if (lead.phone) completeness += 2
  if (lead.company_name) completeness += 2
  if (lead.company_website) completeness += 2
  if (lead.industry) completeness += 2
  if (lead.job_title) completeness += 2
  score += completeness
  
  // Email Domain Quality (0-5 points)
  if (lead.email_domain) {
    const domain = lead.email_domain.toLowerCase()
    // Corporate email vs free email providers
    const freeProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'aol']
    const isFreeEmail = freeProviders.some(provider => domain.includes(provider))
    if (!isFreeEmail) score += 5
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Suggest priority level based on score
 */
export function getPriorityFromScore(score: number): 'hot' | 'warm' | 'cold' | 'medium' {
  if (score >= 80) return 'hot'
  if (score >= 60) return 'warm'
  if (score >= 40) return 'medium'
  return 'cold'
}

/**
 * Get score breakdown explanation
 */
export function getScoreBreakdown(lead: LeadScoringInput): Array<{ category: string, points: number, max: number, reason: string }> {
  const breakdown: Array<{ category: string, points: number, max: number, reason: string }> = []
  
  // Company Size
  let companySizePoints = 0
  if (lead.company_size === 'enterprise') companySizePoints = 25
  else if (lead.company_size === 'medium') companySizePoints = 20
  else if (lead.company_size === 'small') companySizePoints = 15
  else if (lead.company_size === 'startup') companySizePoints = 10
  
  breakdown.push({
    category: 'Company Size',
    points: companySizePoints,
    max: 25,
    reason: lead.company_size ? `Company size: ${lead.company_size}` : 'No company size provided',
  })
  
  // Lead Source
  let sourcePoints = 0
  if (lead.lead_source === 'referral') sourcePoints = 15
  else if (lead.lead_source === 'partner') sourcePoints = 12
  else if (lead.lead_source === 'event') sourcePoints = 10
  else if (lead.lead_source === 'linkedin') sourcePoints = 8
  else if (lead.lead_source === 'website') sourcePoints = 6
  else if (lead.lead_source === 'cold-outreach') sourcePoints = 3
  
  breakdown.push({
    category: 'Lead Source',
    points: sourcePoints,
    max: 15,
    reason: lead.lead_source ? `Source: ${lead.lead_source}` : 'No lead source tracked',
  })
  
  // Job Title
  let titlePoints = 0
  if (lead.job_title) {
    const title = lead.job_title.toLowerCase()
    if (title.includes('ceo') || title.includes('founder') || title.includes('owner')) titlePoints = 15
    else if (title.includes('cto') || title.includes('cfo') || title.includes('vp') || title.includes('director')) titlePoints = 12
    else if (title.includes('manager') || title.includes('head')) titlePoints = 8
    else titlePoints = 4
  }
  
  breakdown.push({
    category: 'Decision Maker',
    points: titlePoints,
    max: 15,
    reason: lead.job_title || 'No job title provided',
  })
  
  // Engagement
  const engagementPoints = lead.contact_attempts ? Math.min(lead.contact_attempts * 2, 10) : 0
  breakdown.push({
    category: 'Engagement',
    points: engagementPoints,
    max: 10,
    reason: `${lead.contact_attempts || 0} contact attempts`,
  })
  
  // Profile Completeness
  let completeness = 0
  const fields: string[] = []
  if (lead.phone) { completeness += 2; fields.push('phone') }
  if (lead.company_name) { completeness += 2; fields.push('company') }
  if (lead.company_website) { completeness += 2; fields.push('website') }
  if (lead.industry) { completeness += 2; fields.push('industry') }
  if (lead.job_title) { completeness += 2; fields.push('title') }
  
  breakdown.push({
    category: 'Profile Completeness',
    points: completeness,
    max: 10,
    reason: fields.length > 0 ? `Has: ${fields.join(', ')}` : 'Incomplete profile',
  })
  
  return breakdown
}

/**
 * Auto-update lead score
 */
export function shouldUpdateScore(lastScoreUpdate?: string): boolean {
  if (!lastScoreUpdate) return true
  
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastScoreUpdate).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Update score if it's been more than 7 days
  return daysSinceUpdate > 7
}

/**
 * Get recommended next actions based on score
 */
export function getRecommendedActions(score: number, status: string): string[] {
  const actions: string[] = []
  
  if (score >= 80) {
    actions.push('Schedule a demo call immediately')
    actions.push('Send personalized proposal')
    actions.push('Assign to senior sales rep')
  } else if (score >= 60) {
    actions.push('Schedule discovery call')
    actions.push('Send case studies relevant to their industry')
    actions.push('Add to nurture campaign')
  } else if (score >= 40) {
    actions.push('Gather more information')
    actions.push('Send educational content')
    actions.push('Schedule follow-up in 1 week')
  } else {
    actions.push('Qualify lead further')
    actions.push('Add to long-term nurture campaign')
    actions.push('Request more details about their needs')
  }
  
  if (status === 'new') {
    actions.unshift('Make first contact within 24 hours')
  }
  
  return actions
}
