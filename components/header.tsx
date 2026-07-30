"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"
import { AuthButtons } from "@/components/auth-buttons"
import { MobileAuthButtons } from "@/components/mobile-auth-buttons"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Team", href: "/team" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
]

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0A66C2" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <div className={`${className} relative`} style={{ 
    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    borderRadius: '6px',
    padding: '2px'
  }}>
    <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  </div>
)

interface HeaderProps {
  settings?: Record<string, string>
}

export function Header({ settings }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 20)
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [lastScrollY])

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-background/60 backdrop-blur-md"
      } ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ transition: "transform 0.3s ease-in-out, background-color 0.5s, border-color 0.5s" }}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div 
          className="pointer-events-none absolute inset-0 -z-10 opacity-50 transition-transform duration-700 ease-out"
          style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }}
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4fd1ed15_0%,transparent_70%)]" />
        </div>

        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 sm:gap-3 group">
            <img
              src="/asrivo.png"
              alt="Asrivo Tech Logo"
              className="h-11 w-11 sm:h-13 sm:w-13 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-medium tracking-tight text-foreground whitespace-nowrap">
                Asrivo<span className="font-bold">Tech</span>
              </span>
              <span className="text-[7px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground/80 whitespace-nowrap">
                PVT LTD • Intelligent Solutions
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex lg:hidden z-50 relative">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="p-2.5 bg-card/95 backdrop-blur-md border-2 border-border rounded-xl shadow-xl hover:bg-muted hover:border-primary/50 transition-all active:scale-95 touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-foreground" strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative px-4 py-2 text-sm font-medium transition-all group ${
                scrolled 
                  ? "text-foreground/90 hover:text-[#4fd1ed]" 
                  : "text-muted-foreground hover:text-[#4fd1ed]"
              }`}
            >
              {item.name}
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[#4fd1ed] transition-all group-hover:left-0 group-hover:w-full" />
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-5">
          {settings && (
            <div className="flex items-center gap-3 border-r pr-5 border-border/40">
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110 active:scale-95">
                  <LinkedInIcon className="h-5 w-5" />
                </a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110 active:scale-95">
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          )}

          <AuthButtons />

          <Button size="sm" className="bg-[#2b6cb0] hover:bg-[#4fd1ed] text-white shadow-lg shadow-blue-500/20 transition-colors" asChild>
            <Link href="/services/inquiry" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Get Started
            </Link>
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background lg:hidden flex flex-col" style={{ height: '100dvh' }}>
          <div 
            className="flex items-center justify-between px-6 py-5 border-b border-border bg-background/95 backdrop-blur-md shrink-0"
            style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}
          >
            <div className="flex items-center gap-2">
              <img src="/asrivo.png" alt="Asrivo Tech Logo" className="h-9 w-9 shrink-0" />
              <span className="font-bold text-foreground text-lg">ASRIVO TECH</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 bg-muted/50 hover:bg-destructive/10 rounded-xl transition-colors active:scale-95 touch-manipulation"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-foreground" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {navigation.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="block px-4 py-3 text-base font-semibold text-foreground bg-muted/50 hover:bg-[#4fd1ed] hover:text-white rounded-xl transition-colors active:scale-98 touch-manipulation" 
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div 
            className="px-6 py-4 border-t border-border bg-background/95 backdrop-blur-md shrink-0 space-y-3"
            style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
          >
            <MobileAuthButtons onNavigate={() => setMobileMenuOpen(false)} />
            
            <Button size="lg" className="w-full bg-[#2b6cb0] hover:bg-[#4fd1ed] text-white shadow-lg" asChild>
              <Link href="/services/inquiry" onClick={() => setMobileMenuOpen(false)}>
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started
              </Link>
            </Button>
            
            {settings && (
              <div className="flex items-center justify-around gap-4 pt-2">
                {settings.social_linkedin && (
                  <a 
                    href={settings.social_linkedin} 
                    target='_blank' 
                    rel='noopener noreferrer' 
                    className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-[#0A66C2] transition-colors active:scale-95 touch-manipulation"
                  >
                    <LinkedInIcon className="h-6 w-6 shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {settings.social_instagram && (
                  <a 
                    href={settings.social_instagram} 
                    target='_blank' 
                    rel='noopener noreferrer' 
                    className="flex items-center gap-3 text-sm font-medium text-foreground hover:opacity-80 transition-opacity active:scale-95 touch-manipulation"
                  >
                    <InstagramIcon className="h-6 w-6 shrink-0" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
