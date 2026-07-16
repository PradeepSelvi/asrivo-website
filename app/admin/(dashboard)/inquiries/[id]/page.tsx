import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { redirect, notFound } from 'next/navigation'
import InquiryDetailClient from './inquiry-detail'

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const adminResult = await getCurrentAdmin()

  if (!adminResult.success || !adminResult.user) {
    redirect('/admin/login')
  }

  const isHigh = adminResult.user.role === 'high'

  const { data: inquiry, error } = await supabase
    .from('service_inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !inquiry) {
    notFound()
  }

  return <InquiryDetailClient inquiry={inquiry} isHigh={isHigh} />
}
