"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return { ref, isVisible }
}

export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return offset
}

export function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)
  const isAnimatingRef = useRef(false)
  const hasAnimatedRef = useRef(false)

  // Keep count updated if end prop changes after animation completed
  useEffect(() => {
    if (hasAnimatedRef.current && !isAnimatingRef.current) {
      setCount(end)
    }
  }, [end])

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current || hasAnimatedRef.current) return
    isAnimatingRef.current = true
    hasAnimatedRef.current = true

    const startTime = performance.now()
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      if (progress >= 1) {
        setCount(end)
        isAnimatingRef.current = false
        return
      }

      // Smooth cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.min(end, Math.max(start, Math.round(start + (end - start) * easeOut)))
      
      setCount(currentCount)
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [end, duration, start])

  return { count, startAnimation }
}

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return position
}

export function useTilt(intensity = 10) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState("none")

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -intensity
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity

      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`)
    }

    const handleMouseLeave = () => {
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)")
    }

    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [intensity])

  return { ref, transform }
}
