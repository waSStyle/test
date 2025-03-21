"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Scroll, Check, X, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [villages, setVillages] = useState([])
  const [clans, setClans] = useState([])
  const [selectedVillage, setSelectedVillage] = useState("")
  const [selectedClan, setSelectedClan] = useState("")
  const [biography, setBiography] = useState("")
  const [mcUsername, setMcUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch villages and clans
      fetch("/api/villages")
        .then((res) => res.json())
        .then((data) => {
          setVillages(data)
        })
        .catch((err) => {
          console.error("Error fetching villages:", err)
        })

      // Fetch user's applications
      fetch("/api/applications")
        .then((res) => res.json())
        .then((data) => {
          setApplications(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching applications:", err)
          setIsLoading(false)
        })
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (selectedVillage) {
      const village = villages.find((v) => v.id === selectedVillage)
      if (village) {
        setClans(village.clans)
      }
    } else {
      setClans([])
    }
    setSelectedClan("")
  }, [selectedVillage, villages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate Minecraft username with Mojang API
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcUsername}`)

      if (!mojangResponse.ok) {
        toast({
          title: "Invalid Minecraft Username",
          description: "Please enter a valid Minecraft username",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const mojangData = await mojangResponse.json()
      const mcUuid = mojangData.id

      // Update user's MC UUID
      await fetch("/api/users/mc-uuid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mcUuid }),
      })

      // Submit application
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          villageId: selectedVillage,
          clanId: selectedClan || null,
          biography,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setApplications([...applications, data])
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully",
        })

        // Reset form
        setSelectedVillage("")
        setSelectedClan("")
        setBiography("")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to submit application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  // If loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Card
            className="max-w-md w-full bg-[#241c14] border-[#473f14]"
            style={{
              backgroundImage: "url('/images/paper-texture.png')",
              backgroundRepeat: "repeat",
              backgroundBlendMode: "overlay",
            }}
          >
            <CardHeader>
              <motion.div variants={itemVariants}>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5" />
                  Shinobi Application
                </CardTitle>
                <CardDescription className="text-[#e0d8c0]/70">You need to be logged in to apply</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.p variants={itemVariants} className="text-[#e0d8c0]/80 mb-4">
                Please login with Discord to access the application scroll.
              </motion.p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <motion.div variants={itemVariants}>
                <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Village Gate
                  </Link>
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button asChild className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]">
                  <Link href="/login">Login with Discord</Link>
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  // If has pending application
  const hasPendingApplication = applications.some((app) => app.status === "PENDING" || app.status === "INTERVIEW")

  return (
    <div className="min-h-screen bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <div className="container mx-auto py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Scroll className="h-6 w-6" />
              Shinobi Application
            </h1>
            <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Village Gate
              </Link>
            </Button>
          </motion.div>

          {/* Application Status Cards */}
          {applications.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-xl font-bold mb-4">Your Applications</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {applications.map((app) => (
                  <Card
                    key={app.id}
                    className="bg-[#241c14] border-[#473f14]"
                    style={{
                      backgroundImage: "url('/images/paper-texture.png')",
                      backgroundRepeat: "repeat",
                      backgroundBlendMode: "overlay",
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{app.village.name}</CardTitle>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <CardDescription className="text-[#e0d8c0]/70">
                        {app.clan ? `Clan: ${app.clan.name}` : "No clan selected"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-[#e0d8c0]/80">
                        Submitted on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
                        asChild
                      >
                        <Link href={`/applications/${app.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* New Application Form */}
          {!hasPendingApplication && (
            <motion.div variants={itemVariants}>
              <Card
                className="bg-[#241c14] border-[#473f14]"
                style={{
                  backgroundImage: "url('/images/paper-texture.png')",
                  backgroundRepeat: "repeat",
                  backgroundBlendMode: "overlay",
                }}
              >
                <CardHeader>
                  <CardTitle>New Application</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">
                    Fill out the scroll to join our shinobi world
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mcUsername">Minecraft Username</Label>
                      <Input
                        id="mcUsername"
                        value={mcUsername}
                        onChange={(e) => setMcUsername(e.target.value)}
                        placeholder="Enter your Minecraft username"
                        className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                        required
                      />
                      <p className="text-xs text-[#e0d8c0]/60">We'll verify this with the Mojang API</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="village">Village</Label>
                      <Select value={selectedVillage} onValueChange={setSelectedVillage} required>
                        <SelectTrigger id="village" className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0]">
                          <SelectValue placeholder="Select a village" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
                          {villages.map((village) => (
                            <SelectItem key={village.id} value={village.id}>
                              {village.name} ({village.memberCount}/{village.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedVillage && clans.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="clan">Clan (Optional)</Label>
                        <Select value={selectedClan} onValueChange={setSelectedClan}>
                          <SelectTrigger id="clan" className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0]">
                            <SelectValue placeholder="Select a clan" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
                            <SelectItem value="no-clan">No Clan</SelectItem>
                            {clans.map((clan) => (
                              <SelectItem key={clan.id} value={clan.id} disabled={clan.memberCount >= clan.capacity}>
                                {clan.name} ({clan.memberCount}/{clan.capacity})
                                {clan.memberCount >= clan.capacity ? " - Full" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="biography">Character Biography</Label>
                      <Textarea
                        id="biography"
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                        placeholder="Tell us about your character's background, personality, and goals..."
                        className="min-h-[150px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                        required
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Pending Application Message */}
          {hasPendingApplication && (
            <motion.div variants={itemVariants}>
              <Card
                className="bg-[#241c14] border-[#473f14]"
                style={{
                  backgroundImage: "url('/images/paper-texture.png')",
                  backgroundRepeat: "repeat",
                  backgroundBlendMode: "overlay",
                }}
              >
                <CardHeader>
                  <CardTitle>Application In Progress</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">
                    You already have an application being processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-6 text-center">
                    <div>
                      <Clock className="mx-auto h-12 w-12 text-[#e0d8c0]/60 mb-4" />
                      <p className="text-[#e0d8c0]/80 mb-2">
                        Your application is currently being reviewed by our village elders.
                      </p>
                      <p className="text-[#e0d8c0]/60 text-sm">
                        You can submit a new application once your current application is processed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function ApplicationStatusBadge({ status }) {
  switch (status) {
    case "PENDING":
      return (
        <div className="px-2 py-1 rounded-full bg-yellow-900/30 border border-yellow-800 text-yellow-200 text-xs font-medium">
          Pending
        </div>
      )
    case "INTERVIEW":
      return (
        <div className="px-2 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-200 text-xs font-medium">
          Interview
        </div>
      )
    case "ACCEPTED":
      return (
        <div className="px-2 py-1 rounded-full bg-green-900/30 border border-green-800 text-green-200 text-xs font-medium flex items-center">
          <Check className="h-3 w-3 mr-1" />
          Accepted
        </div>
      )
    case "REJECTED":
      return (
        <div className="px-2 py-1 rounded-full bg-red-900/30 border border-red-800 text-red-200 text-xs font-medium flex items-center">
          <X className="h-3 w-3 mr-1" />
          Rejected
        </div>
      )
    case "ARCHIVED":
      return (
        <div className="px-2 py-1 rounded-full bg-gray-900/30 border border-gray-800 text-gray-200 text-xs font-medium">
          Archived
        </div>
      )
    default:
      return null
  }
}

