'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  latitude: number
  longitude: number
  address: string
  zoom?: number
}

export function LocationMap({ latitude, longitude, address, zoom = 15 }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Ensure this only runs in the browser
    if (typeof window === 'undefined') return
    if (!mapContainerRef.current) return
    
    // Prevent double initialization
    if (mapInstanceRef.current) return

    setIsLoading(true)

    // Dynamically import Leaflet only in the browser
    import('leaflet').then((L) => {
      // Double check container hasn't been initialized
      if (mapInstanceRef.current || !mapContainerRef.current) return

      // Clear any existing map instance in the container
      const container = mapContainerRef.current as any
      if (container._leaflet_id) {
        return
      }

      try {
        // Initialize map
        const map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: true,
          scrollWheelZoom: false,
        })

        mapInstanceRef.current = map

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Fix map size issues
        setTimeout(() => {
          map.invalidateSize()
          setIsLoading(false)
        }, 100)

        // Create custom icon
        const customIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        })

        // Add marker
        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map)

        // Add popup
        marker.bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
            <strong style="font-size: 14px; color: #1e293b; display: block; margin-bottom: 4px;">
              Asrivo Tech
            </strong>
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">
              ${address.replace(/\n/g, '<br>')}
            </p>
          </div>
        `)
      } catch (error) {
        console.error('Error initializing map:', error)
        setIsLoading(false)
      }
    })

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          console.error('Error cleaning up map:', e)
        }
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, address, zoom])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-xl z-10">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-primary/30 mx-auto animate-pulse" />
            <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-xl"
        style={{ 
          minHeight: '400px',
          height: '100%',
          width: '100%'
        }}
      />
      <style jsx global>{`
        .leaflet-container {
          border-radius: 0.75rem;
          height: 100%;
          width: 100%;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-control-zoom {
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #1e293b !important;
          border-bottom: 1px solid #e2e8f0 !important;
          transition: all 0.2s ease;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f1f5f9 !important;
        }
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  )
}
