import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { redirect, notFound } from 'next/navigation'
import ComplaintDetailClient from './complaint-detail'

export default async function ComplaintDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  const adminResult = await getCurrentAdmin()

  if (!adminResult.success || !adminResult.user) {
    redirect('/admin/login')
  }

  const isHigh = adminResult.user.role === 'high'

  const { data: complaint, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !complaint) {
    notFound()
  }

  return <ComplaintDetailClient complaint={complaint} isHigh={isHigh} />
}
