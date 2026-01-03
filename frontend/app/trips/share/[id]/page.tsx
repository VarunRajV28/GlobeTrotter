"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Share2, Copy, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { tripsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Trip {
  id: string
  name: string
  description?: string
  isPublic?: boolean
  startDate?: string
  endDate?: string
  destinations?: string[]
  coverImageUrl?: string
  tripActivities?: any[]
  budget?: number
}

export default function PublicTripViewPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await tripsApi.getById(id)
        // API returns { trip: {...} } so extract the trip
        const data = response.trip || response
        if (!data || !data.isPublic) {
          toast({
            title: "Access Denied",
            description: "This itinerary is private or does not exist.",
            variant: "destructive",
          })
          router.push("/explore")
          return
        }
        setTrip(data)
      } catch (error) {
        console.error('Failed to fetch shared trip:', error)
        toast({
          title: "Error",
          description: "Failed to load trip.",
          variant: "destructive",
        })
        router.push("/explore")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [id, router, toast])

  const handleCopyTrip = () => {
    toast({
      title: "Trip Copied!",
      description: "This itinerary has been added to your trips.",
    })
  }

  if (isLoading || !trip) return null

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <div className="relative h-[300px] w-full">
        <img
          src={trip.coverImageUrl || "/luxury-travel-landscape.jpg"}
          alt={trip.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="container px-4 space-y-4">
            <Badge className="bg-secondary text-primary font-bold">Public Itinerary</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">{trip.name}</h1>
            <p className="text-white/80 max-w-2xl mx-auto">{trip.description}</p>
          </div>
        </div>
      </div>

      <main className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-12">
            {trip.destinations && trip.destinations.map((destination: string, index: number) => {
              const cityActivities = trip.tripActivities?.filter((ta: any) => 
                ta.activity.city.name === destination
              ) || []
              
              return (
                <section key={index} className="relative pl-8 md:pl-12">
                  <div className="absolute left-1.5 md:left-3.5 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-10">
                    {index + 1}
                  </div>
                  {trip.destinations && index < trip.destinations.length - 1 && (
                    <div className="absolute left-4 md:left-6 top-10 bottom-[-48px] w-0.5 bg-border border-dashed border-l-2" />
                  )}

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold font-serif">{destination}</h2>
                      <p className="text-muted-foreground">
                        {cityActivities.length} {cityActivities.length === 1 ? 'activity' : 'activities'} planned
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {cityActivities.map((ta: any) => (
                        <Card key={ta.id} className="border-none shadow-sm">
                          <CardContent className="p-4 flex gap-4">
                            <img
                              src={ta.activity.imageUrl || "/placeholder.svg"}
                              alt={ta.activity.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-bold">{ta.activity.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">{ta.activity.description}</p>
                              <Badge variant="outline" className="mt-2 text-[10px]">
                                {ta.activity.category}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {cityActivities.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No activities planned yet</p>
                      )}
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Inspired?</CardTitle>
                <CardDescription>Save this itinerary as a template for your own trip.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleCopyTrip}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to My Trips
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share URL
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">GlobalTrotters Community</h4>
                  <p className="text-xs text-muted-foreground">Discover more trips from our members.</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
