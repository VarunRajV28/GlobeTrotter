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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { TripBudgetBreakdown } from "@/components/trip-budget-breakdown" // importing new component
import { tripsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Trip } from "@/lib/types/database"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"

export default function TripDetailsPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("itinerary")
  const router = useRouter()
  const { toast } = useToast()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await tripsApi.getById(id)
        console.log('Trip response:', response)
        // API returns { trip: {...} } so extract the trip
        const tripData = response.trip || response
        if (!tripData) {
          toast({
            title: "Trip not found",
            description: "The trip you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }
        setTrip(tripData)
      } catch (error) {
        console.error('Failed to fetch trip:', error)
        toast({
          title: "Error",
          description: "Failed to load trip details.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [id, router, toast])

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/trips/share/${id}`
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    toast({
      title: "Link copied!",
      description: "Share this link with your travel companions.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleTogglePublic = async () => {
    try {
      await tripsApi.update(id, { isPublic: !trip?.isPublic })
      if (trip) {
        setTrip({ ...trip, isPublic: !trip.isPublic })
      }
      toast({
        title: trip?.isPublic ? "Trip is now private" : "Trip is now public",
        description: trip?.isPublic 
          ? "Only you can access this trip."
          : "Anyone with the link can view this trip.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trip visibility.",
        variant: "destructive",
      })
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
                    {trip.startDate && trip.endDate ? (
                      `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    ) : (
                      'Dates not set'
                    )}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">{trip.name}</h1>
                  <p className="text-lg text-white/80 max-w-2xl">{trip.description}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="bg-white/20 border-white/30 text-white backdrop-blur-md hover:bg-white/30"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share Your Trip</DialogTitle>
                        <DialogDescription>
                          Share this trip with friends and family. Anyone with the link can view it.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                              Link
                            </Label>
                            <Input
                              id="link"
                              readOnly
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/trips/share/${id}`}
                              className="font-mono text-sm"
                            />
                          </div>
                          <Button size="sm" className="px-3" onClick={handleCopyLink}>
                            {isCopied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="public">Make trip public</Label>
                          <Button
                            variant={trip?.isPublic ? "default" : "outline"}
                            size="sm"
                            onClick={handleTogglePublic}
                          >
                            {trip?.isPublic ? "Public" : "Private"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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

              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/trips/${id}/itinerary`}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Build Itinerary
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/trips/${id}/activities`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Activities
                  </Link>
                </Button>
              </div>
            </div>

            <TabsContent value="itinerary" className="mt-0">
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-8 space-y-12">
                  {trip.destinations && trip.destinations.map((destination: string, index: number) => {
                    // Filter activities for this destination city
                    const cityActivities = trip.tripActivities?.filter(
                      (ta) => ta.activity?.city?.name === destination
                    ) || []
                    
                    return (
                    <section key={`${destination}-${index}`} className="relative pl-8 md:pl-12">
                      {/* Vertical Timeline Line */}
                      {trip.destinations && index < trip.destinations.length - 1 && (
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
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Dates not set'}
                            </div>
                            <h2 className="text-3xl font-bold font-serif">
                              {destination}
                            </h2>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-primary/20 hover:border-primary/50 text-primary"
                              asChild
                            >
                              <Link href={`/trips/${id}/activities?city=${destination}`}>
                                <Plus className="mr-2 h-3 w-3" />
                                Add Activity
                              </Link>
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          {cityActivities && cityActivities.length > 0 ? (
                            cityActivities.map((ta: any) => (
                              <Card
                                key={ta.id}
                                className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group"
                              >
                                <CardContent className="p-0 flex flex-col md:flex-row h-full md:h-32">
                                  <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                                    <img
                                      src={ta.activity?.imageUrl || "/placeholder.svg"}
                                      alt={ta.activity?.name || "Activity"}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4 flex flex-col justify-center flex-1">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                          <h4 className="font-bold text-lg">{ta.activity?.name}</h4>
                                          <Badge variant="outline" className="text-[10px] uppercase h-5">
                                            {ta.activity?.category}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {ta.date ? new Date(ta.date).toLocaleDateString() : "Flexible"} • {ta.activity?.duration}h
                                          </span>
                                          <span className="flex items-center">
                                            <DollarSign className="mr-1 h-3 w-3" />
                                            Est. ${ta.activity?.estimatedCost}
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
                                No activities planned yet for this destination.
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/trips/${id}/activities?city=${destination}`}>
                                  <Search className="mr-2 h-4 w-4" />
                                  Browse Activities
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  )})}


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
                          <span className="font-bold">{trip.destinations?.length || 0} Cities</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Activities</span>
                          <span className="font-bold">
                            {trip.tripActivities?.length || 0} Total
                          </span>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center">
                          <span className="font-bold text-primary uppercase text-xs tracking-wider">Est. Budget</span>
                          <span className="text-2xl font-bold text-primary">
                            ${trip.budget ? trip.budget.toLocaleString() : '0'}
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
              <div className="flex flex-col items-center justify-center py-24 bg-background rounded-xl border border-dashed">
                <DollarSign className="h-16 w-16 text-primary mb-6 opacity-50" />
                <h3 className="text-2xl font-bold mb-3">Budget & Cost Breakdown</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">View detailed financial breakdown, daily spending, and cost analysis.</p>
                <Button size="lg" asChild>
                  <Link href={`/trips/${id}/budget`}>
                    View Full Budget Analysis
                  </Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="flex flex-col items-center justify-center py-24 bg-background rounded-xl border border-dashed">
                <Calendar className="h-16 w-16 text-primary mb-6 opacity-50" />
                <h3 className="text-2xl font-bold mb-3">Calendar & Timeline View</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">Visualize your trip in a calendar format with day-by-day breakdown.</p>
                <Button size="lg" asChild>
                  <Link href={`/trips/${id}/calendar`}>
                    Open Calendar View
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </Suspense>
    </div>
  )
}
