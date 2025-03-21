"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Gamepad2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [mcUsername, setMcUsername] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const handleVerifyMinecraft = async () => {
    if (!mcUsername) {
      toast({
        title: "Error",
        description: "Please enter your Minecraft username",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    try {
      // Validate Minecraft username with Mojang API
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcUsername}`)

      if (!mojangResponse.ok) {
        toast({
          title: "Invalid Minecraft Username",
          description: "Please enter a valid Minecraft username",
          variant: "destructive",
        })
        setIsVerifying(false)
        return
      }

      const mojangData = await mojangResponse.json()
      const mcUuid = mojangData.id

      // Update user's MC UUID
      const response = await fetch("/api/users/mc-uuid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mcUuid }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your Minecraft account has been verified successfully",
        })

        // Force refresh the session to update the mcUuid
        window.location.reload()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to verify Minecraft account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying Minecraft account:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }

    setIsVerifying(false)
  }

  // Get Discord avatar URL
  const avatarUrl =
    session?.user?.image ||
    (session?.user?.discordId && session?.user?.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`
      : null)

  return (
    <div className="min-h-screen bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <div className="container mx-auto py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              Ninja Profile
            </h1>
            <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Village Gate
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#241c14] border-[#473f14]">
                <CardHeader>
                  <CardTitle>Discord Profile</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">Your Discord account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarUrl || ""} alt={session?.user?.name || "User"} />
                      <AvatarFallback className="bg-[#473f14] text-[#e0d8c0] text-xl">
                        {session?.user?.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
                      <p className="text-sm text-[#e0d8c0]/70">{session?.user?.email}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {session?.user?.roles?.length ? (
                        session.user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="border-[#473f14] text-[#e0d8c0]">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-[#e0d8c0]/60">No roles assigned</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Minecraft Account Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#241c14] border-[#473f14]">
                <CardHeader>
                  <CardTitle>Minecraft Account</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">
                    Link your Minecraft account to your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session?.user?.mcUuid ? (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-[#0c0c0c]/50 rounded-md flex items-center justify-center">
                        <Gamepad2 className="h-8 w-8 text-[#e0d8c0]/70" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Minecraft Account Verified</h3>
                        <p className="text-sm text-[#e0d8c0]/70">UUID: {session.user.mcUuid}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-[#0c0c0c]/50 rounded-md flex items-center justify-center">
                          <Gamepad2 className="h-8 w-8 text-[#e0d8c0]/70" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">No Minecraft Account</h3>
                          <p className="text-sm text-[#e0d8c0]/70">Verify your account to apply for villages</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mcUsername">Minecraft Username</Label>
                        <div className="flex gap-2">
                          <Input
                            id="mcUsername"
                            value={mcUsername}
                            onChange={(e) => setMcUsername(e.target.value)}
                            placeholder="Enter your Minecraft username"
                            className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                          />
                          <Button
                            onClick={handleVerifyMinecraft}
                            disabled={isVerifying || !mcUsername}
                            className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
                          >
                            {isVerifying ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                        <p className="text-xs text-[#e0d8c0]/60">We'll verify this with the Mojang API</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Applications Card */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="bg-[#241c14] border-[#473f14]">
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">
                    View and manage your village applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Button asChild className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]">
                      <Link href="/applications">View Applications</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

