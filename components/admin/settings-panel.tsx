"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, RefreshCw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Discord Bot Settings
  const [discordBotEnabled, setDiscordBotEnabled] = useState(false)
  const [discordServerId, setDiscordServerId] = useState("")
  const [discordApplicationsChannelId, setDiscordApplicationsChannelId] = useState("")
  const [discordAnnouncementsChannelId, setDiscordAnnouncementsChannelId] = useState("")

  // Application Settings
  const [applicationsEnabled, setApplicationsEnabled] = useState(true)
  const [requireMinecraftVerification, setRequireMinecraftVerification] = useState(true)
  const [applicationCooldownHours, setApplicationCooldownHours] = useState(24)
  const [applicationWelcomeMessage, setApplicationWelcomeMessage] = useState("")
  const [applicationRejectionMessage, setApplicationRejectionMessage] = useState("")

  // Server Settings
  const [serverAddress, setServerAddress] = useState("")
  const [serverVersion, setServerVersion] = useState("")
  const [serverDescription, setServerDescription] = useState("")
  const [serverRules, setServerRules] = useState("")

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const settings = await response.json()

        // Discord Bot Settings
        setDiscordBotEnabled(settings.discordBotEnabled || false)
        setDiscordServerId(settings.discordServerId || "")
        setDiscordApplicationsChannelId(settings.discordApplicationsChannelId || "")
        setDiscordAnnouncementsChannelId(settings.discordAnnouncementsChannelId || "")

        // Application Settings
        setApplicationsEnabled(settings.applicationsEnabled !== false) // Default to true
        setRequireMinecraftVerification(settings.requireMinecraftVerification !== false) // Default to true
        setApplicationCooldownHours(settings.applicationCooldownHours || 24)
        setApplicationWelcomeMessage(settings.applicationWelcomeMessage || "")
        setApplicationRejectionMessage(settings.applicationRejectionMessage || "")

        // Server Settings
        setServerAddress(settings.serverAddress || "")
        setServerVersion(settings.serverVersion || "")
        setServerDescription(settings.serverDescription || "")
        setServerRules(settings.serverRules || "")
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Discord Bot Settings
          discordBotEnabled,
          discordServerId,
          discordApplicationsChannelId,
          discordAnnouncementsChannelId,

          // Application Settings
          applicationsEnabled,
          requireMinecraftVerification,
          applicationCooldownHours,
          applicationWelcomeMessage,
          applicationRejectionMessage,

          // Server Settings
          serverAddress,
          serverVersion,
          serverDescription,
          serverRules,
        }),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been saved successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#e0d8c0]/60" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Server Settings</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
            onClick={fetchSettings}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="discord" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-[#0c0c0c]/50">
          <TabsTrigger value="discord" className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]">
            Discord Bot
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]"
          >
            Applications
          </TabsTrigger>
          <TabsTrigger value="server" className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]">
            Server Info
          </TabsTrigger>
        </TabsList>

        {/* Discord Bot Settings */}
        <TabsContent value="discord">
          <Card className="bg-[#241c14] border-[#473f14]">
            <CardHeader>
              <CardTitle>Discord Bot Configuration</CardTitle>
              <CardDescription className="text-[#e0d8c0]/70">
                Configure the Discord bot integration for your server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="discordBotEnabled">Enable Discord Bot</Label>
                  <p className="text-sm text-[#e0d8c0]/60">
                    Integrate with Discord for application notifications and server announcements
                  </p>
                </div>
                <Switch
                  id="discordBotEnabled"
                  checked={discordBotEnabled}
                  onCheckedChange={setDiscordBotEnabled}
                  className="data-[state=checked]:bg-[#473f14]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordServerId">Discord Server ID</Label>
                <Input
                  id="discordServerId"
                  value={discordServerId}
                  onChange={(e) => setDiscordServerId(e.target.value)}
                  placeholder="Enter your Discord server ID"
                  className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                  disabled={!discordBotEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordApplicationsChannelId">Applications Channel ID</Label>
                <Input
                  id="discordApplicationsChannelId"
                  value={discordApplicationsChannelId}
                  onChange={(e) => setDiscordApplicationsChannelId(e.target.value)}
                  placeholder="Channel for application notifications"
                  className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                  disabled={!discordBotEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordAnnouncementsChannelId">Announcements Channel ID</Label>
                <Input
                  id="discordAnnouncementsChannelId"
                  value={discordAnnouncementsChannelId}
                  onChange={(e) => setDiscordAnnouncementsChannelId(e.target.value)}
                  placeholder="Channel for server announcements"
                  className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                  disabled={!discordBotEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Settings */}
        <TabsContent value="applications">
          <Card className="bg-[#241c14] border-[#473f14]">
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription className="text-[#e0d8c0]/70">
                Configure how applications work on your server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="applicationsEnabled">Enable Applications</Label>
                  <p className="text-sm text-[#e0d8c0]/60">Allow users to submit applications to join the server</p>
                </div>
                <Switch
                  id="applicationsEnabled"
                  checked={applicationsEnabled}
                  onCheckedChange={setApplicationsEnabled}
                  className="data-[state=checked]:bg-[#473f14]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireMinecraftVerification">Require Minecraft Verification</Label>
                  <p className="text-sm text-[#e0d8c0]/60">Users must verify their Minecraft account before applying</p>
                </div>
                <Switch
                  id="requireMinecraftVerification"
                  checked={requireMinecraftVerification}
                  onCheckedChange={setRequireMinecraftVerification}
                  className="data-[state=checked]:bg-[#473f14]"
                  disabled={!applicationsEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationCooldownHours">Application Cooldown (Hours)</Label>
                <Input
                  id="applicationCooldownHours"
                  type="number"
                  min="0"
                  value={applicationCooldownHours}
                  onChange={(e) => setApplicationCooldownHours(Number.parseInt(e.target.value))}
                  className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0]"
                  disabled={!applicationsEnabled}
                />
                <p className="text-xs text-[#e0d8c0]/60">
                  Time users must wait before submitting another application (0 for no cooldown)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationWelcomeMessage">Welcome Message</Label>
                <Textarea
                  id="applicationWelcomeMessage"
                  value={applicationWelcomeMessage}
                  onChange={(e) => setApplicationWelcomeMessage(e.target.value)}
                  placeholder="Message sent to users when their application is accepted"
                  className="min-h-[100px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                  disabled={!applicationsEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationRejectionMessage">Rejection Message</Label>
                <Textarea
                  id="applicationRejectionMessage"
                  value={applicationRejectionMessage}
                  onChange={(e) => setApplicationRejectionMessage(e.target.value)}
                  placeholder="Message sent to users when their application is rejected"
                  className="min-h-[100px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                  disabled={!applicationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Server Info Settings */}
        <TabsContent value="server">
          <Card className="bg-[#241c14] border-[#473f14]">
            <CardHeader>
              <CardTitle>Server Information</CardTitle>
              <CardDescription className="text-[#e0d8c0]/70">
                Configure information about your Minecraft server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverAddress">Server Address</Label>
                <Input
                  id="serverAddress"
                  value={serverAddress}
                  onChange={(e) => setServerAddress(e.target.value)}
                  placeholder="e.g., play.example.com"
                  className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverVersion">Minecraft Version</Label>
                <Input
                  id="serverVersion"
                  value={serverVersion}
                  onChange={(e) => setServerVersion(e.target.value)}
                  placeholder="e.g., 1.20.1"
                  className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverDescription">Server Description</Label>
                <Textarea
                  id="serverDescription"
                  value={serverDescription}
                  onChange={(e) => setServerDescription(e.target.value)}
                  placeholder="Describe your server..."
                  className="min-h-[100px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverRules">Server Rules</Label>
                <Textarea
                  id="serverRules"
                  value={serverRules}
                  onChange={(e) => setServerRules(e.target.value)}
                  placeholder="List your server rules..."
                  className="min-h-[150px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                />
                <p className="text-xs text-[#e0d8c0]/60">You can use Markdown formatting for rules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

