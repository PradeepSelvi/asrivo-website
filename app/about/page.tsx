import type { Metadata } from "next"
import { getAboutContent } from "@/lib/supabase/content-helpers"
import { AboutContent } from "./about-content"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAboutContent()
  
  return {
    title: content.meta_title || 'About Asrivo Tech',
    description: content.meta_description || content.hero_subtitle || 'Innovation Meets Excellence',
    keywords: content.meta_keywords,
  }
}

export default async function AboutPage() {
  try {
    const content = await getAboutContent()
    return <AboutContent content={content} />
  } catch (error) {
    console.error('Error loading about page content:', error)
    const content = await getAboutContent() // Helper returns defaults on error
    return <AboutContent content={content} />
  }
}