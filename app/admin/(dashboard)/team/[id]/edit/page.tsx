import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditTeamForm from './edit-form'

interface EditTeamPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  return <EditTeamForm member={member} />
}
