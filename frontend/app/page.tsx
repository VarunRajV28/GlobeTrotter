import Link from "next/link"
import { Plane, Map, Globe, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-48">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-primary bg-primary/5">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
                New: AI-Powered Itinerary Suggestions
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-serif max-w-4xl text-primary">
                Design Your Perfect Journey with <span className="text-secondary">GlobalTrotters</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed">
                The most intuitive travel planner for multi-city adventures. Create, manage, and share your dream
                itineraries in minutes.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-8">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/signup">
                    Start Planning Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
                  <Link href="/explore">Explore Destinations</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-700" />
          </div>
        </section>

        <section className="bg-muted/50 py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-start gap-4 p-6 bg-background rounded-2xl shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Multi-City Itineraries</h3>
                <p className="text-muted-foreground">
                  Easily add stops across multiple cities. Organize your dates, activities, and transport in one place.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4 p-6 bg-background rounded-2xl shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Global Discovery</h3>
                <p className="text-muted-foreground">
                  Search through thousands of cities and activities. Get insider tips on cost, popularity, and hidden
                  gems.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4 p-6 bg-background rounded-2xl shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Budget Management</h3>
                <p className="text-muted-foreground">
                  Keep track of every dollar. Get detailed cost breakdowns and alerts to stay within your travel budget.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold font-serif">GlobalTrotters</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 GlobalTrotters Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
