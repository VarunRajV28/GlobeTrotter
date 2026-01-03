"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MapPin,
  TrendingUp,
  Globe,
  Loader2,
  Plus,
  Star,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { citiesApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CitySearchPage() {
  const [cities, setCities] = useState<any[]>([])
  const [popularCities, setPopularCities] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [filterRegion, setFilterRegion] = useState("All")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPopularCities()
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchCities()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowSearchResults(false)
    }
  }, [searchQuery])

  const fetchPopularCities = async () => {
    try {
      const results = await citiesApi.getPopular()
      setPopularCities(results)
    } catch (error) {
      console.error("Error fetching popular cities:", error)
    }
  }

  const searchCities = async () => {
    setIsSearching(true)
    setShowSearchResults(true)
    try {
      const results = await citiesApi.search(searchQuery)
      setCities(results)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search cities.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleCityClick = (cityId: string) => {
    router.push(`/explore/cities/${cityId}`)
  }

  const getCostBadge = (costIndex: number) => {
    if (costIndex <= 3) return { label: "Budget", color: "bg-green-500/20 text-green-700" }
    if (costIndex <= 6) return { label: "Moderate", color: "bg-yellow-500/20 text-yellow-700" }
    return { label: "Expensive", color: "bg-red-500/20 text-red-700" }
  }

  const displayCities = showSearchResults ? cities : popularCities

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-7xl py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif text-primary mb-2">
            Discover Your Next Destination
          </h1>
          <p className="text-lg text-muted-foreground">
            Search cities worldwide and add them to your trip itinerary
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search cities by name, country, or region..."
              className="pl-12 h-14 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-full md:w-48 h-14">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Regions</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Asia">Asia</SelectItem>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="South America">South America</SelectItem>
              <SelectItem value="Africa">Africa</SelectItem>
              <SelectItem value="Oceania">Oceania</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {showSearchResults ? (
              <span className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Results {isSearching && "(searching...)"}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Destinations
              </span>
            )}
          </h2>
        </div>

        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayCities.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No cities found</h2>
            <p className="text-muted-foreground mb-6">
              {showSearchResults
                ? "Try adjusting your search query or filters."
                : "No popular cities available at the moment."}
            </p>
            {showSearchResults && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setShowSearchResults(false)
                }}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayCities.map((city) => {
              const costBadge = getCostBadge(city.costIndex || 5)
              return (
                <Card
                  key={city.id}
                  className="overflow-hidden border-none shadow-md group cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => handleCityClick(city.id)}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={city.imageUrl || "/placeholder.svg?height=192&width=300"}
                      alt={city.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white text-xl font-bold">{city.name}</h3>
                      <div className="flex items-center gap-1 text-white/90 text-sm">
                        <MapPin className="h-3 w-3" />
                        {city.country}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className={costBadge.color}>{costBadge.label}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <CardDescription className="line-clamp-2 mb-4">
                      {city.description || "Discover this amazing destination"}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {city.popularity && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{city.popularity}</span>
                          </div>
                        )}
                        {city._count?.activities > 0 && (
                          <span>{city._count.activities} activities</span>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Trip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
