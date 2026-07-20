"use client"

import React, { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Globe, Zap, Users, Building2,Folder,CheckCircle  } from "lucide-react"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"

/**
 * OPTIMIZED PROFESSIONAL IT COMPANY BACKGROUND
 * Features: Clean gradient, subtle patterns, and lightweight 3D floating elements.
 */
const ProfessionalBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reduced number of elements for better performance
  const floatingElements = useMemo(() => {
    return [
      { id: 1, x: -25, y: -20, delay: 0, size: 60 },
      { id: 2, x: 30, y: -15, delay: 3, size: 50 },
      { id: 3, x: -20, y: 25, delay: 6, size: 55 },
    ];
  }, []);

  if (!mounted) return <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Clean Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />

      {/* Subtle Grid Pattern - Simplified */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(30, 64, 175, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(30, 64, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Simplified Accent Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-200/15 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/15 to-transparent rounded-full blur-2xl" />

      {/* Lightweight Floating Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute opacity-[0.08] animate-float-light"
          style={{
            left: `calc(50% + ${element.x}%)`,
            top: `calc(50% + ${element.y}%)`,
            animationDelay: `${element.delay}s`,
            width: `${element.size}px`,
            height: `${element.size}px`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-100/30 to-indigo-200/30 border border-blue-200/20 rounded-lg shadow-sm" />
        </div>
      ))}
    </div>
  );
};

function CompanyMetric({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: any }) {
  const { ref, isVisible } = useScrollAnimation()
  const { count, startAnimation } = useCountUp(value, 2500)

  useEffect(() => {
    if (isVisible) startAnimation()
  }, [isVisible, startAnimation])

  return (
    <div ref={ref} className="group relative p-8 rounded-[2rem] bg-white/40 backdrop-blur-3xl border border-white/80 hover:bg-white/70 transition-all duration-700 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:rotate-0 duration-700">
        <Icon size={120} />
      </div>
      <div className="flex items-center gap-5 mb-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
          <Icon size={24} />
        </div>
        <div className="text-4xl font-black text-slate-900 tracking-tighter">
          {count}{suffix}
        </div>
      </div>
      <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 group-hover:text-primary transition-colors">
        {label}
      </div>
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const handleMove = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth - 0.5) * 40, 
        y: (e.clientY / window.innerHeight - 0.5) * 40 
      })
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      <ProfessionalBackground />

      {/* Subtle Professional Grid Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.08]">
        <svg width="100%" height="100%">
          <pattern id="data-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e40af" strokeWidth="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#data-grid)" />
        </svg>
      </div>

      <div className="container relative z-20 mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-1 gap-12 text-center items-center">
          
          <div 
            className="max-w-5xl mx-auto transition-transform duration-1000 ease-out"
            style={{ transform: `translate3d(${mousePos.x * -0.15}px, ${mousePos.y * -0.15}px, 0)` }}
          >
            {/* Company Logo */}
            <div className={`flex justify-center mb-8 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
              <div className="relative">
                <img
                  src="/asrivo.png"
                  alt="Asrivo Tech Logo"
                  className="h-64 w-auto filter drop-shadow-lg"
                  />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg blur-xl -z-10 scale-110" />
              </div>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/90 border border-primary/10 shadow-2xl mb-12 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0 -translate-y-6'}`}>
              <ShieldCheck className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-800 uppercase">
                Enterprise Modular Architectures
              </span>
            </div>

            <h1 className={`text-6xl md:text-[100px] font-black text-slate-900 tracking-tighter leading-[0.85] mb-10 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100' : 'opacity-0 -translate-y-6'}`}>
              Building Robust <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600 animate-text-shimmer drop-shadow-sm">
                Digital Foundations
              </span>
            </h1>

            <p className={`text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-16 font-medium leading-relaxed transition-all duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
              Asrivo Tech develops resilient digital ecosystems for modern enterprises. 
              We transform structural complexity into high-performance infrastructure components.
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-8 mb-32 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <Button size="lg" className="h-20 px-14 text-lg font-black rounded-3xl bg-primary hover:bg-primary/90 shadow-[0_20px_40px_rgba(59,130,246,0.3)] group active:scale-95 transition-all" asChild>
                <Link href="/services/inquiry">
                  Initialize Deployment
                  <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="h-20 px-14 text-lg font-bold rounded-3xl border-slate-200 bg-white/40 backdrop-blur-xl text-slate-900 hover:bg-white shadow-xl transition-all" asChild>
                <Link href="/projects">
                  View Case Reports
                </Link>
              </Button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <CompanyMetric value={7} suffix="" label="Our Core Service" icon={Building2} />
              <CompanyMetric value={99.9} suffix=".9%" label="System Reliability" icon={Users} />
              <CompanyMetric value={7} suffix="+" label="Technology Expertise" icon={CheckCircle} />
              <CompanyMetric value={25} suffix="/7" label="Live Support" icon={Zap} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
        <span className="text-[10px] font-black tracking-[0.5em] uppercase text-slate-400">Scroll Analytics</span>
        <div className="w-[2px] h-16 rounded-full bg-gradient-to-b from-primary to-transparent animate-bounce-slow" />
      </div>

      <style jsx global>{`
        .perspective-2500 { perspective: 2500px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-x-60 { transform: rotateX(60deg); }
        .rotate-z-45 { transform: rotateZ(-45deg); }
        
        /* FACE DEPTH CONFIGURATION */
        .translate-z-12 { transform: translateZ(48px); }
        .-translate-z-12 { transform: translateZ(-48px); }
        .translate-x-12 { transform: translateX(48px); }
        .-translate-x-12 { transform: translateX(-48px); }
        .translate-y-12 { transform: translateY(48px); }
        .-translate-y-12 { transform: translateY(-48px); }

        @keyframes voxel-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 0, 80px); }
        }
        .animate-voxel-float {
          animation: voxel-float linear infinite;
        }

        @keyframes float-light {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float-light {
          animation: float-light 8s ease-in-out infinite;
        }

        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 8s linear infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(20px); opacity: 0.2; }
        }
        .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
      `}</style>
    </section>
  )
}