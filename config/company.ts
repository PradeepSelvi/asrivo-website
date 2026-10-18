/**
 * Central company configuration
 * Single source of truth for all company information
 * Update these values and they'll reflect across the entire site
 */

export const COMPANY = {
  // Legal entity information
  name: {
    legal: 'Asrivo Tech',
    display: 'Asrivo Tech',
    short: 'Asrivo Tech',
  },

  // Contact information
  contact: {
    phone: {
      display: '+91 99764 22558',
      whatsapp: '919976422558', // No + or spaces for wa.me link
      href: 'tel:+919976422558',
    },
    email: {
      primary: 'info@asrivotech.com',
      support: 'support@asrivotech.com',
      careers: 'careers@asrivotech.com',
    },
    address: {
      street: '', // TODO: Add full street address
      city: 'Madurai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '', // TODO: Add pincode
      full: 'Madurai, Tamil Nadu, India', // TODO: Update with full address
      coordinates: {
        latitude: 9.9252,
        longitude: 78.1198,
      },
      link: 'https://www.google.com/maps/search/?api=1&query=9.9252,78.1198', // Google Maps link
    },
  },

  // Social media
  social: {
    linkedin: 'https://linkedin.com/company/asrivotech',
    github: 'https://github.com/asrivotech',
    twitter: 'https://x.com/asrivotech', // Updated to x.com
    instagram: 'https://instagram.com/asrivotech',
    email: 'mailto:info@asrivotech.com',
  },

  // Business information
  info: {
    founded: 2025,
    foundedDate: 'August 23, 2025',
    registration: {
      gst: '', // Add GST number when available
      cin: '', // Add CIN when available
    },
    teamSize: 9,
    projectsCompleted: 2,
  },

  // Business hours
  hours: {
    days: 'Monday - Saturday',
    time: '9:00 AM - 6:00 PM',
    timezone: 'IST',
    support247: false, // Set to true if 24/7 support is available
  },

  // Statistics (for homepage)
  stats: {
    services: 9,
    projectsCompleted: 2,
    reliability: 99.9,
    support: '24/7',
    yearsExperience: 1,
    clientsServed: 2,
    teamMembers: 9,
  },

  // Legal & compliance
  legal: {
    privacyOfficer: {
      name: '', // TODO: Add Grievance Officer name
      email: '', // TODO: Add Grievance Officer email
      phone: '', // TODO: Add Grievance Officer phone
    },
    governingLaw: 'India',
    dataProtection: 'Digital Personal Data Protection Act, 2023',
  },
} as const

// Helper functions
export const getWhatsAppLink = (message?: string) => {
  const baseUrl = `https://wa.me/${COMPANY.contact.phone.whatsapp}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}

export const getFullAddress = () => {
  const { street, city, state, country, pincode } = COMPANY.contact.address
  if (!street) return COMPANY.contact.address.full
  return [street, city, state, pincode, country].filter(Boolean).join(', ')
}

export const getBusinessHours = () => {
  return `${COMPANY.hours.days}\n${COMPANY.hours.time} ${COMPANY.hours.timezone}`
}

export const isAcceptingProjects = () => {
  // Always returns true - update logic if needed
  return true
}

export const getCurrentQuarter = () => {
  const month = new Date().getMonth()
  return Math.floor(month / 3) + 1
}
