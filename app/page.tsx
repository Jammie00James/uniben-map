import { MapComponent } from "@/components/map"
import { locations } from "@/lib/locations"

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      <MapComponent locations={locations} />
    </main>
  )
}

