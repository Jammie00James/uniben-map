export interface Location {
  id: string
  name: string
  description: string
  image: string
  icon: string
  coordinates: {
    lat: number
    lng: number
  }
  category:
    | "academic"
    | "administrative"
    | "facility"
    | "hostel"
    | "fresher_clearance"
    | "final_year_clearance"
    | "security_checkpoint"
    | "nysc_clearance"
  faculty?: string
  department?: string
}

