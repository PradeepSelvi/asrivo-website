'use client'

import { useEffect } from 'react'

export function DynamicMetadata() {
  useEffect(() => {
    // Fetch settings and update document title
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const { site_name, site_tagline } = data.data
          if (site_name && site_tagline) {
            document.title = `${site_name} - ${site_tagline}`
          }
        }
      })
      .catch(err => console.error('Error loading metadata:', err))
  }, [])

  return null // This component doesn't render anything
}
