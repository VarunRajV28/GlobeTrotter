"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Search, Loader2, ArrowLeft, TrendingUp, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { getAllCities } from "@/lib/data/queries"
import { useToast } from "@/hooks/use-toast"
import type { City } from "@/lib/types/database"
import Link from "next/link"
import { Suspense } from "react" // adding Suspense import

export default function SavedDestinationsPage() {
  const [savedCities, setSavedCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSavedCities = async () => {
      // Simulate fetching saved cities
      // In a real app, this would be a specific query for the user
      const allCities = await getAllCities()
      // For the mock, we'll just take a few
      setSavedCities(allCities.slice(0, 4))
      setIsLoading(false)
    }

    fetchSavedCities()
  }, [])

  const handleRemove = (cityId: string) => {
    setSavedCities(savedCities.filter((c) => c.id !== cityId))
    toast({
      title: "Removed from favorites",
      description: "The destination has been removed from your saved list.",
    })
  }

  const filteredCities = savedCities.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto my-20" />}>
        {/* wrapping main content in Suspense */}
        <main className="flex-1 container py-12 px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" asChild>
                  <button onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold font-serif text-primary">Saved Destinations</h1>
                  <p className="text-muted-foreground">Your personal bucket list of global adventures</p>
                </div>
              </div>
              <Button asChild className="shadow-lg">
                <Link href="/explore">
                  <Plus className="mr-2 h-4 w-4" />
                  Find More
                </Link>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your bucket list..."
                  className="pl-9 h-11 bg-background shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="bg-background shadow-sm border h-11">
                <Filter className="mr-2 h-4 w-4" />
                Filter by Country
              </Button>
            </div>

            {filteredCities.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCities.map((city) => (
                  <Card key={city.id} className="overflow-hidden border-none shadow-md group">
                    <div className="relative h-48">
                      <img
                        src={city.imageUrl || "/placeholder.svg"}
                        alt={city.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-destructive shadow-sm hover:bg-white transition-colors"
                        onClick={() => handleRemove(city.id)}
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                    <CardHeader className="p-4 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        <TrendingUp className="h-3 w-3" />
                        Recommended
                      </div>
                      <CardTitle className="text-xl">{city.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{city.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 border-t bg-muted/10">
                      <Button
                        variant="ghost"
                        className="w-full text-xs font-bold text-primary hover:bg-primary/5"
                        asChild
                      >
                        <Link href={`/explore?city=${city.id}`}>Plan a Trip Here</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-background rounded-2xl border-2 border-dashed">
                <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  <Heart className="h-10 w-10 text-primary/30" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Your bucket list is empty</h3>
                <p className="text-muted-foreground mb-8 text-center max-w-sm">
                  Explore the world and save destinations you want to visit to see them here.
                </p>
                <Button size="lg" className="h-12 px-8" asChild>
                  <Link href="/explore">Start Exploring</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </Suspense>
    </div>
  )
}
