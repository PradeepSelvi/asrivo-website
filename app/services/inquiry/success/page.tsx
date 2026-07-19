'use client'

import { useEffect } from 'react'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function InquirySuccessPage() {
  // Clear saved form data when success page loads
  useEffect(() => {
    localStorage.removeItem('inquiry_form_data')
    localStorage.removeItem('inquiry_form_step')
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Inquiry Submitted Successfully!
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for your interest in our services. We've received your project details and our team will review them shortly. We'll get back to you within 24 hours via your preferred contact method.
        </p>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-2">What happens next?</h2>
          <ul className="text-left text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>Our team reviews your requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>We'll contact you to discuss your project in detail</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>We'll provide you with a customized proposal and timeline</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>Once approved, we'll kick off your project!</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-all"
          >
            View Services
          </Link>
        </div>
      </div>
    </div>
  )
}
