'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
})

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    popup?: string
    title?: string
  }>
  height?: string
  className?: string
}

export default function LeafletMap({
  center = [28.6139, 77.2090], // Default: New Delhi
  zoom = 13,
  markers = [],
  height = '400px',
  className = ''
}: MapProps) {
  useEffect(() => {
    // Additional setup if needed
  }, [])

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={icon}>
            {marker.popup && (
              <Popup>
                <div className="text-sm">
                  {marker.title && <h3 className="font-semibold mb-1">{marker.title}</h3>}
                  <p>{marker.popup}</p>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
