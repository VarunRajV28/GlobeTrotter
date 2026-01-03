"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plane, ArrowLeft, Loader2, Mail, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
      toast({
        title: "Email sent!",
        description: "Check your inbox for password reset instructions.",
      })
    }, 1500)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-serif text-2xl font-bold text-primary">GlobalTrotters</span>
        </div>

        <Card className="border-none shadow-2xl bg-background">
          <CardHeader className="space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {isSent ? "Check your email" : "Reset password"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSent
                ? `We've sent reset instructions to ${email}`
                : "Enter your email address and we'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base shadow-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col space-y-4">
                <p className="text-sm text-center text-muted-foreground bg-muted/50 p-4 rounded-lg border">
                  Didn't receive the email? Check your spam folder or try another email address.
                </p>
                <Button variant="outline" className="w-full h-12 bg-transparent" onClick={() => setIsSent(false)}>
                  Try again
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-muted/20 rounded-b-xl">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
