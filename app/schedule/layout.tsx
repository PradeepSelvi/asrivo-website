import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schedule a Consultation - Asrivo Tech',
  description: 'Book a free 30-minute discovery call with our experts to discuss your project requirements and how we can help bring your vision to life.',
  keywords: ['consultation', 'schedule', 'discovery call', 'project discussion', 'asrivo tech'],
  openGraph: {
    title: 'Schedule a Consultation - Asrivo Tech',
    description: 'Book a free 30-minute discovery call with our experts.',
    type: 'website',
  },
}

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
