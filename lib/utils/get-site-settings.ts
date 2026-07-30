import { createClient } from '@/lib/supabase/server'

/**
 * Get all site settings as a key-value map
 * This is a utility function to fetch settings for public pages
 */
export async function getSiteSettingsMap() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('category', 'site')
    
    if (error) {
      console.error('Error fetching site settings:', error)
      return getDefaultSettings()
    }
    
    if (!settings || settings.length === 0) {
      return getDefaultSettings()
    }
    
    // Convert array to object
    const settingsMap: Record<string, string> = {}
    settings.forEach(setting => {
      try {
        // Parse JSON value
        settingsMap[setting.key] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value
      } catch {
        settingsMap[setting.key] = setting.value
      }
    })
    
    return { ...getDefaultSettings(), ...settingsMap }
  } catch (error) {
    console.error('Error in getSiteSettingsMap:', error)
    return getDefaultSettings()
  }
}

/**
 * Default fallback values for site settings
 */
function getDefaultSettings() {
  return {
    // Basic Information
    site_name: 'Asrivo Tech',
    site_tagline: "Building Tomorrow's Digital Solutions",
    site_description: 'Innovative software development and digital transformation services',
    site_keywords: 'software development, web design, mobile apps',
    
    // Contact Information
    contact_email: 'info@asrivotech.com',
    contact_phone: '+91 8122575337',
    contact_address: 'Madurai, Tamil Nadu, India',
    business_hours: 'Mon-Sat: 9AM-6PM',
    support_email: 'support@asrivotech.com',
    
    // Social Media
    social_linkedin: 'https://linkedin.com/company/asrivotech',
    social_instagram: 'https://instagram.com/asrivotech',
    social_twitter: 'https://twitter.com/asrivotech',
    social_github: 'https://github.com/asrivotech',
    
    // SEO
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
  }
}
