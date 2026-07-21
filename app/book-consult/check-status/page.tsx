import { ConsultationStatusChecker } from "@/components/consultation-status-checker"
import { MobileBackButton } from "@/components/mobile-back-button"
import { Search } from "lucide-react"

export const metadata = {
  title: "Check Consultation Status - Asrivo Tech",
  description: "Check the status of your consultation request",
}

export default function CheckConsultationStatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <MobileBackButton />
      
      <div className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-3">
            Check Consultation Status
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your email address to view the current status of your consultation request and get updates
          </p>
        </div>

        {/* Status Checker */}
        <ConsultationStatusChecker />

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="rounded-lg border bg-card p-6 max-w-2xl mx-auto">
            <h2 className="font-semibold text-lg mb-2">Need Help?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your consultation or need to make changes, 
              feel free to reach out to us.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
              <a 
                href="mailto:info@asrivotech.com" 
                className="text-primary hover:underline"
              >
                info@asrivotech.com
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a 
                href="/contact" 
                className="text-primary hover:underline"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
