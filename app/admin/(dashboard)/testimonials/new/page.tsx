import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { redirect } from 'next/navigation'
import NewTestimonialForm from './new-form'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function NewTestimonialPage() {
  // Gate check
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect('/admin/testimonials')
  }

  const supabase = await createClient()

  // Fetch all projects for the select dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .order('title', { ascending: true })

  return <NewTestimonialForm projects={projects || []} />
}
