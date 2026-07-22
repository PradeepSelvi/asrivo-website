"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react"

interface Consultation {
  id: number
  name: string
  email: string
  phone: string
  whatsapp: string | null
  availability: string
  preferred_modes: string[]
  message: string | null
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  meeting_link: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export function ConsultationDetail({ consultation: initialConsultation }: { consultation: Consultation }) {
  const router = useRouter()
  const [consultation, setConsultation] = useState(initialConsultation)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/consultations/${consultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: consultation.status,
          scheduled_date: consultation.scheduled_date,
          scheduled_time: consultation.scheduled_time,
          meeting_link: consultation.meeting_link,
          notes: consultation.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Update failed:", data)
        throw new Error(data.error || "Failed to update")
      }

      alert("Consultation updated successfully!")
      setEditMode(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating consultation:", error)
      alert(`Failed to update consultation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/consultations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Consultation Details</h1>
            <p className="text-muted-foreground">ID: #{consultation.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Full Name</Label>
                <p className="text-lg font-medium mt-1">{consultation.name}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <a
                    href={`mailto:${consultation.email}`}
                    className="flex items-center gap-2 text-sm mt-1 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {consultation.email}
                  </a>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <a
                    href={`tel:${consultation.phone}`}
                    className="flex items-center gap-2 text-sm mt-1 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {consultation.phone}
                  </a>
                </div>
              </div>

              {consultation.whatsapp && (
                <div>
                  <Label className="text-muted-foreground text-xs">WhatsApp</Label>
                  <a
                    href={`https://wa.me/${consultation.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm mt-1 text-primary hover:underline"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {consultation.whatsapp}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Request Details</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Availability</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {consultation.availability}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Preferred Connection Modes</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {consultation.preferred_modes.map((mode, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {mode.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>

              {consultation.message && (
                <div>
                  <Label className="text-muted-foreground text-xs">Additional Message</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap bg-muted p-3 rounded-md">
                    {consultation.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Scheduling Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={consultation.scheduled_date || ""}
                  onChange={(e) =>
                    setConsultation({ ...consultation, scheduled_date: e.target.value })
                  }
                  disabled={!editMode}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="scheduled_time">Scheduled Time</Label>
                <Input
                  id="scheduled_time"
                  type="text"
                  value={consultation.scheduled_time || ""}
                  onChange={(e) =>
                    setConsultation({ ...consultation, scheduled_time: e.target.value })
                  }
                  disabled={!editMode}
                  placeholder="e.g., 2:00 PM EST"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  value={consultation.meeting_link || ""}
                  onChange={(e) =>
                    setConsultation({ ...consultation, meeting_link: e.target.value })
                  }
                  disabled={!editMode}
                  placeholder="https://meet.google.com/..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={consultation.notes || ""}
                  onChange={(e) =>
                    setConsultation({ ...consultation, notes: e.target.value })
                  }
                  disabled={!editMode}
                  placeholder="Add internal notes about this consultation..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Current Status</Label>
                {editMode ? (
                  <Select
                    value={consultation.status}
                    onValueChange={(value) =>
                      setConsultation({ ...consultation, status: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusColor(
                        consultation.status
                      )}`}
                    >
                      {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground text-xs">Created</Label>
                <p className="mt-1" suppressHydrationWarning>
                  {new Date(consultation.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Last Updated</Label>
                <p className="mt-1" suppressHydrationWarning>
                  {new Date(consultation.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
