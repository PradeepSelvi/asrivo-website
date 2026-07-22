'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

// Cached admin client - only create once per request
const getAdminClient = cache(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
})

// ============================================================================
// SETTINGS
// ============================================================================

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key', { ascending: true })
  
  return error ? { success: false, error: error.message } : { success: true, data }
}

export async function updateSetting(key: string, value: string, description?: string, type?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value, description, type, updated_at: new Date().toISOString() })
    .select()
  
  return error ? { success: false, error: error.message } : { success: true, data }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function verifyAdminProfile(userId: string) {
  try {
    const adminSupabase = await getAdminClient()
    const { data: profile } = await adminSupabase
      .from('admin_profiles')
      .select('role, email')
      .eq('id', userId)
      .single()

    return profile 
      ? { success: true, role: profile.role }
      : { success: false, error: 'Unauthorized: No admin access' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getCurrentAdmin() {
  try {
    const supabase = await createClient()
    
    // Get user with error handling
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('getCurrentAdmin: Auth error:', userError.message)
      return { success: false, user: null }
    }

    if (!user) {
      return { success: false, user: null }
    }

    // Get admin profile
    const adminSupabase = await getAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('admin_profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('getCurrentAdmin: Profile error:', profileError?.message)
      return { success: false, user: null }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || profile.email,
        role: profile.role,
      },
    }
  } catch (error) {
    console.error('getCurrentAdmin: Unexpected error:', error)
    return { success: false, user: null }
  }
}

export async function signOutAdmin() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  return error ? { success: false, error: error.message } : { success: true }
}

// ============================================================================
// ADMIN MANAGEMENT
// ============================================================================

export async function getAdmins() {
  const current = await getCurrentAdmin()
  if (!current.success || current.user?.role !== 'high') {
    return { success: false, error: 'Unauthorized: High role required' }
  }

  const adminSupabase = await getAdminClient()
  const { data, error } = await adminSupabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return error ? { success: false, error: error.message } : { success: true, data }
}

export async function addAdmin(email: string, role: 'high' | 'low') {
  // Verify current admin first - this uses the user's session
  const current = await getCurrentAdmin()
  if (!current.success || current.user?.role !== 'high') {
    return { success: false, error: 'Unauthorized: High role required' }
  }

  try {
    // Use a completely separate admin client instance
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: 'Server configuration error' }
    }

    // Create a fresh admin client for this operation only
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'TempPass123!', // Default temporary password
    })

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || 'Failed to create user' }
    }

    const { data, error } = await adminSupabase
      .from('admin_profiles')
      .insert({ id: authUser.user.id, email, role })
      .select()

    if (error) {
      await adminSupabase.auth.admin.deleteUser(authUser.user.id)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/admins')
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create admin' 
    }
  }
}

export async function removeAdmin(id: string) {
  const current = await getCurrentAdmin()
  if (!current.success || current.user?.role !== 'high') {
    return { success: false, error: 'Unauthorized: High role required' }
  }

  if (current.user.id === id) {
    return { success: false, error: 'Cannot remove yourself' }
  }

  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.auth.admin.deleteUser(id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/admins')
  return { success: true }
}

export async function updateAdminRole(id: string, role: 'high' | 'low') {
  const current = await getCurrentAdmin()
  if (!current.success || current.user?.role !== 'high') {
    return { success: false, error: 'Unauthorized: High role required' }
  }

  if (current.user.id === id) {
    return { success: false, error: 'Cannot change your own role' }
  }

  const adminSupabase = await getAdminClient()
  const { data, error } = await adminSupabase
    .from('admin_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/admins')
  return { success: true, data }
}
