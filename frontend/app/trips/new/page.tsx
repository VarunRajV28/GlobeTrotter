"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plane, Calendar, Info, Camera, Loader2, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Navbar } from "@/components/navbar"
import { getCurrentUser } from "@/lib/auth/mock-auth"
import { createTrip } from "@/lib/data/queries"
import { useToast } from "@/hooks/use-toast"

export default function CreateTripPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCurrentUser()
    if (!user) return

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
      const trip = await createTrip(user.id, {
        name,
        description,
        startDate,
        endDate,
        isPublic,
        coverImageUrl: "/luxury-travel-landscape.jpg",
      })

      toast({
        title: "Trip created!",
        description: "Time to add some stops and activities.",
      })

      router.push(`/trips/${trip.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-3xl py-12 px-4 md:px-6">
        <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-primary" asChild>
          <button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
        </Button>

        <Card className="border-none shadow-xl bg-background overflow-hidden">
          <div className="h-48 bg-primary/10 relative flex items-center justify-center border-b border-dashed">
            <div className="text-center space-y-2 px-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg mb-4">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold font-serif text-primary">Start Your Adventure</h1>
              <p className="text-muted-foreground max-w-md">
                Every great journey begins with a single step. Tell us about your dream trip.
              </p>
            </div>
            <div className="absolute bottom-4 right-4">
              <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm border-white/30">
                <Camera className="mr-2 h-4 w-4" />
                Upload Cover
              </Button>
            </div>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Trip Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Summer in Europe 2026"
                    className="h-12 text-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Choose a name that inspires you.</p>
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
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Where are you going? What are you looking forward to?"
                    className="min-h-[120px] text-base resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label htmlFor="public" className="text-base font-semibold">
                      Public Itinerary
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow others to view and get inspired by your plan.</p>
                  </div>
                  <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full h-14 text-lg shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Your Trip...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Initialize Itinerary
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
              "Don't worry about getting everything perfect right now. You can always change your dates and details
              later as you build your plan."
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
