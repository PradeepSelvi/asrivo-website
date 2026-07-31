import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { Plus, User } from 'lucide-react'
import Link from 'next/link'
import TeamDndList from './team-dnd-list'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function AdminTeamPage() {
  const supabase = await createClient()
  const adminResult = await getCurrentAdmin()
  const isHigh = adminResult.user?.role === 'high'

  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team profiles. Drag to reorder.</p>
        </div>
        {isHigh && (
          <Link href="/admin/team/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Member
          </Link>
        )}
      </div>

      {!isHigh && (
        <div className="border border-blue-900/40 bg-blue-950/30 rounded-xl px-5 py-4 text-sm text-blue-300 flex items-center gap-3">
          <span className="text-lg">ℹ️</span>
          You have <strong>Editor</strong> access. You can edit and reorder member profiles but cannot create or delete them.
        </div>
      )}

      {error && <p className="text-destructive text-sm">Error: {error.message}</p>}
      {!error && (!members || members.length === 0) ? (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
          <User className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-semibold">No team members yet.</p>
        </div>
      ) : (
        members && <TeamDndList members={members} isHigh={isHigh} />
      )}
    </div>
  )
}
