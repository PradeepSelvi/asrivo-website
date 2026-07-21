import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Phone, Mail, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Consultations - Admin",
  description: "Manage consultation requests",
}

export default async function ConsultationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Fetch consultations
  const { data: consultations, error } = await supabase
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching consultations:", error)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            {status}
          </span>
        )
    }
  }

  const getStatusCount = (status: string) => {
    return consultations?.filter((c) => c.status === status).length || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultation Requests</h1>
        <p className="text-muted-foreground">
          Manage and track client consultation bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{getStatusCount("pending")}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{getStatusCount("confirmed")}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{getStatusCount("completed")}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold">{consultations?.length || 0}</p>
        </div>
      </div>

      {/* Consultations List */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">All Consultation Requests</h2>
        </div>

        {!consultations || consultations.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No consultations yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Consultation requests will appear here when clients book appointments.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{consultation.name}</h3>
                          {getStatusBadge(consultation.status)}
                        </div>
                        <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${consultation.email}`}
                              className="hover:text-primary"
                            >
                              {consultation.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${consultation.phone}`}
                              className="hover:text-primary"
                            >
                              {consultation.phone}
                            </a>
                          </div>
                          {consultation.whatsapp && (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>WhatsApp: {consultation.whatsapp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p suppressHydrationWarning>{new Date(consultation.created_at).toLocaleDateString()}</p>
                        <p suppressHydrationWarning>{new Date(consultation.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Availability:</p>
                        <p className="text-sm mt-1">{consultation.availability}</p>
                      </div>

                      {consultation.preferred_modes && consultation.preferred_modes.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Preferred Modes:</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {consultation.preferred_modes.map((mode: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              >
                                {mode.replace("-", " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {consultation.message && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Message:</p>
                          <p className="text-sm mt-1 line-clamp-2">{consultation.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-col">
                    <Button size="sm" asChild className="flex-1 lg:flex-none">
                      <Link href={`/admin/consultations/${consultation.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
