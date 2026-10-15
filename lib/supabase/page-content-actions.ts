'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { revalidatePath } from 'next/cache'

// Helper function to verify permissions
async function checkAuthAndPermission(requiredRole?: 'high') {
  const authResult = await getCurrentAdmin()
  
  // Only throw for auth failures (session invalid/expired)
  if (!authResult.success || !authResult.user) {
    throw new Error('AUTH_REQUIRED')
  }
  
  // For role check failures, return null instead of throwing
  if (requiredRole === 'high' && authResult.user.role !== 'high') {
    return null
  }
  
  return authResult.user
}

// ==========================================
// PAGE CONTENT CMS ACTIONS
// ==========================================

/**
 * Saves page content updates to the database
 * @param pageSlug - The page identifier (e.g., 'home', 'about', 'services')
 * @param updates - Object with section_key as keys and content_value as values
 * @returns Success/error response
 */
export async function savePageContent(
  pageSlug: string,
  updates: Record<string, string>
) {
  try {
    await checkAuthAndPermission() // Any admin can update content
    const supabase = await createClient()

    // Upsert each content field as a separate row
    for (const [sectionKey, contentValue] of Object.entries(updates)) {
      const { error } = await supabase
        .from('page_content')
        .upsert(
          {
            page_slug: pageSlug,
            section_key: sectionKey,
            content_value: contentValue,
            is_active: true,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'page_slug,section_key'
          }
        )

      if (error) throw new Error(error.message)
    }

    // Invalidate cache for both public page and admin content page
    const pageRoutes: Record<string, string> = {
      home: '/',
      about: '/about',
      services: '/services',
      contact: '/contact',
      projects: '/projects',
      team: '/team',
      careers: '/careers'
    }

    const publicRoute = pageRoutes[pageSlug] || `/${pageSlug}`
    revalidatePath(publicRoute)
    revalidatePath('/admin/content')

    return { success: true }
  } catch (error: any) {
    if (error.message === 'AUTH_REQUIRED') {
      return {
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'AUTH_EXPIRED'
      }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Fetches all content for a page in edit-friendly format
 * @param pageSlug - The page identifier
 * @returns Object with section_key as keys and content_value as values
 */
export async function getPageContentForEdit(
  pageSlug: string
): Promise<{ success: boolean; data?: Record<string, string>; error?: string; code?: string }> {
  try {
    await checkAuthAndPermission() // Any admin can view content for editing
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('page_content')
      .select('section_key, content_value')
      .eq('page_slug', pageSlug)
      .eq('is_active', true)

    if (error) throw new Error(error.message)

    // Convert array of rows to key-value object
    const contentObject: Record<string, string> = {}
    if (data) {
      data.forEach(row => {
        contentObject[row.section_key] = row.content_value
      })
    }

    return { success: true, data: contentObject }
  } catch (error: any) {
    if (error.message === 'AUTH_REQUIRED') {
      return {
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'AUTH_EXPIRED'
      }
    }
    return { success: false, error: error.message }
  }
}
