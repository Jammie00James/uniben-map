"use client"

import * as React from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { Location } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Search, Menu } from "lucide-react"

interface MapComponentProps {
  locations: Location[]
}

const UNIBEN_BOUNDS = {
  north: 6.404511,
  south: 6.388169,
  west: 5.611675,
  east: 5.621675,
}

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
}

const center = {
  lat: 6.397511,
  lng: 5.616675,
}

// Custom map style
const customMapStyle = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7c93a3" }, { lightness: "-10" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#a0a4a5" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#62838e" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#dde3e3" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3f4a51" }, { weight: "0.30" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "poi.attraction",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.business",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.government",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.place_of_worship",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.sports_complex",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: "-100" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#bbcacf" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ lightness: "0" }, { color: "#bbcacf" }, { weight: "0.50" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.stroke",
    stylers: [{ color: "#a9b4b8" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [
      { invert_lightness: true },
      { saturation: "-7" },
      { lightness: "3" },
      { gamma: "1.80" },
      { weight: "0.01" },
    ],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#a3c7df" }],
  },
]

const categoryColors: Record<string, string> = {
  fresher_clearance: "#FF5733",
  final_year_clearance: "#33FF57",
  security_checkpoint: "#3357FF",
  nysc_clearance: "#FF33F5",
}

export function MapComponent({ locations }: MapComponentProps) {
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null)
  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = React.useState<google.maps.Marker[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFaculty, setSelectedFaculty] = React.useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [isControlsOpen, setIsControlsOpen] = React.useState(false)
  const mapRef = React.useRef<HTMLDivElement>(null)

  const faculties = React.useMemo(() => {
    return Array.from(new Set(locations.map((loc) => loc.faculty).filter(Boolean)))
  }, [locations])

  const departments = React.useMemo(() => {
    return Array.from(new Set(locations.map((loc) => loc.department).filter(Boolean)))
  }, [locations])

  const filteredLocations = React.useMemo(() => {
    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedFaculty || location.faculty === selectedFaculty) &&
        (!selectedDepartment || location.department === selectedDepartment) &&
        (!selectedCategory || location.category === selectedCategory),
    )
  }, [locations, searchQuery, selectedFaculty, selectedDepartment, selectedCategory])

  React.useEffect(() => {
    if (!mapRef.current) return

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["places"],
    })

    loader
      .load()
      .then((google) => {
        const uniBenBounds = new google.maps.LatLngBounds(
          { lat: UNIBEN_BOUNDS.south, lng: UNIBEN_BOUNDS.west },
          { lat: UNIBEN_BOUNDS.north, lng: UNIBEN_BOUNDS.east },
        )

        const map = new google.maps.Map(mapRef.current!, {
          center,
          zoom: 16,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: customMapStyle,
          restriction: {
            latLngBounds: uniBenBounds,
            strictBounds: true,
          },
          minZoom: 15,
          maxZoom: 20,
        })

        const campusPolygon = new google.maps.Polygon({
          paths: [
            { lat: UNIBEN_BOUNDS.north, lng: UNIBEN_BOUNDS.west },
            { lat: UNIBEN_BOUNDS.north, lng: UNIBEN_BOUNDS.east },
            { lat: UNIBEN_BOUNDS.south, lng: UNIBEN_BOUNDS.east },
            { lat: UNIBEN_BOUNDS.south, lng: UNIBEN_BOUNDS.west },
          ],
          strokeColor: "#1E40AF",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#1E40AF",
          fillOpacity: 0.05,
        })

        campusPolygon.setMap(map)
        map.fitBounds(uniBenBounds)
        setMap(map)

        const newMarkers = locations
          .map((location) => {
            if (uniBenBounds.contains(location.coordinates)) {
              const marker = new google.maps.Marker({
                position: location.coordinates,
                map: map,
                title: location.name,
                icon: {
                  url: location.icon,
                  scaledSize: new google.maps.Size(40, 40),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(20, 20),
                },
                visible: true,
              })

              marker.addListener("click", () => {
                setSelectedLocation(location)
              })

              return marker
            }
            return null
          })
          .filter(Boolean) as google.maps.Marker[]

        setMarkers(newMarkers)
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error)
      })

    return () => {
      markers.forEach((marker) => marker.setMap(null))
    }
  }, [locations]) // Added markers to useEffect dependencies

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    updateMarkerVisibility()
  }

  const handleFacultyChange = (value: string) => {
    setSelectedFaculty(value === "All Faculties" ? null : value)
    setSelectedDepartment(null)
    updateMarkerVisibility()
  }

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value === "All Departments" ? null : value)
    updateMarkerVisibility()
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value)
    updateMarkerVisibility()
  }

  const updateMarkerVisibility = () => {
    if (map) {
      const bounds = map.getBounds()
      markers.forEach((marker) => {
        const location = locations.find((loc) => loc.name === marker.getTitle())
        if (location) {
          const isVisible =
            location.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedFaculty || location.faculty === selectedFaculty) &&
            (!selectedDepartment || location.department === selectedDepartment) &&
            (!selectedCategory || location.category === selectedCategory) &&
            bounds!.contains(marker.getPosition()!)

          marker.setVisible(isVisible)

          // Highlight markers based on selected category
          if (isVisible && selectedCategory && location.category === selectedCategory) {
            marker.setIcon({
              ...(marker.getIcon() as google.maps.Icon),
              fillColor: categoryColors[selectedCategory],
              strokeColor: categoryColors[selectedCategory],
            })
          } else {
            marker.setIcon({
              url: location.icon,
              scaledSize: new google.maps.Size(40, 40),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(20, 20),
            })
          }
        }
      })
    }
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    map?.panTo(location.coordinates)
    map?.setZoom(18)
    setIsControlsOpen(false)
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} style={mapContainerStyle} />

      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className="bg-white shadow-md"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle controls</span>
        </Button>
      </div>

      <div
        className={`absolute top-0 left-0 z-20 h-full w-full max-w-md bg-white/95 backdrop-blur-sm p-4 shadow-lg transition-transform duration-300 ease-in-out ${
          isControlsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-4 h-full overflow-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="space-y-2">
            <Select onValueChange={handleFacultyChange} value={selectedFaculty || "All Faculties"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Faculties">All Faculties</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleDepartmentChange} value={selectedDepartment || "All Departments"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Departments">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue="all" onValueChange={handleCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="fresher_clearance">Fresher Clearance</TabsTrigger>
              <TabsTrigger value="final_year_clearance">Final Year Clearance</TabsTrigger>
              <TabsTrigger value="security_checkpoint">Security Checkpoints</TabsTrigger>
              <TabsTrigger value="nysc_clearance">NYSC Clearance</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-grow overflow-auto">
            {filteredLocations.length > 0 ? (
              <div className="space-y-2">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-gray-500">{location.category.replace("_", " ")}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">No locations found</p>
            )}
          </div>
        </div>
      </div>

      <Sheet open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <SheetContent side="bottom" className="h-[80vh] sm:h-[60vh]">
          {selectedLocation && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedLocation.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 overflow-auto">
                <div className="relative w-full h-48">
                  <Image
                    src={selectedLocation.image || "/placeholder.svg"}
                    alt={selectedLocation.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <p className="text-muted-foreground">{selectedLocation.description}</p>
                {selectedLocation.faculty && (
                  <p>
                    <strong>Faculty:</strong> {selectedLocation.faculty}
                  </p>
                )}
                {selectedLocation.department && (
                  <p>
                    <strong>Department:</strong> {selectedLocation.department}
                  </p>
                )}
                <p>
                  <strong>Category:</strong> {selectedLocation.category.replace("_", " ")}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`,
                      )
                    }
                  >
                    Get Directions
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

