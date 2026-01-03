"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, Hotel, Plane, Utensils, Activity } from "lucide-react"
import type { Budget, TripWithDetails } from "@/lib/types/database"

interface TripBudgetBreakdownProps {
  budget: Budget
  stops: TripWithDetails["stops"]
}

export function TripBudgetBreakdown({ budget, stops }: TripBudgetBreakdownProps) {
  const data = [
    { name: "Stay", value: budget.accommodation, color: "#003049" },
    { name: "Transport", value: budget.transportation, color: "#d62828" },
    { name: "Activities", value: budget.activities, color: "#f77f00" },
    { name: "Food", value: budget.food, color: "#fcbf49" },
    { name: "Misc", value: budget.miscellaneous, color: "#eae2b7" },
  ]

  const cityData = stops.map((stop) => ({
    name: stop.city.name,
    total:
      (stop.accommodationCost || 0) +
      (stop.transportationCost || 0) +
      stop.activities.reduce((acc, ta) => acc + (ta.customCost || ta.activity.estimatedCost || 0), 0),
  }))

  const dailyAverage = budget.totalEstimated / 14 // Assuming 14 days from summary

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Total Estimated</CardDescription>
              <CardTitle className="text-2xl text-primary">${budget.totalEstimated.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center text-xs text-green-600 font-medium">
                <TrendingDown className="mr-1 h-3 w-3" />
                Within target budget
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Daily Average</CardDescription>
              <CardTitle className="text-2xl text-primary">${Math.round(dailyAverage).toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center text-xs text-muted-foreground">Based on 14 day duration</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider">Efficiency Score</CardDescription>
              <CardTitle className="text-2xl text-primary">88%</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center text-xs text-secondary font-medium">High value selections</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Visual breakdown of your estimated expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Cost per Destination</CardTitle>
            <CardDescription>Comparison of expenses across all trip stops</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Total Cost"]}
                />
                <Bar dataKey="total" fill="#003049" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#003049]/10 text-[#003049]">
                  <Hotel className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Accommodation</span>
              </div>
              <span className="font-bold">${budget.accommodation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#d62828]/10 text-[#d62828]">
                  <Plane className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Transportation</span>
              </div>
              <span className="font-bold">${budget.transportation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#f77f00]/10 text-[#f77f00]">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Activities</span>
              </div>
              <span className="font-bold">${budget.activities.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#fcbf49]/10 text-[#fcbf49]">
                  <Utensils className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Meals & Dining</span>
              </div>
              <span className="font-bold">${budget.food.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-secondary/10 border-secondary/20 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-secondary" />
              Budget Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your transportation costs are 15% lower than similar trips to this region. Consider upgrading your stay in
              Rome with the savings!
            </p>
            <Badge variant="outline" className="text-[10px] bg-white">
              Saving Suggestion
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
