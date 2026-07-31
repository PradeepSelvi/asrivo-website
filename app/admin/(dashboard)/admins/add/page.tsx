import React from 'react'
import { addAdmin, getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import AddAdminForm from './add-admin-form'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function AddAdminPage() {
  // Server-side gate: only high admins can reach this page
  const adminResult = await getCurrentAdmin()
  
  if (!adminResult.success || !adminResult.user) {
    redirect('/admin/login?error=unauthorized')
  }
  
  if (adminResult.user.role !== 'high') {
    redirect('/admin')
  }

  async function handleAddAdmin(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'high' | 'low'

    const result = await addAdmin(email, role, password || undefined)

    // Don't redirect automatically - let the user see the generated password
    if (result.success) {
      revalidatePath('/admin/admins')
    }

    return result
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/admins" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add Administrator</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create a new administrator account.</p>
        </div>
      </div>

      <AddAdminForm handleAddAdmin={handleAddAdmin} />
    </div>
  )
}
