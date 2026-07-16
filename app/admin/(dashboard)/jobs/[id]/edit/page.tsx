import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditJobForm from './edit-form'

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    notFound()
  }

  return <EditJobForm job={job} />
}
