"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Loader2, ArrowLeft, Check, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { tripsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Trip } from "@/lib/types/database"

export default function EditTripPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<Trip | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripsApi.getById(id)
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
        setName(data.name)
        setDescription(data.description || "")
        // Convert ISO date strings to YYYY-MM-DD format for input fields
        setStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "")
        setEndDate(data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "")
        setBudget(data.budget?.toString() || "")
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch trip:', error)
        toast({
          title: "Error",
          description: "Failed to load trip.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    fetchTrip()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Invalid dates",
        description: "Start date cannot be after end date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await tripsApi.update(id, {
        name,
        description,
        startDate,
        endDate,
        budget: budget ? parseFloat(budget) : undefined,
      })
      toast({
        title: "Trip updated!",
        description: "Your changes have been saved.",
      })
      router.push(`/trips/${id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update trip.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this entire trip? This action cannot be undone.")
    if (!confirmed) return

    try {
      await tripsApi.delete(id)
      toast({
        title: "Trip deleted",
        description: "Your trip has been successfully removed.",
      })
      router.push("/trips")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete trip.",
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

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-3xl py-12 px-4 md:px-6">
        <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-primary" asChild>
          <button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trip Details
          </button>
        </Button>

        <Card className="border-none shadow-xl bg-background overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-serif font-bold">Edit Trip Details</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Modify the foundational information for your itinerary.
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Trip
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Trip Name
                  </Label>
                  <Input
                    id="name"
                    className="h-12 text-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-base font-semibold">
                      Start Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        className="pl-10 h-12"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-base font-semibold">
                      End Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        className="pl-10 h-12"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    className="min-h-[120px] text-base resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-base font-semibold">
                    Budget (Optional)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 5000"
                    className="h-12"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">Set your budget in USD.</p>
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col md:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-lg bg-transparent"
                  onClick={() => router.back()}
                >
                  Discard Changes
                </Button>
                <Button type="submit" size="lg" className="flex-1 h-14 text-lg shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Save Trip Info
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-primary/5 p-6 border-t flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2 mt-1">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground italic">
              "Changing trip dates will not automatically adjust stop dates. You'll need to update stop schedules
              separately in the Itinerary Builder."
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
