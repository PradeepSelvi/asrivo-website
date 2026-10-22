/**
 * ServiceCard Component
 * Renders a service card with consistent styling
 * Uses config/services.ts as single source of truth
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Service, getServiceLink } from '@/config/services'

interface ServiceCardProps {
  service: Service
  className?: string
}

export function ServiceCard({ service, className = '' }: ServiceCardProps) {
  return (
    <Link
      href={getServiceLink(service)}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 ${className}`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
            {/* Icon placeholder - will be dynamic based on service.icon */}
            <div className="h-7 w-7 text-primary" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
        
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-3">
          {service.title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {service.description}
        </p>
        
        {service.features && service.features.length > 0 && (
          <ul className="space-y-2">
            {service.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1 shrink-0">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  )
}

export function ServicesList({ 
  services,
  columns = 3,
  className = ''
}: { 
  services: Service[]
  columns?: 2 | 3 | 4
  className?: string
}) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid gap-8 ${gridCols[columns]} ${className}`}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}
