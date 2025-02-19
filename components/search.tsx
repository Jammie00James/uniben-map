"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Location } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface SearchComponentProps {
  locations: Location[]
  onLocationSelect: (location: Location) => void
}

export function SearchComponent({ locations, onLocationSelect }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-background"
        >
          <Search className="mr-2 h-4 w-4" />
          Search locations...
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Search Locations</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div className="space-y-2">
            {filteredLocations.map((location) => (
              <Button
                key={location.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onLocationSelect(location)
                }}
              >
                {location.name}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

