'use client'

import { useState } from 'react'

export default function TestAllPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'inquiry' | 'newsletter' | 'view'>('contact')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const testContact = async () => {
    setLoading(true)
    setMessage('Submitting contact...')
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          message: 'This is a test contact message',
          company: 'Test Company',
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Contact submitted! ID: ${data.data[0]?.id}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  const testInquiry = async () => {
    setLoading(true)
    setMessage('Submitting service inquiry...')
    try {
      const response = await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'client@example.com',
          name: 'Test Client',
          company: 'Test Corporation',
          phone: '+1234567890',
          service_type: 'software-dev',
          project_description: 'Build a web application',
          timeline: '3-6-months',
          budget: '$50,000 - $100,000',
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Inquiry submitted! ID: ${data.data[0]?.id}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  const testNewsletter = async () => {
    setLoading(true)
    setMessage('Subscribing to newsletter...')
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `subscriber-${Date.now()}@example.com`,
          name: 'Test Subscriber',
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Subscribed! ID: ${data.data[0]?.id}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  const viewAllContacts = async () => {
    setLoading(true)
    setMessage('Loading contacts...')
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      if (response.ok) {
        setMessage(
          `✅ Found ${data.data.length} contacts:\n\n${JSON.stringify(data.data, null, 2)}`
        )
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🧪 Test All APIs</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'contact' as const, label: '📧 Contact Form' },
            { id: 'inquiry' as const, label: '💼 Service Inquiry' },
            { id: 'newsletter' as const, label: '📰 Newsletter' },
            { id: 'view' as const, label: '👁️ View Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          {activeTab === 'contact' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Test Contact Form</h2>
              <p className="text-gray-400 mb-6">
                Submit a test contact message to the database.
              </p>
              <button
                onClick={testContact}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium"
              >
                {loading ? '⏳ Testing...' : '✉️ Submit Test Contact'}
              </button>
            </div>
          )}

          {activeTab === 'inquiry' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Test Service Inquiry</h2>
              <p className="text-gray-400 mb-6">
                Submit a test service inquiry about software development.
              </p>
              <button
                onClick={testInquiry}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium"
              >
                {loading ? '⏳ Testing...' : '🚀 Submit Test Inquiry'}
              </button>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Test Newsletter Signup</h2>
              <p className="text-gray-400 mb-6">
                Subscribe a test email to the newsletter.
              </p>
              <button
                onClick={testNewsletter}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium"
              >
                {loading ? '⏳ Testing...' : '📬 Subscribe Test Email'}
              </button>
            </div>
          )}

          {activeTab === 'view' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">View All Contacts</h2>
              <p className="text-gray-400 mb-6">
                Retrieve and display all contacts from the database.
              </p>
              <button
                onClick={viewAllContacts}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded font-medium"
              >
                {loading ? '⏳ Loading...' : '📊 Load All Contacts'}
              </button>
            </div>
          )}
        </div>

        {/* Response Message */}
        {message && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-bold mb-2">Response:</h3>
            <pre className="text-gray-300 text-sm overflow-auto max-h-96 whitespace-pre-wrap break-words">
              {message}
            </pre>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-2">💡 Tips:</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>✓ Each test submits real data to your Supabase database</li>
            <li>✓ Check Supabase Dashboard to see the data in tables</li>
            <li>✓ Newsletter emails are unique (time-based to avoid duplicates)</li>
            <li>✓ Service types: software-dev, web-app, mobile-app, cloud-devops, ai-automation, it-consulting</li>
            <li>✓ Job applications and other features available too</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
