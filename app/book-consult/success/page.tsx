import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Calendar, Mail, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Consultation Scheduled - Asrivo Tech",
  description: "Your consultation request has been submitted successfully.",
}

export default function ConsultationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
          Consultation Request Received!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for scheduling a consultation with Asrivo Tech. 
          We&apos;ve received your request and will review your availability.
        </p>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">What Happens Next?</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Review</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will review your consultation request and availability within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive a confirmation email with the scheduled date, time, and meeting link.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Consultation</h3>
                <p className="text-sm text-muted-foreground">
                  Join the consultation at the scheduled time to discuss your project with our experts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" asChild>
            <Link href="/">
              <ArrowRight className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/book-consult/check-status">
              <Search className="mr-2 h-4 w-4" />
              Check Status
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="mailto:info@asrivotech.com" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Mail className="h-4 w-4" />
            info@asrivotech.com
          </a>
        </div>
      </div>
    </div>
  )
}
