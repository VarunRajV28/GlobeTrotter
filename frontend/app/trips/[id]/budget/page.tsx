"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PieChart,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { tripsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { TripBudgetBreakdown } from "@/components/trip-budget-breakdown"

interface BudgetCategory {
  name: string
  amount: number
  percentage: number
  icon: any
  color: string
}

export default function BudgetPage() {
  const { id } = useParams() as { id: string }
  const [trip, setTrip] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetCategory[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTripData()
  }, [id])

  const fetchTripData = async () => {
    try {
      const response = await tripsApi.getById(id)
      // API returns { trip: {...} } so extract the trip
      const tripData = response.trip || response
      setTrip(tripData)
      calculateBudget(tripData)
    } catch (error: any) {
      console.error('Failed to fetch trip:', error)
      toast({
        title: "Error",
        description: "Failed to load trip data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateBudget = (tripData: any) => {
    const totalBudget = tripData?.budget || 0

    const categories: BudgetCategory[] = [
      {
        name: "Accommodation",
        amount: totalBudget * 0.35,
        percentage: 35,
        icon: "🏨",
        color: "bg-blue-500",
      },
      {
        name: "Transportation",
        amount: totalBudget * 0.25,
        percentage: 25,
        icon: "✈️",
        color: "bg-green-500",
      },
      {
        name: "Food & Dining",
        amount: totalBudget * 0.20,
        percentage: 20,
        icon: "🍽️",
        color: "bg-orange-500",
      },
      {
        name: "Activities",
        amount: totalBudget * 0.15,
        percentage: 15,
        icon: "🎭",
        color: "bg-purple-500",
      },
      {
        name: "Other",
        amount: totalBudget * 0.05,
        percentage: 5,
        icon: "💰",
        color: "bg-gray-500",
      },
    ]

    setBudgetBreakdown(categories)
  }

  const totalSpent = budgetBreakdown.reduce((sum, cat) => sum + cat.amount * 0.6, 0) // Mock 60% spent
  const totalBudget = trip?.budget || 0
  const remaining = totalBudget - totalSpent
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const avgCostPerDay = trip?.startDate && trip?.endDate
    ? totalSpent / Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

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
      <main className="flex-1 container max-w-6xl py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary">Budget & Costs</h1>
            <p className="text-muted-foreground">{trip?.name}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">${totalBudget.toLocaleString()}</span>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">
                  ${totalSpent.toLocaleString()}
                </span>
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <Progress value={percentSpent} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {percentSpent.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                  ${Math.abs(remaining).toLocaleString()}
                </span>
                {remaining < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
              {remaining < 0 && (
                <Badge variant="destructive" className="mt-2">
                  Over Budget
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {percentSpent > 90 && (
          <Card className="mb-6 border-orange-500 bg-orange-500/10">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Budget Alert</p>
                <p className="text-sm text-orange-700">
                  You've used {percentSpent.toFixed(0)}% of your budget. Consider adjusting your spending.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Budget Breakdown
              </CardTitle>
              <CardDescription>Estimated cost allocation by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetBreakdown.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="font-semibold">
                      ${category.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={category.percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Spending</CardTitle>
              <CardDescription>Track your average cost per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-6 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Average Cost Per Day</p>
                  <p className="text-4xl font-bold text-primary">
                    ${avgCostPerDay.toFixed(0)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Highest spending day</span>
                    <span className="font-semibold">$450</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Lowest spending day</span>
                    <span className="font-semibold">$120</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Days over budget</span>
                    <Badge variant="destructive">3 days</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
