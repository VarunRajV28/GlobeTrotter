"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Search,
  Loader2,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { tripsApi, citiesApi, activitiesApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Trip } from "@/lib/types/database"

interface Stop {
  id: string
  cityId: string
  cityName: string
  startDate: string
  endDate: string
  activities: any[]
  order: number
}

export default function ItineraryBuilderPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<Trip | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddStopOpen, setIsAddStopOpen] = useState(false)
  const [citySearch, setCitySearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // New stop form
  const [newStop, setNewStop] = useState({
    cityId: "",
    cityName: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchTripData()
  }, [id, toast])

  const fetchTripData = async () => {
    try {
      const tripData = await tripsApi.getById(id)
      setTrip(tripData)
      
      // Load existing stops/destinations
      if (tripData.destinations && Array.isArray(tripData.destinations) && tripData.destinations.length > 0) {
        const loadedStops = tripData.destinations.map((dest: any, index: number) => ({
          id: dest.id || `stop-${index}`,
          cityId: dest.cityId || "",
          cityName: dest.name || dest.cityName || "",
          startDate: dest.startDate || "",
          endDate: dest.endDate || "",
          activities: dest.activities || [],
          order: index,
        }))
        setStops(loadedStops)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trip data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchCities = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const results = await citiesApi.search(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities(citySearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [citySearch])

  const handleAddStop = () => {
    if (!newStop.cityId || !newStop.startDate || !newStop.endDate) {
      toast({
        title: "Missing information",
        description: "Please select a city and provide dates.",
        variant: "destructive",
      })
      return
    }

    const stop: Stop = {
      id: `stop-${Date.now()}`,
      ...newStop,
      activities: [],
      order: stops.length,
    }

    setStops([...stops, stop])
    setNewStop({ cityId: "", cityName: "", startDate: "", endDate: "" })
    setCitySearch("")
    setSearchResults([])
    setIsAddStopOpen(false)

    toast({
      title: "Stop added",
      description: `${newStop.cityName} has been added to your itinerary.`,
    })
  }

  const handleRemoveStop = (stopId: string) => {
    setStops(stops.filter((s) => s.id !== stopId))
    toast({
      title: "Stop removed",
      description: "The stop has been removed from your itinerary.",
    })
  }

  const moveStop = (index: number, direction: "up" | "down") => {
    const newStops = [...stops]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newStops.length) return

    ;[newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]]
    newStops.forEach((stop, idx) => (stop.order = idx))
    setStops(newStops)
  }

  const handleSaveItinerary = async () => {
    setIsSaving(true)
    try {
      // Format stops for API
      const destinations = stops.map((stop) => ({
        cityId: stop.cityId,
        name: stop.cityName,
        startDate: stop.startDate,
        endDate: stop.endDate,
        activities: stop.activities,
      }))

      // Update trip with destinations
      await tripsApi.update(id, { destinations })

      toast({
        title: "Itinerary saved",
        description: "Your itinerary has been successfully updated.",
      })
      router.push(`/trips/${id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save itinerary.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

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
      <main className="flex-1 container max-w-4xl py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-serif text-primary">Build Itinerary</h1>
              <p className="text-muted-foreground">{trip?.name}</p>
            </div>
          </div>
          <Button onClick={handleSaveItinerary} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Itinerary
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Stops</span>
              <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Stop</DialogTitle>
                    <DialogDescription>
                      Add a city or destination to your trip itinerary.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Search City</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for a city..."
                          className="pl-9"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                        />
                      </div>
                      {searching && (
                        <p className="text-sm text-muted-foreground">Searching...</p>
                      )}
                      {searchResults.length > 0 && (
                        <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                          {searchResults.map((city) => (
                            <button
                              key={city.id}
                              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                              onClick={() => {
                                setNewStop({
                                  ...newStop,
                                  cityId: city.id,
                                  cityName: `${city.name}, ${city.country}`,
                                })
                                setCitySearch("")
                                setSearchResults([])
                              }}
                            >
                              <div className="font-medium">{city.name}</div>
                              <div className="text-sm text-muted-foreground">{city.country}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {newStop.cityName && (
                        <div className="p-2 bg-primary/10 rounded-md text-sm">
                          Selected: <strong>{newStop.cityName}</strong>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newStop.startDate}
                          onChange={(e) =>
                            setNewStop({ ...newStop, startDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newStop.endDate}
                          onChange={(e) =>
                            setNewStop({ ...newStop, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleAddStop}>
                      Add Stop to Itinerary
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stops.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stops added yet. Click "Add Stop" to begin building your itinerary.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <Card key={stop.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-1 pt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveStop(index, "up")}
                            disabled={index === 0}
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveStop(index, "down")}
                            disabled={index === stops.length - 1}
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                <span className="text-primary">#{index + 1}</span>
                                {stop.cityName}
                              </h3>
                              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(stop.startDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(stop.endDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a href={`/trips/${id}/activities?cityId=${stop.cityId}`}>
                                  <Plus className="mr-1 h-4 w-4" />
                                  Add Activities
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveStop(stop.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {stop.activities.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-primary/20">
                              <p className="text-sm font-medium mb-2">
                                Activities ({stop.activities.length})
                              </p>
                              <div className="space-y-1">
                                {stop.activities.map((activity: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="text-sm text-muted-foreground flex items-center gap-2"
                                  >
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    {activity.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
