import type { Metadata } from "next"
import { getContactContent } from "@/lib/supabase/content-helpers"
import ContactPageClient from "./contact-client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactContent()
  
  return {
    title: content.meta_title || 'Get in Touch - Asrivo Tech',
    description: content.meta_description || content.hero_subtitle || "Have a project in mind or want to learn more about our services? We'd love to hear from you.",
    keywords: content.meta_keywords,
  }
}

export default async function ContactPage() {
  try {
    const content = await getContactContent()
    return <ContactPageClient content={content} />
  } catch (error) {
    console.error('Error loading contact page content:', error)
    const content = await getContactContent() // Helper returns defaults on error
    return <ContactPageClient content={content} />
  }
}
