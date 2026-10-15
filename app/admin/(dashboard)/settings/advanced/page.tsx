import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileCode, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Advanced Settings - Admin Panel',
}

const envVars = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL (required for all DB & auth operations)',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous/public key for client-side queries',
    required: true,
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key for server-side admin operations',
    required: true,
  },
  {
    key: 'GMAIL_USER',
    description: 'Gmail address used to send notification emails',
    required: false,
  },
  {
    key: 'GMAIL_APP_PASSWORD',
    description: 'Gmail app-specific password for SMTP authentication',
    required: false,
  },
  {
    key: 'ADMIN_EMAIL',
    description: 'Destination email for admin notifications',
    required: false,
  },
  {
    key: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    description: 'Google reCAPTCHA v2/v3 site key (public)',
    required: false,
  },
  {
    key: 'RECAPTCHA_SECRET_KEY',
    description: 'Google reCAPTCHA secret key (server-side verification)',
    required: false,
  },
  {
    key: 'NEXT_PUBLIC_ABSTRACT_API_KEY',
    description: 'AbstractAPI key for email validation on registration',
    required: false,
  },
]

export default async function AdvancedSettingsPage() {
  const user = await requireAdmin()

  if (user.role !== 'high') {
    redirect('/admin')
  }

  // Check presence only — never expose values
  const envStatus = envVars.map((v) => ({
    ...v,
    isSet: Boolean(process.env[v.key]),
  }))

  const requiredMissing = envStatus.filter((v) => v.required && !v.isSet)
  const optionalMissing = envStatus.filter((v) => !v.required && !v.isSet)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileCode className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Advanced Settings</h1>
            <p className="text-sm text-muted-foreground">Environment variables and developer configuration</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status summary */}
          {requiredMissing.length > 0 && (
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
              <strong>⚠ {requiredMissing.length} required variable{requiredMissing.length > 1 ? 's are' : ' is'} missing:</strong>{' '}
              {requiredMissing.map((v) => v.key).join(', ')}. The app may not function correctly.
            </div>
          )}
          {optionalMissing.length > 0 && (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
              <strong>{optionalMissing.length} optional variable{optionalMissing.length > 1 ? 's are' : ' is'} missing.</strong>{' '}
              Some features (email notifications, CAPTCHA, email validation) will be disabled.
            </div>
          )}

          {/* Variables table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/50">
              <h2 className="font-semibold text-foreground">Environment Variables</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Values are never displayed here — only whether each variable is set.
                Edit your <code className="font-mono bg-muted px-1 rounded">.env</code> file to add missing variables.
              </p>
            </div>
            <div className="divide-y divide-border">
              {envStatus.map((v) => (
                <div key={v.key} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                  <div className="mt-0.5 shrink-0">
                    {v.isSet ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className={`w-5 h-5 ${v.required ? 'text-red-500' : 'text-amber-500'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono text-foreground">{v.key}</code>
                      {v.required && (
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                          required
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        v.isSet
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : v.required
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {v.isSet ? '✓ Set' : '✗ Not set'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to set env vars */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">How to Set Environment Variables</h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open the <code className="font-mono bg-muted px-1 rounded">.env</code> file in the project root</li>
              <li>Add the missing variable: <code className="font-mono bg-muted px-1 rounded">KEY=value</code></li>
              <li>Restart the dev server for changes to take effect</li>
              <li>For production, set variables in your hosting provider (Vercel, Netlify, etc.)</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">
              See <code className="font-mono bg-muted px-1 rounded">.env.example</code> for a full list of supported variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
