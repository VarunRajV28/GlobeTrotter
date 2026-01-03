"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CalendarIcon, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { getTripWithDetails } from "@/lib/data/queries"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import type { TripWithDetails, TripActivity } from "@/lib/types/database"

export default function TripCalendarPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<TripWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTrip = async () => {
      const data = await getTripWithDetails(id)
      if (!data) {
        toast({
          title: "Trip not found",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }
      setTrip(data)
      setCurrentDate(new Date(data.startDate))
      setIsLoading(false)
    }

    fetchTrip()
  }, [id, router, toast])

  const getActivitiesForDate = (date: Date): TripActivity[] => {
    if (!trip) return []
    const activities: TripActivity[] = []
    const dateStr = date.toISOString().split("T")[0]

    trip.stops.forEach((stop) => {
      const stopStart = new Date(stop.arrivalDate)
      const stopEnd = new Date(stop.departureDate)

      if (date >= stopStart && date <= stopEnd) {
        stop.activities.forEach((activity) => {
          // In a real app, activities would have specific dates
          // Here we'll just check if they belong to this stop's time range
          // For the sake of the calendar mock, we'll assign them to specific days
          activities.push(activity)
        })
      }
    })

    return activities
  }

  const renderCalendar = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const days = []

    // Previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`prev-${i}`} className="h-32 bg-muted/20 border p-2 opacity-50" />)
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = new Date().toDateString() === date.toDateString()
      const isTripDay = trip && date >= new Date(trip.startDate) && date <= new Date(trip.endDate)
      const activities = getActivitiesForDate(date)

      days.push(
        <div
          key={day}
          className={`h-40 border p-2 relative group hover:bg-muted/10 transition-colors ${
            isToday ? "bg-primary/5" : "bg-background"
          } ${isTripDay ? "ring-1 ring-inset ring-primary/20" : ""}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                isToday ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              {day}
            </span>
            {isTripDay && (
              <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-5 bg-secondary/10">
                Trip
              </Badge>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-24 scrollbar-none">
            {activities.slice(0, 3).map((ta) => (
              <div
                key={ta.id}
                className="text-[10px] p-1.5 rounded bg-primary/10 border border-primary/20 text-primary truncate font-medium cursor-pointer hover:bg-primary/20 transition-colors"
                title={ta.activity.name}
              >
                {ta.activity.name}
              </div>
            ))}
            {activities.length > 3 && (
              <div className="text-[10px] text-muted-foreground text-center font-medium">
                + {activities.length - 3} more
              </div>
            )}
          </div>

          <button className="absolute bottom-2 right-2 p-1 rounded-full bg-primary text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <Plus className="h-3 w-3" />
          </button>
        </div>,
      )
    }

    return days
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  if (isLoading || !trip) {
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" asChild>
                <button onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </Button>
              <div>
                <h1 className="text-3xl font-bold font-serif text-primary">Trip Calendar</h1>
                <p className="text-muted-foreground">Visualize your journey across the month</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background border rounded-lg p-1 shadow-sm">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 font-bold min-w-40 text-center">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <Card className="border-none shadow-xl overflow-hidden">
                <div className="grid grid-cols-7 bg-primary text-primary-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-widest">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">{renderCalendar()}</div>
              </Card>
            </div>

            <aside className="lg:col-span-3 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Schedule</CardTitle>
                  <CardDescription>
                    {currentDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getActivitiesForDate(currentDate).length > 0 ? (
                    getActivitiesForDate(currentDate).map((ta) => (
                      <div key={ta.id} className="flex gap-3 items-start group">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold group-hover:text-primary transition-colors cursor-pointer">
                            {ta.activity.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {ta.scheduledTime || "Flexible"} • {ta.activity.duration}h
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <CalendarIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-sm text-muted-foreground italic">No activities planned for this day.</p>
                      <Button variant="outline" size="sm" className="bg-transparent" asChild>
                        <button onClick={() => router.push("/explore")}>Add Something</button>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-secondary/10 border-secondary/20">
                <CardContent className="p-6">
                  <h4 className="font-bold text-primary mb-2">Did You Know?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Visualizing your trip in a calendar helps identify "pacing" issues. Try to balance high-activity
                    days with rest periods to avoid travel burnout!
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
