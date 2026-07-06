"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Linkedin, Github, Mail, ArrowRight } from "lucide-react"
import { useScrollAnimation, useTilt } from "@/hooks/use-scroll-animation"

const teamMembers = [
 {
    name: "Aswin K A",
    role: "Management Head & HR Manager",
    image: "/team/aswin.jpg",
    bio: "Founder managing HR, administration, finance, and operations with strategic leadership and precision",
    linkedin: "https://www.linkedin.com/in/aswin-k-a-77581a249",
    github: "https://github.com/Aswin4532003",
    email: "aswin453ka@gmail.com",
  },
  {
    name: "Siranjeevi B.U",
    role: "Head - Digital Marketing (SEO, SMO) & HR Executive",
    image: "/team/siranjeevi.jpg",
    bio: "Leading brand growth through expert SEO, SMO strategies, and organizational excellence in talent and HR management.",
    linkedin: "https://www.linkedin.com/in/siranjeevi-bu/",
    github: "https://github.com/siranjj",
    email: "siranjeevi@asrivotech.com",
  },
  {
    name: "Pradeep Kumar M",
    role: "Legal & Compliance Officer",
    image: "/team/pradeep.jpg",
    bio: "Ensuring regulatory compliance, managing legal risks, protecting company integrity and ethical standards.",
    linkedin: "https://www.linkedin.com/in/pradeep-kumar-m/",
    github: "https://github.com/Selvipr",
    email: "pradeep@asrivotech.com",
  },
  {
    name: "Sargunan J.S",
    role: "Chief Operating Officer",
    image: "/team/sargunan.jpg",
    bio: "Strategic operations leader driving efficiency, growth, performance, and scalable business transformation globally.",
    linkedin: "https://www.linkedin.com/in/sargunan-j-s-28915b2a9/",
    github: "https://github.com/Sargunan-js",
    email: "ssunsargunan@gmail.com",
  },
   {
    name: "Hari Haran T.G",
    role: "Full Stack Developer",
    image: "/team/david.jpg",
    bio: "Creating intuitive user experiences",
    linkedin: "https://www.linkedin.com/in/hariharan-t-g-51013a284/",
    github: "https://github.com/21Hari",
    email: "hariharan@asrivotech.com",
  },
  {
    name: "Krishan Kumar B.K",
    role: "Project Manager",
    image: "/team/krishan.jpg",
    bio: "Frontend Developer & Project Manager driving seamless delivery and team coordination.",
    linkedin: "https://www.linkedin.com/in/krishan-kumar-b-k/",
    github: "https://github.com/krishankumar",
    email: "krishan@asrivotech.com",
  },
]
function TeamMemberCard({ member, index }: { member: typeof teamMembers[0]; index: number }) {
  const { ref: tiltRef, transform } = useTilt(6)
  const { ref: scrollRef, isVisible } = useScrollAnimation(0.1)

  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 4)

  return (
    <div
      ref={scrollRef}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        ref={tiltRef}
        className="group rounded-2xl border border-border bg-card p-6 text-center transition-all duration-500 hover:shadow-2xl hover:border-primary/30 relative overflow-hidden"
        style={{ transform, transition: 'transform 0.1s ease-out' }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10" />

        <div className="relative z-10">
          {/* Avatar with animated ring */}
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm scale-110" />
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-4 ring-border group-hover:ring-primary/50 transition-all duration-500 group-hover:scale-105">
              <span className="text-3xl font-bold text-primary transition-transform duration-500 group-hover:scale-110">
                {initials}
              </span>
            </div>
            {/* Floating particles */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/50 opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-500" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-accent/50 opacity-0 group-hover:opacity-100 animate-float-reverse transition-opacity duration-500" />
          </div>
          
          <h3 className="mt-6 text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {member.name}
          </h3>
          <p className="text-sm text-primary font-medium">{member.role}</p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
          
          {/* Social links with hover effects */}
          <div className="mt-5 flex justify-center gap-3">
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#0077B5] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-[#0077B5]/30"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#333] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-gray-500/30"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${member.email}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#EA4335] hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-[#EA4335]/30"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamPreview() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

  return (
    <section className="bg-muted/30 py-24 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-[80px] animate-float-reverse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div 
          ref={titleRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider px-4 py-1.5 bg-primary/5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Our Team
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Meet the <span className="gradient-text">Experts</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Our talented team of professionals is dedicated to delivering exceptional results.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>

        <div className={`mt-16 text-center transition-all duration-700 delay-500 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button size="lg" variant="outline" className="bg-transparent group h-12 px-8" asChild>
            <Link href="/team">
              Meet Our Full Team
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
