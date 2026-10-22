'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ServicesContent } from "@/lib/supabase/content-helpers"
import {
  ArrowRight,
  Code,
  Smartphone,
  Cloud,
  Bot,
  Users,
  Database,
  Cpu,
  CheckCircle2,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

interface Service {
  id: string
  icon: LucideIcon
  title: string
  image: string
  description: string
  features: string[]
}

interface ServicesDisplayProps {
  content: ServicesContent
}

export function ServicesDisplay({ content }: ServicesDisplayProps) {
  // Map content fields to services array structure
  const services: Service[] = [
    {
      id: "software",
      icon: Code,
      title: content.service_1_title,
      image: "/services/software-development.webp",
      description: content.service_1_description,
      features: [
        content.service_1_feature_1,
        content.service_1_feature_2,
        content.service_1_feature_3,
        content.service_1_feature_4,
      ],
    },
    {
      id: "web",
      icon: Code,
      title: content.service_2_title,
      image: "/services/web-development.webp",
      description: content.service_2_description,
      features: [
        content.service_2_feature_1,
        content.service_2_feature_2,
        content.service_2_feature_3,
        content.service_2_feature_4,
      ],
    },
    {
      id: "mobile",
      icon: Smartphone,
      title: content.service_3_title,
      image: "/services/mobile-development.webp",
      description: content.service_3_description,
      features: [
        content.service_3_feature_1,
        content.service_3_feature_2,
        content.service_3_feature_3,
        content.service_3_feature_4,
      ],
    },
    {
      id: "cloud",
      icon: Cloud,
      title: content.service_4_title,
      image: "/services/cloud-devops.webp",
      description: content.service_4_description,
      features: [
        content.service_4_feature_1,
        content.service_4_feature_2,
        content.service_4_feature_3,
        content.service_4_feature_4,
      ],
    },
    {
      id: "ai",
      icon: Bot,
      title: content.service_5_title,
      image: "/services/web-hosting.webp",
      description: content.service_5_description,
      features: [
        content.service_5_feature_1,
        content.service_5_feature_2,
        content.service_5_feature_3,
        content.service_5_feature_4,
      ],
    },
    {
      id: "consulting",
      icon: Users,
      title: content.service_6_title,
      image: "/services/enterprise-consulting.webp",
      description: content.service_6_description,
      features: [
        content.service_6_feature_1,
        content.service_6_feature_2,
        content.service_6_feature_3,
        content.service_6_feature_4,
      ],
    },
    {
      id: "digital-marketing",
      icon: Database,
      title: content.service_7_title,
      image: "/services/digital-marketing.webp",
      description: content.service_7_description,
      features: [
        content.service_7_feature_1,
        content.service_7_feature_2,
        content.service_7_feature_3,
        content.service_7_feature_4,
      ],
    },
    {
      id: "product",
      icon: Cpu,
      title: content.service_8_title,
      image: "/services/product-engineering.webp",
      description: content.service_8_description,
      features: [
        content.service_8_feature_1,
        content.service_8_feature_2,
        content.service_8_feature_3,
        content.service_8_feature_4,
      ],
    },
  ]

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="space-y-16">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className={`scroll-mt-24 grid gap-8 lg:grid-cols-2 lg:gap-16 items-center ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
                  {service.title}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8" asChild>
                  <Link href="/services/inquiry">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                {service.image ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-border relative">
                    <Image
                      src={service.image}
                      alt={`${service.title} Services at AsrivoTech`}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-border">
                    <service.icon className="h-24 w-24 text-primary/20" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
