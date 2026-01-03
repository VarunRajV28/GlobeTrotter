"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Shield, Trash2, Camera, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { authApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { User as UserType } from "@/lib/types/database"

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getProfile()
        console.log('Profile response:', response)
        // API returns { user: {...} } so we need to extract the user
        const userData = response.user || response
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please login again.",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [router, toast])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      })
    }, 1000)
  }

  if (isLoading || !user) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container max-w-4xl py-12 px-4 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">Manage your profile and travel preferences.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4 space-y-6">
              <Card className="border shadow-md overflow-hidden bg-card">
                <div className="h-24 bg-primary" />
                <CardContent className="pt-0 flex flex-col items-center -mt-12">
                  <div className="relative group">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-lg"
                    />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white h-6 w-6" />
                    </button>
                  </div>
                  <h3 className="mt-4 font-bold text-lg text-foreground">{user.name}</h3>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </CardContent>
              </Card>

              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10 font-bold hover:bg-primary/20">
                  <User className="mr-2 h-4 w-4" />
                  General
                </Button>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy & Security
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </nav>
            </div>

            <div className="md:col-span-8">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your basic info and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue={user.email} disabled />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Travel Preferences</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="usd">
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button className="ml-auto" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
