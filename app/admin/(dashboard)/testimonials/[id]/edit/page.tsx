import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { notFound, redirect } from 'next/navigation'
import EditTestimonialForm from './edit-form'

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params
  
  // Gate check
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || !adminResult.user) {
    redirect('/admin/testimonials')
  }

  const supabase = await createClient()

  // Fetch the testimonial details
  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !testimonial) {
    notFound()
  }

  // Fetch all projects for the select dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .order('title', { ascending: true })

  return <EditTestimonialForm testimonial={testimonial} projects={projects || []} />
}
