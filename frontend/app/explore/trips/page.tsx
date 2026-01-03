"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Globe, MapPin, DollarSign, Calendar, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { tripsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface PublicTrip {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  budget?: number
  destinations?: string[]
  coverImageUrl?: string
  user?: {
    name: string
  }
}

export default function PublicTripsPage() {
  const [trips, setTrips] = useState<PublicTrip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPublicTrips()
  }, [])

  const fetchPublicTrips = async () => {
    try {
      const response = await tripsApi.getAll({ limit: 50 })
      // Filter only public trips
      const publicTrips = response.trips?.filter((trip: any) => trip.isPublic) || []
      setTrips(publicTrips)
    } catch (error) {
      console.error('Failed to fetch public trips:', error)
      toast({
        title: "Error",
        description: "Failed to load public trips.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destinations?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Explore Public Itineraries</h1>
              <p className="text-lg text-muted-foreground">
                Discover amazing trips created by the GlobeTrotters community. Get inspired and plan your next adventure!
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search destinations, trip names..."
                  className="pl-12 h-14 text-base shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="container px-4 md:px-6 py-12">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Public Trips Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Be the first to share your trip!"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {filteredTrips.length} {filteredTrips.length === 1 ? 'Trip' : 'Trips'} Found
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
                    onClick={() => router.push(`/trips/share/${trip.id}`)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={trip.coverImageUrl || "/luxury-travel-landscape.jpg"}
                        alt={trip.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-primary backdrop-blur-sm">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        {trip.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {trip.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {trip.destinations?.join(", ") || "No destinations"}
                        </span>
                      </div>
                      {trip.startDate && trip.endDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      {trip.budget && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>${trip.budget.toLocaleString()}</span>
                        </div>
                      )}
                      {trip.user && (
                        <div className="pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Created by <span className="font-medium text-foreground">{trip.user.name}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
