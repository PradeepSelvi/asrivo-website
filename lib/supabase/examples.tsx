// Example: Using Supabase in a Client Component with Form Submission

'use client'

import { useState } from 'react'
import { submitContactForm } from '@/lib/supabase/actions'

export function ContactFormExample() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: '',
    company: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const result = await submitContactForm(
        formData.email,
        formData.name,
        formData.message,
        formData.company
      )

      if (result.success) {
        setSuccess(true)
        setFormData({ email: '', name: '', message: '', company: '' })
        // Optionally redirect after success
        setTimeout(() => {
          setSuccess(false)
        }, 5000)
      } else {
        setError(result.error || 'Failed to send message')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Message sent successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="company" className="block text-sm font-medium">
          Company (Optional)
        </label>
        <input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
