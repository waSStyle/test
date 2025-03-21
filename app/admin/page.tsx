"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Scroll, User, Settings } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import ApplicationsGrid from "@/components/admin/applications-grid"
import UsersGrid from "@/components/admin/users-grid"
import VillageManager from "@/components/admin/village-manager"
import SettingsPanel from "@/components/admin/settings-panel"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
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
      // Check if user has admin role
      const userRoles = session?.user?.roles || []
      if (userRoles.includes("admin") || userRoles.includes("moderator")) {
        setIsAdmin(true)
      } else {
        // Redirect non-admin users
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin panel",
          variant: "destructive",
        })
        router.push("/")
      }
      setIsLoading(false)
    } else if (status === "unauthenticated") {
      // Redirect unauthenticated users
      router.push("/login?callbackUrl=/admin")
    }
  }, [status, session, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <div className="container mx-auto py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Panel
            </h1>
            <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
              <Link href="/">Return to Village Gate</Link>
            </Button>
          </motion.div>

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
                <CardTitle>Village Management</CardTitle>
                <CardDescription className="text-[#e0d8c0]/70">
                  Manage applications, users, villages, and server settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="applications" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4 bg-[#0c0c0c]/50">
                    <TabsTrigger
                      value="applications"
                      className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0] flex items-center gap-1"
                    >
                      <Scroll className="h-4 w-4" />
                      <span className="hidden sm:inline">Applications</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="users"
                      className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0] flex items-center gap-1"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Users</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="villages"
                      className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0] flex items-center gap-1"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Villages</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0] flex items-center gap-1"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="applications">
                    <ApplicationsGrid />
                  </TabsContent>

                  <TabsContent value="users">
                    <UsersGrid />
                  </TabsContent>

                  <TabsContent value="villages">
                    <VillageManager />
                  </TabsContent>

                  <TabsContent value="settings">
                    <SettingsPanel />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

