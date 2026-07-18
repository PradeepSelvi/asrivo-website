import dynamic from 'next/dynamic'

// Dynamically import the map component with no SSR
// This prevents hydration errors and window/document issues
const DynamicMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted rounded-xl flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
})

export default DynamicMap
