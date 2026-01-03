"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Check,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { activitiesApi, tripsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = [
  "All",
  "Sightseeing",
  "Food & Dining",
  "Adventure",
  "Culture",
  "Shopping",
  "Nightlife",
  "Nature",
  "Relaxation",
]

export default function ActivitySearchPage() {
  const { id } = useParams() as { id: string }
  const searchParams = useSearchParams()
  const cityId = searchParams.get("cityId")
  
  const [activities, setActivities] = useState<any[]>([])
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchActivities()
  }, [cityId, selectedCategory])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (cityId) params.cityId = cityId
      if (selectedCategory !== "All") params.category = selectedCategory

      const results = await activitiesApi.search(params)
      setActivities(results)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load activities.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActivity = (activityId: string) => {
    const newSelected = new Set(selectedActivities)
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId)
    } else {
      newSelected.add(activityId)
    }
    setSelectedActivities(newSelected)
  }

  const handleAddActivities = async () => {
    if (selectedActivities.size === 0) {
      toast({
        title: "No activities selected",
        description: "Please select at least one activity to add.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Add each selected activity to the trip
      const addPromises = Array.from(selectedActivities).map((activityId) => 
        tripsApi.addActivity(id, { activityId })
      )

      await Promise.all(addPromises)

      toast({
        title: "Activities added",
        description: `${selectedActivities.size} activities have been added to your itinerary.`,
      })

      // Navigate back and force a refresh to reload trip data
      router.push(`/trips/${id}`)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add activities.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-7xl py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-serif text-primary">Browse Activities</h1>
              <p className="text-muted-foreground">
                Select activities to add to your itinerary
              </p>
            </div>
          </div>
          {selectedActivities.size > 0 && (
            <Button onClick={handleAddActivities} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Add {selectedActivities.size} {selectedActivities.size === 1 ? "Activity" : "Activities"}
            </Button>
          )}
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.slice(1).map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No activities found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => {
              const isSelected = selectedActivities.has(activity.id)
              return (
                <Card
                  key={activity.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => toggleActivity(activity.id)}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={activity.imageUrl || "/placeholder.svg?height=192&width=300"}
                      alt={activity.name}
                      className="object-cover w-full h-full"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="rounded-full bg-primary p-2">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">{activity.category}</Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-1">{activity.name}</CardTitle>
                    {activity.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{activity.rating}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2 mb-3">
                      {activity.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {activity.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.duration}h</span>
                        </div>
                      )}
                      {activity.estimatedCost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${activity.estimatedCost}</span>
                        </div>
                      )}
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
