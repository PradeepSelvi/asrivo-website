import { createClient } from '@/lib/supabase/server'

/**
 * Get all site settings as a key-value map
 * This is a utility function to fetch settings for public pages
 */
export async function getSiteSettingsMap() {
  try {
    const supabase = await createClient()
    
    // Table uses setting_key / setting_value — no category column
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')

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
      if (setting.setting_key) {
        settingsMap[setting.setting_key] = setting.setting_value
      }
    })

    return { ...getDefaultSettings(), ...settingsMap }
  } catch (error) {
    console.error('Error in getSiteSettingsMap:', error)
    return getDefaultSettings()
  }
}

/**
 * Get homepage settings as a key-value map
 * Fetches dynamic content for the homepage (hero, CTA, etc.)
 */
export async function getHomepageSettings() {
  try {
    const supabase = await createClient()
    
    // For now, just return defaults since we're using the careers-focused site_settings table
    // The homepage settings should eventually be in a proper CMS or settings table
    return getDefaultHomepageSettings()
    
    /* Disabled until we have a proper homepage settings table
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('category', 'homepage')
    
    if (error) {
      // Table doesn't exist yet or other error - using defaults
      if (error.code === '42P01') {
        console.warn('⚠️  site_settings table not found. Run the migration: supabase/migrations/create_site_settings_table.sql')
      } else {
        console.error('Error fetching homepage settings:', error)
      }
      return getDefaultHomepageSettings()
    }
    
    if (!settings || settings.length === 0) {
      return getDefaultHomepageSettings()
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
    
    return { ...getDefaultHomepageSettings(), ...settingsMap }
    */
  } catch (error) {
    console.error('Error in getHomepageSettings:', error)
    return getDefaultHomepageSettings()
  }
}

/**
 * Default fallback values for homepage settings
 */
function getDefaultHomepageSettings() {
  return {
    // Hero Section
    hero_title: "Building Tomorrow's Digital Solutions",
    hero_subtitle: 'We transform ideas into powerful digital experiences through innovative software solutions.',
    hero_cta_primary: 'Start Your Project',
    hero_cta_secondary: 'View Our Work',
    
    // Featured Projects Section
    featured_projects_title: 'Featured Projects',
    featured_projects_description: 'Explore some of our recent projects that showcase our expertise and innovation.',
    
    // About Section
    about_title: 'Why Choose Asrivo Tech',
    about_description: 'We are a team of passionate developers and designers committed to delivering exceptional digital solutions.',
    
    // CTA Section
    cta_title: 'Ready to Build Something Amazing?',
    cta_description: "Let's discuss your project and turn your vision into reality.",
    cta_button: 'Get Started Today',
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
    contact_phone: '+91 99764 22558',
    contact_address: 'Madurai, Tamil Nadu, India',
    business_hours: 'Mon-Sat: 9AM-6PM',
    support_email: 'support@asrivotech.com',
    
    // Social Media
    social_linkedin: 'https://linkedin.com/company/asrivotech',
    social_instagram: 'https://instagram.com/asrivotech',
    social_twitter: 'https://x.com/asrivotech',
    social_github: 'https://github.com/asrivotech',
    
    // SEO
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
  }
}
