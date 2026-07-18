'use client'

import DynamicMap from '@/components/map/dynamic-map'

export default function ContactMapExample() {
  const officeLocations = [
    {
      position: [28.6139, 77.2090] as [number, number], // New Delhi
      title: 'Main Office',
      popup: 'Asrivo Tech Solutions<br/>New Delhi, India'
    },
    // Add more locations as needed
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground mb-2">Find Us</h2>
        <p className="text-muted-foreground mb-6">Visit our office or get in touch</p>
        
        <DynamicMap
          center={[28.6139, 77.2090]}
          zoom={13}
          markers={officeLocations}
          height="500px"
          className="rounded-xl overflow-hidden shadow-lg"
        />
      </div>
    </section>
  )
}
