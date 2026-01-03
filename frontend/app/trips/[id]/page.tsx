"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Suspense } from "react" // adding Suspense import
import {
  Calendar,
  Clock,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Share2,
  Trash2,
  Edit2,
  Loader2,
  Info,
  DollarSign,
  Search,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { TripBudgetBreakdown } from "@/components/trip-budget-breakdown" // importing new component
import { getTripWithDetails, deleteTripStop, searchActivities, addActivityToTrip } from "@/lib/data/queries"
import { useToast } from "@/hooks/use-toast"
import type { TripWithDetails } from "@/lib/types/database"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function TripDetailsPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<TripWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("itinerary")
  const router = useRouter()
  const { toast } = useToast()
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [activitySearchQuery, setActivitySearchQuery] = useState("")
  const [activitySearchResults, setActivitySearchResults] = useState<any[]>([])
  const [isSearchingActivities, setIsSearchingActivities] = useState(false)

  useEffect(() => {
    const fetchTrip = async () => {
      const data = await getTripWithDetails(id)
      if (!data) {
        toast({
          title: "Trip not found",
          description: "The trip you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }
      setTrip(data)
      setIsLoading(false)
    }

    fetchTrip()
  }, [id, router, toast])

  useEffect(() => {
    if (isAddActivityOpen && activitySearchQuery.length > 2) {
      const search = async () => {
        setIsSearchingActivities(true)
        const results = await searchActivities(activitySearchQuery)
        setActivitySearchResults(results)
        setIsSearchingActivities(false)
      }
      const timeoutId = setTimeout(search, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [activitySearchQuery, isAddActivityOpen])

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Are you sure you want to remove this city from your trip?")) return

    const success = await deleteTripStop(stopId)
    if (success && trip) {
      setTrip({
        ...trip,
        stops: trip.stops.filter((s) => s.id !== stopId),
      })
      toast({
        title: "Stop removed",
        description: "The city has been removed from your itinerary.",
      })
    }
  }

  const handleAddActivity = async (activityId: string) => {
    if (!selectedStopId || !trip) return

    const success = await addActivityToTrip(selectedStopId, activityId)
    if (success) {
      // Re-fetch trip data to update UI
      const updatedTrip = await getTripWithDetails(id)
      if (updatedTrip) setTrip(updatedTrip)

      toast({
        title: "Activity added!",
        description: "The experience has been added to your itinerary.",
      })
      setIsAddActivityOpen(false)
      setActivitySearchQuery("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto my-20" />}>
        {/* Hero Section */}
        <div className="relative h-[400px] w-full">
          <img
            src={trip.coverImageUrl || "/luxury-travel-landscape.jpg"}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container px-4 md:px-6 pb-12">
              <Button
                variant="ghost"
                className="mb-4 text-white hover:bg-white/20 -ml-2"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <Badge className="bg-secondary text-primary font-bold hover:bg-secondary/90">
                    {new Date(trip.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
                    {new Date(trip.endDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">{trip.name}</h1>
                  <p className="text-lg text-white/80 max-w-2xl">{trip.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="bg-white/20 border-white/30 text-white backdrop-blur-md hover:bg-white/30"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="container py-8 px-4 md:px-6">
          <Tabs defaultValue="itinerary" className="w-full" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-8 border-b pb-1">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                <TabsTrigger
                  value="itinerary"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 h-auto text-base"
                >
                  Itinerary
                </TabsTrigger>
                <TabsTrigger
                  value="budget"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 h-auto text-base"
                >
                  Budget & Costs
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-2 h-auto text-base"
                >
                  Calendar
                </TabsTrigger>
              </TabsList>

              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Stop
              </Button>
            </div>

            <TabsContent value="itinerary" className="mt-0">
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-8 space-y-12">
                  {trip.stops.map((stop, index) => (
                    <section key={stop.id} className="relative pl-8 md:pl-12">
                      {/* Vertical Timeline Line */}
                      {index < trip.stops.length - 1 && (
                        <div className="absolute left-4 md:left-6 top-10 bottom-[-48px] w-0.5 bg-border border-dashed border-l-2" />
                      )}

                      {/* Timeline Node */}
                      <div className="absolute left-1.5 md:left-3.5 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-10">
                        {index + 1}
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wider mb-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(stop.arrivalDate).toLocaleDateString()} -{" "}
                              {new Date(stop.departureDate).toLocaleDateString()}
                            </div>
                            <h2 className="text-3xl font-bold font-serif">
                              {stop.city.name}, {stop.city.country}
                            </h2>
                          </div>
                          <div className="flex gap-2">
                            <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-primary/20 hover:border-primary/50 text-primary"
                                  onClick={() => setSelectedStopId(stop.id)}
                                >
                                  <Plus className="mr-2 h-3 w-3" />
                                  Add Activity
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden">
                                <DialogHeader className="p-6 bg-primary text-primary-foreground">
                                  <DialogTitle className="text-xl font-serif">
                                    Add Activity to {stop.city.name}
                                  </DialogTitle>
                                  <DialogDescription className="text-primary-foreground/80">
                                    Search for local experiences and landmarks to enrich your trip.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="p-6 space-y-4">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search experiences..."
                                      className="pl-9"
                                      value={activitySearchQuery}
                                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                                    />
                                  </div>

                                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {isSearchingActivities ? (
                                      <div className="flex py-8 justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                      </div>
                                    ) : activitySearchResults.length > 0 ? (
                                      activitySearchResults.map((activity) => (
                                        <div
                                          key={activity.id}
                                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                        >
                                          <div className="flex items-center gap-3">
                                            <img
                                              src={activity.imageUrl || "/placeholder.svg"}
                                              alt=""
                                              className="h-10 w-10 rounded-md object-cover"
                                            />
                                            <div>
                                              <div className="text-sm font-bold">{activity.name}</div>
                                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                ${activity.estimatedCost} • {activity.duration}h
                                              </div>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-full p-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleAddActivity(activity.id)}
                                          >
                                            <PlusCircle className="h-5 w-5" />
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="py-12 text-center text-muted-foreground text-sm italic">
                                        {activitySearchQuery.length > 2
                                          ? "No matching activities found."
                                          : "Start typing to discover activities."}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => handleDeleteStop(stop.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          {stop.activities.length > 0 ? (
                            stop.activities.map((ta) => (
                              <Card
                                key={ta.id}
                                className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group"
                              >
                                <CardContent className="p-0 flex flex-col md:flex-row h-full md:h-32">
                                  <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                                    <img
                                      src={ta.activity.imageUrl || "/placeholder.svg"}
                                      alt={ta.activity.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4 flex flex-col justify-center flex-1">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                          <h4 className="font-bold text-lg">{ta.activity.name}</h4>
                                          <Badge variant="outline" className="text-[10px] uppercase h-5">
                                            {ta.activity.category}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {ta.scheduledTime || "Flexible"} • {ta.activity.duration}h
                                          </span>
                                          <span className="flex items-center">
                                            <DollarSign className="mr-1 h-3 w-3" />
                                            Est. ${ta.activity.estimatedCost}
                                          </span>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                              <p className="text-sm text-muted-foreground mb-4">
                                No activities planned yet for this stop.
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/explore?city=${stop.city.id}`}>Explore {stop.city.name}</Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  ))}

                  <div className="flex justify-center pt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-primary text-primary hover:bg-primary/5 h-14 px-8 bg-transparent"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Another Stop
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-8">
                  <Card className="border-none shadow-md overflow-hidden sticky top-24">
                    <CardHeader className="bg-primary text-primary-foreground p-6">
                      <CardTitle className="text-xl">Trip Summary</CardTitle>
                      <CardDescription className="text-primary-foreground/80">
                        Overview of your adventure
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-bold">14 Days</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Cities</span>
                          <span className="font-bold">{trip.stops.length} Cities</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Activities</span>
                          <span className="font-bold">
                            {trip.stops.reduce((acc, stop) => acc + stop.activities.length, 0)} Total
                          </span>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center">
                          <span className="font-bold text-primary uppercase text-xs tracking-wider">Est. Budget</span>
                          <span className="text-2xl font-bold text-primary">
                            ${trip.budget.totalEstimated.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center">
                          <Info className="mr-1 h-3 w-3" />
                          Next Activity
                        </h5>
                        <p className="text-sm font-medium">Eiffel Tower Visit</p>
                        <p className="text-xs text-muted-foreground">June 16, 10:00 AM</p>
                      </div>

                      <Button className="w-full">Download PDF Guide</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <TripBudgetBreakdown budget={trip.budget} stops={trip.stops} />
            </TabsContent>

            <TabsContent value="calendar">
              <div className="flex flex-col items-center justify-center py-24 bg-background rounded-xl border border-dashed">
                <Calendar className="h-12 w-12 text-primary mb-4 opacity-20" />
                <h3 className="text-xl font-bold mb-2">Calendar View Coming in Next Step</h3>
                <p className="text-muted-foreground">The visual timeline is currently being rendered.</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </Suspense>
    </div>
  )
}
