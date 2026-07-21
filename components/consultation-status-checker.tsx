"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, CheckCircle2, Clock, XCircle, Calendar, Phone, Mail } from "lucide-react"

interface ConsultationResult {
  id: number
  name: string
  email: string
  phone: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  meeting_link: string | null
  created_at: string
  preferred_modes: string[]
}

export function ConsultationStatusChecker() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConsultationResult | null>(null)
  const [error, setError] = useState("")

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`/api/consultations/status?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check status")
      }

      if (!data.data) {
        setError("No consultation found with this email address")
      } else {
        setResult(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-600">
            <Clock className="h-4 w-4" />
            Pending Review
          </div>
        )
      case "confirmed":
        return (
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-600">
            <CheckCircle2 className="h-4 w-4" />
            Confirmed
          </div>
        )
      case "completed":
        return (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
        )
      case "cancelled":
        return (
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600">
            <XCircle className="h-4 w-4" />
            Cancelled
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            {status}
          </div>
        )
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "We've received your consultation request and will review it shortly. We typically respond within 24 hours."
      case "confirmed":
        return "Your consultation has been confirmed! Check your email for the meeting details."
      case "completed":
        return "Your consultation has been completed. Thank you for choosing our services!"
      case "cancelled":
        return "This consultation has been cancelled. Please contact us if you have any questions."
      default:
        return "Your consultation request is being processed."
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Check Consultation Status</CardTitle>
        <CardDescription>
          Enter your email address to check the status of your consultation request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check Status
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{result.name}</h3>
                  <p className="text-sm text-muted-foreground">Request ID: #{result.id}</p>
                </div>
                {getStatusBadge(result.status)}
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {getStatusMessage(result.status)}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{result.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{result.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span suppressHydrationWarning>
                    Submitted: {new Date(result.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {result.scheduled_date && result.scheduled_time && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Scheduled Meeting</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(result.scheduled_date).toLocaleDateString()} at {result.scheduled_time}
                      </span>
                    </div>
                    {result.meeting_link && (
                      <a
                        href={result.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              )}

              {result.preferred_modes && result.preferred_modes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Preferred Connection Modes</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.preferred_modes.map((mode, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {mode.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-600">
                💡 Check your email regularly for updates about your consultation. If you have any questions, 
                contact us at <a href="mailto:info@asrivotech.com" className="underline">info@asrivotech.com</a>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
