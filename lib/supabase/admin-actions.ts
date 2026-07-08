'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Async wrappers for settings — 'use server' files only allow async function exports, not re-exports
export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key', { ascending: true })
  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function updateSetting(key: string, value: string, description?: string, type?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value, description, type, updated_at: new Date().toISOString() })
    .select()
  if (error) return { success: false, error: error.message }
  return { success: true, data }
}


// Internal helper to create a service role client for managing users (auth admin API)
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin operations')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Verify a user has an admin profile (called after client-side sign-in)
export async function verifyAdminProfile(userId: string) {
  try {
    const adminSupabase = await createAdminClient()
    const { data: profile, error } = await adminSupabase
      .from('admin_profiles')
      .select('role, email')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return { success: false, error: 'Unauthorized: You do not have admin access' }
    }

    return { success: true, role: profile.role }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Sign in action for admin users
export async function signInAdmin(email: string, password: string) {
  try {
    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Authentication failed' }
    }

    // Verify user is in admin_profiles using admin client (bypassing RLS during the server action sign-in flow)
    const adminSupabase = await createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('admin_profiles')
      .select('role, email')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      // User is not an admin, sign them out immediately
      await supabase.auth.signOut()
      return { success: false, error: 'Unauthorized: You do not have admin access' }
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

// Sign out action for admin users
export async function signOutAdmin() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

// Get the current logged in admin user and role
export async function getCurrentAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, user: null }
    }

    const adminSupabase = await createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('admin_profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, user: null }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      },
    }
  } catch (error) {
    return { success: false, user: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getAdmins() {
  try {
    const current = await getCurrentAdmin()
    if (!current.success || current.user?.role !== 'high') {
      return { success: false, error: 'Unauthorized: High role required' }
    }

    const adminSupabase = await createAdminClient()
    const { data, error } = await adminSupabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function addAdmin(email: string, role: 'high' | 'low') {
  try {
    const current = await getCurrentAdmin()
    if (!current.success || current.user?.role !== 'high') {
      return { success: false, error: 'Unauthorized: High role required' }
    }

    const adminSupabase = await createAdminClient()

    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'AdminPassword123!',
    })

    if (authError) return { success: false, error: authError.message }
    if (!authUser.user) return { success: false, error: 'Failed to create auth user' }

    // Use service role client — bypasses RLS entirely
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
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function removeAdmin(id: string) {
  try {
    const current = await getCurrentAdmin()
    if (!current.success || current.user?.role !== 'high') {
      return { success: false, error: 'Unauthorized: High role required' }
    }

    if (current.user.id === id) {
      return { success: false, error: 'Cannot remove yourself' }
    }

    const adminSupabase = await createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/admins')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

export async function updateAdminRole(id: string, role: 'high' | 'low') {
  try {
    const current = await getCurrentAdmin()
    if (!current.success || current.user?.role !== 'high') {
      return { success: false, error: 'Unauthorized: High role required' }
    }

    if (current.user.id === id) {
      return { success: false, error: 'Cannot change your own role' }
    }

    const adminSupabase = await createAdminClient()
    const { data, error } = await adminSupabase
      .from('admin_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/admins')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}
