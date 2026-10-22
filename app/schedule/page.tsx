import { MobileBackButton } from "@/components/mobile-back-button"
import { getScheduleContent, getPageContent } from "@/lib/supabase/content-helpers"
import ScheduleClient from "./schedule-client"

// Ensure this page is always rendered dynamically so the calendar
// defaults to the current month, not the month of the last build.
export const dynamic = "force-dynamic"

export default async function SchedulePage() {
  // Fetch CMS content for this page
  const content = await getScheduleContent()

  // Reuse contact page values for phone/email shown in the sidebar
  const contactContent = await getPageContent("contact")
  const contactPhone = contactContent.contact_phone || "+91 99764 22558"
  const contactEmail = contactContent.contact_email || "info@asrivotech.in"

  return (
    <>
      <MobileBackButton />
      <ScheduleClient
        content={content}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
      />
    </>
  )
}
