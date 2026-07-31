import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { redirect, notFound } from 'next/navigation'
import ContactDetailClient from './contact-detail'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function ContactDetailPage({ 
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

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !contact) {
    notFound()
  }

  return <ContactDetailClient contact={contact} />
}
