"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Target, Eye, Heart, Sparkles, Users, Award, 
  Building2, Calendar, MapPin, ArrowRight, Quote, ShieldCheck, Zap
} from "lucide-react"

/** * COMPONENT: NeonPlexusBackground
 * A high-performance canvas engine that creates a neon particle network.
 */
function NeonPlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(31, 162, 225, 0.5)"; // Brand Blue
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = Array.from({ length: 100 }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(31, 162, 225, ${1 - dist / 150})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-slate-50" />;
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen">
      <NeonPlexusBackground />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 fill-current" />
              About
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[0.9]">
              Engineering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 animate-text-gradient">
                Digital Innovation
              </span>
            </h1>
            <p className="mt-8 text-xl text-slate-600 leading-relaxed font-medium">
              We are a collective of visionaries and engineers architecting 
              the future of enterprise software.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Glassmorphism */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 p-12 lg:p-20 shadow-2xl shadow-blue-900/5">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Our Evolution</span>
                <h2 className="text-4xl font-bold text-slate-900 leading-tight">From Startup to Global Force</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Founded in 2025, Asrivo Tech began with a shared vision: 
                  to bridge the gap between abstract technology and practical business impact.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-6">
                {[
                  { label: "Founded", val: "2016" },
                  { label: "Experts", val: "50+" },
                  { label: "Projects", val: "200+" }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-black text-blue-600">{stat.val}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/20 flex items-center justify-center">
                <Building2 className="w-24 h-24 text-blue-500/30" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                   <span className="text-[10px] text-white font-bold">HQ: Madurai, Tamil Nadu, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
           {[
              { icon: Target, title: "Our Mission", desc: "Our mission is to empower global growth by transforming innovative ideas into scalable, secure, and user-centric digital products that solve real-world problems through intelligent technology. We focus on building simple yet powerful solutions that create long-term impact, fostering trust and value through future-ready innovation." },
              { icon: Eye, title: "Our Vision", desc: "Our vision is to evolve from a service-based IT organization into a globally trusted, product-driven technology leader by delivering high-quality proprietary solutions alongside expert services. We achieve this through deep investment in innovation and automation, fostering a culture of accountability to build digital tools that maximize efficiency and growth." },
              { icon: Heart, title: "Our Values", desc: "Our values center on turning ideas into impactful digital solutions through secure, transparent technology and high-performance products that remain simple to use. We prioritize future-ready scalability and a culture of continuous learning to solve real-world problems with long-term value and ownership." }
            ].map((pillar) => (
              <div key={pillar.title} className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-blue-900/5 hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
                  <pillar.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{pillar.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Quote */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="relative text-center p-12 lg:p-24 rounded-[3rem] bg-blue-600 text-white overflow-hidden shadow-2xl">
            <Quote className="absolute top-10 left-10 w-20 h-20 text-white/10 rotate-12" />
            <p className="relative z-10 text-2xl lg:text-3xl font-medium leading-relaxed italic mb-10">
              &ldquo;Technology should empower, not complicate. At Asrivo, we build the bridges 
              that turn complexity into competitive advantage.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold">AK</div>
              <div className="text-left">
                <div className="font-bold">Aswin K A</div>
                <div className="text-xs text-blue-200">CEO & Founder, Asrivo Tech</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Profile Section */}
      <section className="py-20 lg:py-32 bg-white/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Enterprise Overview</h2>
              <div className="grid gap-4">
                {[
                   { i: Building2, l: "Entity", v: "Asrivo Tech Solutions Inc." },
                   { i: Award, l: "Sector", v: "Enterprise Software & Cloud Services" },
                   { i: ShieldCheck, l: "Compliance", v: "Secure Software Development Practices" }
                ].map((item) => (
                  <div key={item.l} className="flex items-center gap-6 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <item.i className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{item.l}</div>
                      <div className="font-bold text-slate-800">{item.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          {/* Strategic Collaboration Card */}
<div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border border-slate-700 text-white group">

   {/* Background Glow */}
   <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition duration-500 blur-3xl" />

   <div className="relative z-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
         
         <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-3">
               Strategic Collaboration
            </p>

            <h3 className="text-3xl font-bold leading-tight">
               Digital Marketing Partnership
            </h3>

            <p className="mt-4 text-slate-400 max-w-xl leading-relaxed">
               Asrivo Tech collaborates with leading digital marketing agencies
               to deliver complete business growth solutions including branding,
               advertising, SEO, social media management, and performance marketing.
            </p>
         </div>

         <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
            PARTNERED
         </div>

      </div>

      {/* Collaboration Services */}
      <div className="grid md:grid-cols-2 gap-5">

         <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl">
                  📈
               </div>

               <div>
                  <h4 className="font-semibold text-lg">
                     Performance Marketing
                  </h4>

                  <p className="text-sm text-slate-400">
                     Paid campaigns & lead generation
                  </p>
               </div>
            </div>
         </div>

         <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
                  🌐
               </div>

               <div>
                  <h4 className="font-semibold text-lg">
                     SEO Optimization
                  </h4>

                  <p className="text-sm text-slate-400">
                     Improve search visibility & ranking
                  </p>
               </div>
            </div>
         </div>

         <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                  📱
               </div>

               <div>
                  <h4 className="font-semibold text-lg">
                     Social Media Branding
                  </h4>

                  <p className="text-sm text-slate-400">
                     Build audience engagement & reach
                  </p>
               </div>
            </div>
         </div>

         <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">
                  🚀
               </div>

               <div>
                  <h4 className="font-semibold text-lg">
                     Growth Strategy
                  </h4>

                  <p className="text-sm text-slate-400">
                     Scalable digital business solutions
                  </p>
               </div>
            </div>
         </div>

      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

         <div>
            <p className="text-slate-400 text-sm">
               Combining software innovation with digital marketing excellence.
            </p>
         </div>

         <div className="flex flex-col sm:flex-row gap-3">
            <Button
               variant="outline"
               className="h-14 px-8 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-white border-slate-700"
               asChild
            >
               <Link href="/partnership/status">
                  Check Status
                  <Eye className="ml-2 w-4 h-4" />
               </Link>
            </Button>

            <Button
               className="h-14 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
               asChild
            >
               <Link href="/partnership">
                  Start Partnership
                  <ArrowRight className="ml-2 w-4 h-4" />
               </Link>
            </Button>
         </div>

      </div>

   </div>
</div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes text-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-text-gradient {
          background-size: 200% auto;
          animation: text-gradient 6s linear infinite;
        }
      `}</style>
    </div>
  );
}