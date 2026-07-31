import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ConsultationDetail } from "./consultation-detail"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export const metadata = {
  title: "Consultation Details - Admin",
  description: "View and manage consultation request details",
}

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { id } = await params

  // Fetch consultation
  const { data: consultation, error } = await supabase
    .from("consultation_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !consultation) {
    notFound()
  }

  return <ConsultationDetail consultation={consultation} />
}
