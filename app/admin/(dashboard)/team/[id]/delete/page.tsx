import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { deleteTeamMember } from '@/lib/supabase/content-actions'
import { notFound, redirect } from 'next/navigation'
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


interface DeleteTeamPageProps {
  params: Promise<{ id: string }>
}

export default async function DeleteTeamPage({ params }: DeleteTeamPageProps) {
  const { id } = await params
  
  // Guard access on server-side
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect('/admin/team')
  }

  const supabase = await createClient()

  // Fetch details
  const { data: member, error } = await supabase
    .from('team_members')
    .select('id, name, position')
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  const handleDelete = async () => {
    'use server'
    const result = await deleteTeamMember(id)
    if (result.success) {
      redirect('/admin/team')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/team" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Delete Confirmation</span>
      </div>

      <div className="bg-card border border-destructive/30 rounded-2xl p-6 shadow-xl text-center space-y-6">
        <div className="w-14 h-14 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto text-destructive">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Remove Team Profile?</h1>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong className="text-foreground">{member.name}</strong> ({member.position})? 
            This profile will be permanently deleted from the directory page.
          </p>
        </div>

        <form action={handleDelete} className="flex gap-3">
          <Link href="/admin/team" className="flex-1 bg-muted hover:bg-muted text-foreground text-sm font-semibold py-2.5 rounded-xl border border-border transition-all text-center block">
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-foreground text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </form>
      </div>
    </div>
  )
}
