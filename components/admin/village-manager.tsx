"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { PlusCircle, Edit, Trash2, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function VillageManager() {
  const [villages, setVillages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // For village form
  const [isAddingVillage, setIsAddingVillage] = useState(false)
  const [editingVillage, setEditingVillage] = useState(null)
  const [villageName, setVillageName] = useState("")
  const [villageDescription, setVillageDescription] = useState("")
  const [villageCapacity, setVillageCapacity] = useState(50)

  // For clan form
  const [isAddingClan, setIsAddingClan] = useState(false)
  const [editingClan, setEditingClan] = useState(null)
  const [selectedVillage, setSelectedVillage] = useState(null)
  const [clanName, setClanName] = useState("")
  const [clanDescription, setClanDescription] = useState("")
  const [clanCapacity, setClanCapacity] = useState(10)

  const fetchVillages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/villages")
      if (response.ok) {
        const data = await response.json()
        setVillages(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch villages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching villages:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchVillages()
  }, [])

  const handleVillageSubmit = async () => {
    if (!villageName) {
      toast({
        title: "Error",
        description: "Village name is required",
        variant: "destructive",
      })
      return
    }

    setIsAddingVillage(true)

    try {
      const url = editingVillage ? `/api/admin/villages/${editingVillage.id}` : "/api/admin/villages"

      const method = editingVillage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: villageName,
          description: villageDescription,
          capacity: Number(villageCapacity),
        }),
      })

      if (response.ok) {
        const village = await response.json()

        if (editingVillage) {
          setVillages(villages.map((v) => (v.id === village.id ? village : v)))
          toast({
            title: "Village Updated",
            description: `${village.name} has been updated successfully`,
          })
        } else {
          setVillages([...villages, village])
          toast({
            title: "Village Created",
            description: `${village.name} has been created successfully`,
          })
        }

        // Reset form
        setVillageName("")
        setVillageDescription("")
        setVillageCapacity(50)
        setEditingVillage(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save village",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving village:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }

    setIsAddingVillage(false)
  }

  const handleDeleteVillage = async (village) => {
    if (!confirm(`Are you sure you want to delete ${village.name}? This will also delete all clans in this village.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/villages/${village.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVillages(villages.filter((v) => v.id !== village.id))
        toast({
          title: "Village Deleted",
          description: `${village.name} has been deleted successfully`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete village",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting village:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleClanSubmit = async () => {
    if (!clanName || !selectedVillage) {
      toast({
        title: "Error",
        description: "Clan name and village are required",
        variant: "destructive",
      })
      return
    }

    setIsAddingClan(true)

    try {
      const url = editingClan ? `/api/admin/clans/${editingClan.id}` : "/api/admin/clans"

      const method = editingClan ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clanName,
          description: clanDescription,
          capacity: Number(clanCapacity),
          villageId: selectedVillage.id,
        }),
      })

      if (response.ok) {
        const clan = await response.json()

        if (editingClan) {
          // Update the clan in the villages array
          setVillages(
            villages.map((village) => {
              if (village.id === selectedVillage.id) {
                return {
                  ...village,
                  clans: village.clans.map((c) => (c.id === clan.id ? clan : c)),
                }
              }
              return village
            }),
          )

          toast({
            title: "Clan Updated",
            description: `${clan.name} has been updated successfully`,
          })
        } else {
          // Add the new clan to the villages array
          setVillages(
            villages.map((village) => {
              if (village.id === selectedVillage.id) {
                return {
                  ...village,
                  clans: [...village.clans, clan],
                }
              }
              return village
            }),
          )

          toast({
            title: "Clan Created",
            description: `${clan.name} has been created successfully`,
          })
        }

        // Reset form
        setClanName("")
        setClanDescription("")
        setClanCapacity(10)
        setEditingClan(null)
        setSelectedVillage(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save clan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving clan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }

    setIsAddingClan(false)
  }

  const handleDeleteClan = async (clan, villageId) => {
    if (!confirm(`Are you sure you want to delete ${clan.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/clans/${clan.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the clan from the villages array
        setVillages(
          villages.map((village) => {
            if (village.id === villageId) {
              return {
                ...village,
                clans: village.clans.filter((c) => c.id !== clan.id),
              }
            }
            return village
          }),
        )

        toast({
          title: "Clan Deleted",
          description: `${clan.name} has been deleted successfully`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete clan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting clan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="text-xl font-bold">Village & Clan Management</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
            onClick={fetchVillages}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="villages" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 bg-[#0c0c0c]/50">
          <TabsTrigger value="villages" className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]">
            Villages
          </TabsTrigger>
          <TabsTrigger value="clans" className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]">
            Clans
          </TabsTrigger>
        </TabsList>

        {/* Villages Tab */}
        <TabsContent value="villages">
          <div className="space-y-4">
            {/* Village Form */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Village
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
                <DialogHeader>
                  <DialogTitle>{editingVillage ? "Edit Village" : "Add New Village"}</DialogTitle>
                  <DialogDescription className="text-[#e0d8c0]/70">
                    {editingVillage ? "Update the details of this village" : "Create a new village for ninjas to join"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="villageName">Village Name</Label>
                    <Input
                      id="villageName"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      placeholder="e.g., Konoha"
                      className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="villageDescription">Description</Label>
                    <Textarea
                      id="villageDescription"
                      value={villageDescription}
                      onChange={(e) => setVillageDescription(e.target.value)}
                      placeholder="Describe this village..."
                      className="min-h-[100px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="villageCapacity">Capacity</Label>
                    <Input
                      id="villageCapacity"
                      type="number"
                      min="1"
                      value={villageCapacity}
                      onChange={(e) => setVillageCapacity(Number.parseInt(e.target.value))}
                      className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0]"
                    />
                    <p className="text-xs text-[#e0d8c0]/60">Maximum number of ninjas allowed in this village</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVillageName("")
                      setVillageDescription("")
                      setVillageCapacity(50)
                      setEditingVillage(null)
                    }}
                    className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVillageSubmit}
                    disabled={isAddingVillage}
                    className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
                  >
                    {isAddingVillage ? "Saving..." : editingVillage ? "Update Village" : "Create Village"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Villages List */}
            <div className="grid gap-4 md:grid-cols-2">
              {villages.map((village) => {
                const memberCount = village.memberCount || 0
                const percentFull = (memberCount / village.capacity) * 100

                return (
                  <Card key={village.id} className="bg-[#241c14] border-[#473f14]">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{village.name}</CardTitle>
                          <CardDescription className="text-[#e0d8c0]/70">
                            {village.clans?.length || 0} clans
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingVillage(village)
                              setVillageName(village.name)
                              setVillageDescription(village.description || "")
                              setVillageCapacity(village.capacity)
                            }}
                            className="h-8 w-8 text-[#e0d8c0]/70 hover:text-[#e0d8c0] hover:bg-[#473f14]/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVillage(village)}
                            className="h-8 w-8 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Population</span>
                          <span>
                            {memberCount}/{village.capacity}
                          </span>
                        </div>
                        <Progress
                          value={percentFull}
                          className="h-2 bg-[#0c0c0c]/50"
                          indicatorClassName="bg-[#473f14]"
                        />

                        {village.description && <p className="text-sm text-[#e0d8c0]/80 mt-2">{village.description}</p>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {villages.length === 0 && !isLoading && (
                <div className="col-span-2 text-center p-8 border border-dashed border-[#473f14]/50 rounded-lg">
                  <p className="text-[#e0d8c0]/60">No villages found. Create your first village to get started.</p>
                </div>
              )}

              {isLoading && (
                <div className="col-span-2 text-center p-8">
                  <p className="text-[#e0d8c0]/60">Loading villages...</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Clans Tab */}
        <TabsContent value="clans">
          <div className="space-y-4">
            {/* Clan Form */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Clan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
                <DialogHeader>
                  <DialogTitle>{editingClan ? "Edit Clan" : "Add New Clan"}</DialogTitle>
                  <DialogDescription className="text-[#e0d8c0]/70">
                    {editingClan ? "Update the details of this clan" : "Create a new clan for ninjas to join"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="villageSelect">Village</Label>
                    <div className="relative">
                      <select
                        id="villageSelect"
                        value={selectedVillage?.id || ""}
                        onChange={(e) => {
                          const village = villages.find((v) => v.id === e.target.value)
                          setSelectedVillage(village || null)
                        }}
                        className="w-full bg-[#0c0c0c]/50 border border-[#473f14] rounded-md p-2 text-[#e0d8c0] appearance-none"
                        disabled={editingClan}
                      >
                        <option value="" disabled>
                          Select a village
                        </option>
                        {villages.map((village) => (
                          <option key={village.id} value={village.id}>
                            {village.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-5 w-5 text-[#e0d8c0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {editingClan && (
                      <p className="text-xs text-[#e0d8c0]/60">Village cannot be changed after creation</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clanName">Clan Name</Label>
                    <Input
                      id="clanName"
                      value={clanName}
                      onChange={(e) => setClanName(e.target.value)}
                      placeholder="e.g., Uchiha"
                      className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clanDescription">Description</Label>
                    <Textarea
                      id="clanDescription"
                      value={clanDescription}
                      onChange={(e) => setClanDescription(e.target.value)}
                      placeholder="Describe this clan..."
                      className="min-h-[100px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clanCapacity">Capacity</Label>
                    <Input
                      id="clanCapacity"
                      type="number"
                      min="1"
                      value={clanCapacity}
                      onChange={(e) => setClanCapacity(Number.parseInt(e.target.value))}
                      className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0]"
                    />
                    <p className="text-xs text-[#e0d8c0]/60">Maximum number of ninjas allowed in this clan</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClanName("")
                      setClanDescription("")
                      setClanCapacity(10)
                      setEditingClan(null)
                      setSelectedVillage(null)
                    }}
                    className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleClanSubmit}
                    disabled={isAddingClan || !selectedVillage}
                    className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
                  >
                    {isAddingClan ? "Saving..." : editingClan ? "Update Clan" : "Create Clan"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Clans List */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {villages.map((village) => (
                  <AccordionItem key={village.id} value={village.id} className="border-[#473f14]/50">
                    <AccordionTrigger className="text-[#e0d8c0] hover:text-[#e0d8c0] hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span>{village.name}</span>
                        <Badge variant="outline" className="border-[#473f14] text-[#e0d8c0]">
                          {village.clans?.length || 0} clans
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {village.clans?.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {village.clans.map((clan) => {
                              const memberCount = clan.memberCount || 0
                              const percentFull = (memberCount / clan.capacity) * 100

                              return (
                                <Card key={clan.id} className="bg-[#0c0c0c]/30 border-[#473f14]/50">
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                      <CardTitle className="text-lg">{clan.name}</CardTitle>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setEditingClan(clan)
                                            setClanName(clan.name)
                                            setClanDescription(clan.description || "")
                                            setClanCapacity(clan.capacity)
                                            setSelectedVillage(village)
                                          }}
                                          className="h-7 w-7 text-[#e0d8c0]/70 hover:text-[#e0d8c0] hover:bg-[#473f14]/20"
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteClan(clan, village.id)}
                                          className="h-7 w-7 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center text-sm">
                                        <span>Members</span>
                                        <span>
                                          {memberCount}/{clan.capacity}
                                        </span>
                                      </div>
                                      <Progress
                                        value={percentFull}
                                        className="h-1.5 bg-[#0c0c0c]/50"
                                        indicatorClassName="bg-[#473f14]"
                                      />

                                      {clan.description && (
                                        <p className="text-sm text-[#e0d8c0]/80 mt-2">{clan.description}</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center p-4 border border-dashed border-[#473f14]/50 rounded-lg">
                            <p className="text-[#e0d8c0]/60">No clans found in this village.</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {villages.length === 0 && !isLoading && (
                <div className="text-center p-8 border border-dashed border-[#473f14]/50 rounded-lg">
                  <p className="text-[#e0d8c0]/60">No villages found. Create a village first before adding clans.</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center p-8">
                  <p className="text-[#e0d8c0]/60">Loading clans...</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

