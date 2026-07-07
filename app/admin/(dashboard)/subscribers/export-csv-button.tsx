'use client'

import React from 'react'
import { Download } from 'lucide-react'

export default function ExportCsvButton({ subscribers }: { subscribers: any[] }) {
  const handleExport = () => {
    if (!subscribers || subscribers.length === 0) return

    const headers = ['Email', 'Name', 'Verified', 'Subscribed', 'Date']
    const rows = subscribers.map((sub) => [
      sub.email || '',
      sub.name || '',
      sub.verified ? 'Yes' : 'No',
      sub.subscribed ? 'Yes' : 'No',
      sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={!subscribers || subscribers.length === 0}
      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  )
}
