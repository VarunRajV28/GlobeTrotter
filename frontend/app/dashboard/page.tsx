"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Calendar, MapPin, TrendingUp, Compass, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { getCurrentUser } from "@/lib/auth/mock-auth"
import { getTripsByUser, getAllCities } from "@/lib/data/queries"
import type { User, Trip, City } from "@/lib/types/database"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [recommendedCities, setRecommendedCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)

      const [userTrips, cities] = await Promise.all([getTripsByUser(currentUser.id), getAllCities()])

      setTrips(userTrips)
      setRecommendedCities(cities.slice(0, 3))
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif text-primary">Welcome back, {user?.name}</h1>
              <p className="text-muted-foreground">Ready for your next adventure?</p>
            </div>
            <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all">
              <Link href="/trips/new">
                <Plus className="mr-2 h-5 w-5" />
                Plan New Trip
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-12">
            {/* Quick Stats / Highlights */}
            <div className="md:col-span-12 lg:col-span-8 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    Upcoming Trips
                  </h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/trips">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {trips.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {trips.map((trip) => (
                      <Card
                        key={trip.id}
                        className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={trip.coverImageUrl || "/placeholder.svg?height=200&width=400"}
                            alt={trip.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="font-bold text-lg">{trip.name}</h3>
                            <p className="text-sm opacity-90">
                              {new Date(trip.startDate).toLocaleDateString()} -{" "}
                              {new Date(trip.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <CardContent className="p-4 bg-background">
                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>{trip.description.substring(0, 60)}...</span>
                          </div>
                          <Button variant="outline" className="w-full bg-transparent" asChild>
                            <Link href={`/trips/${trip.id}`}>Manage Itinerary</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center p-12 text-center bg-background border-dashed">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Compass className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="mb-2">No trips yet</CardTitle>
                    <CardDescription className="mb-6">
                      Start by creating your first multi-city adventure!
                    </CardDescription>
                    <Button asChild>
                      <Link href="/trips/new">Plan Your First Trip</Link>
                    </Button>
                  </Card>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Recommended Destinations
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {recommendedCities.map((city) => (
                    <Card
                      key={city.id}
                      className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="relative h-40 w-full">
                        <img
                          src={city.imageUrl || "/placeholder.svg?height=160&width=250"}
                          alt={city.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                          {city.country}
                        </div>
                      </div>
                      <CardHeader className="p-4 space-y-1">
                        <CardTitle className="text-base">{city.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-1">{city.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-primary hover:text-primary hover:bg-primary/5"
                          asChild
                        >
                          <Link href={`/explore?city=${city.id}`}>
                            Learn More
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <aside className="md:col-span-12 lg:col-span-4 space-y-8">
              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="font-serif">GlobalTrotters Pro</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Unlock exclusive features for your next big journey.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      Offline map access
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      AI budget optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      Unlimited shared itineraries
                    </li>
                  </ul>
                  <Button variant="secondary" className="w-full text-primary font-bold">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button variant="outline" className="justify-start bg-transparent" asChild>
                    <Link href="/explore">
                      <Compass className="mr-2 h-4 w-4 text-primary" />
                      Browse Activities
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent" asChild>
                    <Link href="/profile/saved">
                      <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                      Saved Destinations
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
