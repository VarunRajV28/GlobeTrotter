"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Plane,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  MoreVertical,
  Activity,
  DollarSign,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navbar } from "@/components/navbar"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const analyticsData = [
  { month: "Jan", users: 1200, trips: 450 },
  { month: "Feb", users: 1900, trips: 620 },
  { month: "Mar", users: 2400, trips: 890 },
  { month: "Apr", users: 2100, trips: 750 },
  { month: "May", users: 2800, trips: 1100 },
  { month: "Jun", users: 3500, trips: 1450 },
]

const topDestinations = [
  { city: "Paris", trips: 245, growth: 12 },
  { city: "Tokyo", trips: 189, growth: 24 },
  { city: "Barcelona", trips: 156, growth: -5 },
  { city: "New York", trips: 134, growth: 8 },
  { city: "London", trips: 122, growth: 15 },
]

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

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
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif text-primary">Admin Analytics</h1>
              <p className="text-muted-foreground">Monitor platform growth and user trends</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-background">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button size="sm">Download Report</Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Users", value: "12,450", change: "+14%", icon: Users, trend: "up" },
              { label: "Active Trips", value: "3,890", change: "+8%", icon: Plane, trend: "up" },
              { label: "Global Stops", value: "15,670", change: "-2%", icon: MapPin, trend: "down" },
              { label: "Avg. Budget", value: "$4,200", change: "+22%", icon: DollarSign, trend: "up" },
            ].map((stat, i) => (
              <Card key={stat.label} className="border-none shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div
                    className={`text-xs flex items-center mt-1 font-bold ${stat.trend === "up" ? "text-green-600" : "text-destructive"}`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                    <span className="text-muted-foreground font-normal ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Chart Section */}
            <Card className="lg:col-span-8 border-none shadow-md overflow-hidden bg-background">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Growth Overview</CardTitle>
                    <CardDescription>User registrations vs Trips created</CardDescription>
                  </div>
                  <Tabs defaultValue="6m" className="w-[180px]">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-8">
                      <TabsTrigger value="1m" className="text-[10px]">
                        1M
                      </TabsTrigger>
                      <TabsTrigger value="3m" className="text-[10px]">
                        3M
                      </TabsTrigger>
                      <TabsTrigger value="6m" className="text-[10px]">
                        6M
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Users" />
                      <Bar dataKey="trips" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Trips" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t bg-muted/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-xs font-medium">New Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <span className="text-xs font-medium">Trips Created</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold">
                  View Data Source
                </Button>
              </CardFooter>
            </Card>

            {/* Sidebar Stats */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-md overflow-hidden bg-background">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Top Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {topDestinations.map((dest) => (
                      <div
                        key={dest.city}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-bold text-sm">{dest.city}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold">{dest.trips} trips</div>
                          <div
                            className={`text-[10px] font-bold ${dest.growth > 0 ? "text-green-600" : "text-destructive"}`}
                          >
                            {dest.growth > 0 ? "+" : ""}
                            {dest.growth}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold border-primary/20 text-primary bg-transparent"
                  >
                    See Full Rankings
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-4 w-4 text-secondary" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Server Load</span>
                      <span>32%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[32%]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">All Systems Operational</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* User Management Table */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Latest user interactions and trip initializations</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-primary/20 text-primary">
                View All Users
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Plan</TableHead>
                    <TableHead className="font-bold">Trips</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "John Doe", email: "john@example.com", plan: "Pro", trips: 12, status: "Active" },
                    { name: "Sarah Smith", email: "sarah@example.com", plan: "Free", trips: 2, status: "Inactive" },
                    { name: "Alex Johnson", email: "alex@example.com", plan: "Pro", trips: 24, status: "Active" },
                    { name: "Emily Brown", email: "emily@example.com", plan: "Pro", trips: 8, status: "Active" },
                  ].map((user) => (
                    <TableRow key={user.email} className="hover:bg-muted/10">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{user.name}</div>
                            <div className="text-[10px] text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.plan === "Pro" ? "default" : "secondary"} className="text-[10px] h-5">
                          {user.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{user.trips}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-muted-foreground"}`}
                          />
                          <span className="text-xs">{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
