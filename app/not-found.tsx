import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  )
}
