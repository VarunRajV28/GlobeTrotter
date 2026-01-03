"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Calendar, Search, Filter, Loader2, MoreVertical, Edit2, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Navbar } from "@/components/navbar"
import { getCurrentUser } from "@/lib/auth/mock-auth"
import { getTripsByUser, deleteTrip } from "@/lib/data/queries"
import { useToast } from "@/hooks/use-toast"
import type { Trip } from "@/lib/types/database"

function TripsContent() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTrips = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      const userTrips = await getTripsByUser(currentUser.id)
      setTrips(userTrips)
      setIsLoading(false)
    }

    fetchTrips()
  }, [router])

  const handleDeleteTrip = async (tripId: string) => {
    const confirmed = confirm("Are you sure you want to delete this trip? This action cannot be undone.")
    if (!confirmed) return

    const success = await deleteTrip(tripId)
    if (success) {
      setTrips(trips.filter((t) => t.id !== tripId))
      toast({
        title: "Trip deleted",
        description: "Your trip has been successfully removed.",
      })
    }
  }

  const filteredTrips = trips.filter((trip) => trip.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary">My Trips</h1>
          <p className="text-muted-foreground">Manage your past and upcoming adventures</p>
        </div>
        <Button asChild>
          <Link href="/trips/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Trip
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden border-none shadow-md group">
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={trip.coverImageUrl || "/placeholder.svg?height=160&width=300"}
                  alt={trip.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/trips/${trip.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/trips/${trip.id}/edit`} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Info
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteTrip(trip.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Trip
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{trip.name}</CardTitle>
                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${trip.isPublic ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}`}
                  >
                    {trip.isPublic ? "Public" : "Private"}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="default" className="w-full" asChild>
                  <Link href={`/trips/${trip.id}`}>Manage Plan</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-background rounded-xl border-dashed border-2">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No trips found</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            {searchQuery
              ? `We couldn't find any trips matching "${searchQuery}".`
              : "You haven't planned any trips yet. Time to start your next adventure!"}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          ) : (
            <Button asChild>
              <Link href="/trips/new">Plan Your First Trip</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyTripsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <Suspense
          fallback={
            <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <TripsContent />
        </Suspense>
      </main>
    </div>
  )
}
