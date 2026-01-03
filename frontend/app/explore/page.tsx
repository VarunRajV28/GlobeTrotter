"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Star, Filter, Loader2, DollarSign, Clock, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { searchCities, searchActivities } from "@/lib/data/queries"
import type { City, ActivityWithCity } from "@/lib/types/database"

function ExploreContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [cities, setCities] = useState<City[]>([])
  const [activities, setActivities] = useState<ActivityWithCity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("cities")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const [cityResults, activityResults] = await Promise.all([searchCities(query), searchActivities(query)])
      setCities(cityResults)
      setActivities(activityResults)
      setIsLoading(false)
    }

    const timeoutId = setTimeout(fetchData, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div className="flex flex-col gap-8">
      {/* Search Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-primary">Discover the World</h1>
        <p className="text-muted-foreground text-lg">Find cities and activities to add to your next big adventure.</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for cities, landmarks, or experiences..."
            className="pl-12 h-14 text-lg bg-background shadow-lg border-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="cities" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <TabsList className="bg-background shadow-sm border h-11 p-1">
            <TabsTrigger value="cities" className="px-6 h-9">
              Cities
            </TabsTrigger>
            <TabsTrigger value="activities" className="px-6 h-9">
              Activities
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="bg-background border shadow-sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <TabsContent value="cities" className="space-y-6">
          {isLoading ? (
            <div className="flex py-20 justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <Card key={city.id} className="overflow-hidden border-none shadow-md group">
                  <div className="relative h-56">
                    <img
                      src={city.imageUrl || "/placeholder.svg?height=250&width=400"}
                      alt={city.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm border border-white/50">
                        {city.country}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-white text-xs border border-white/20">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{city.popularity} popularity</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <DollarSign
                            key={i}
                            className={`h-3 w-3 ${i < city.costIndex ? "text-white" : "text-white/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-2xl">{city.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{city.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-6 pt-2">
                    <Button className="w-full shadow-md">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add to Active Trip
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <NoResults message={`No cities found for "${query}"`} />
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {isLoading ? (
            <div className="flex py-20 justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden border-none shadow-md group flex flex-col">
                  <div className="relative h-48">
                    <img
                      src={activity.imageUrl || "/placeholder.svg?height=200&width=400"}
                      alt={activity.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm border border-white/50">
                        {activity.category}
                      </div>
                    </div>
                  </div>
                  <CardHeader className="p-5 pb-2 flex-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      {activity.city.name}, {activity.city.country}
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{activity.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{activity.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 py-2">
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <div className="flex items-center text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>{activity.estimatedCost} / person</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{activity.duration}h</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-5">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-primary/20 hover:border-primary/50 text-primary"
                    >
                      Add to Itinerary
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <NoResults message={`No activities found for "${query}"`} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NoResults({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <Search className="h-10 w-10 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-xl font-bold mb-2">No results found</h3>
      <p className="text-muted-foreground max-w-sm">{message}</p>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <Suspense
          fallback={
            <div className="flex py-20 justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <ExploreContent />
        </Suspense>
      </main>
    </div>
  )
}
