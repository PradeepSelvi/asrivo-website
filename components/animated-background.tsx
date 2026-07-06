"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-[100px] animate-blob" />
      <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-accent/15 blur-[120px] animate-blob delay-200" />
      <div className="absolute -bottom-40 right-1/3 h-72 w-72 rounded-full bg-primary/10 blur-[80px] animate-blob delay-500" />
      
      {/* Floating particles */}
      <div className="absolute top-20 left-1/4 h-2 w-2 rounded-full bg-primary/40 animate-float" />
      <div className="absolute top-40 right-1/3 h-3 w-3 rounded-full bg-accent/30 animate-float-slow delay-300" />
      <div className="absolute bottom-1/3 left-1/5 h-2 w-2 rounded-full bg-primary/30 animate-float-reverse delay-500" />
      <div className="absolute bottom-40 right-1/4 h-4 w-4 rounded-full bg-accent/20 animate-float delay-700" />
    </div>
  )
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none opacity-40"
    />
  )
}

export function GradientOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-accent/10 to-transparent blur-[100px] animate-pulse-glow" />
      </div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[600px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 to-transparent blur-[80px] animate-blob" />
      </div>
      <div className="absolute bottom-1/4 right-0 h-[300px] w-[500px]">
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 to-transparent blur-[60px] animate-float-slow" />
      </div>
    </div>
  )
}
