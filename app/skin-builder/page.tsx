"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brush, Check } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import SkinPreview from "./skin-preview"

export default function SkinBuilderPage() {
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

  // Skin customization state
  const [skinType, setSkinType] = useState("classic")
  const [hairColor, setHairColor] = useState("#000000")
  const [skinColor, setSkinColor] = useState("#FFD8C4")
  const [eyeColor, setEyeColor] = useState("#3D85C6")
  const [headband, setHeadband] = useState(true)
  const [headbandVillage, setHeadbandVillage] = useState("konoha")
  const [outfit, setOutfit] = useState("genin")
  const [clanMarkings, setClanMarkings] = useState(false)
  const [clan, setClan] = useState("none")

  return (
    <div className="min-h-screen bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <div className="container mx-auto py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brush className="h-6 w-6" />
              Shinobi Appearance
            </h1>
            <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
              <Link href="/skin-manager">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Skin Scrolls
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Attribute Controls */}
            <motion.div variants={itemVariants}>
              <Card
                className="bg-[#241c14] border-[#473f14] lg:col-span-1"
                style={{
                  backgroundImage: "url('/images/paper-texture.png')",
                  backgroundRepeat: "repeat",
                  backgroundBlendMode: "overlay",
                }}
              >
                <CardHeader>
                  <CardTitle>Customize Your Ninja</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">
                    Adjust attributes to create your character
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="body" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-4 bg-[#0c0c0c]/50">
                      <TabsTrigger
                        value="body"
                        className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]"
                      >
                        Body
                      </TabsTrigger>
                      <TabsTrigger
                        value="head"
                        className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]"
                      >
                        Head
                      </TabsTrigger>
                      <TabsTrigger
                        value="outfit"
                        className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]"
                      >
                        Outfit
                      </TabsTrigger>
                      <TabsTrigger
                        value="clan"
                        className="data-[state=active]:bg-[#473f14] data-[state=active]:text-[#e0d8c0]"
                      >
                        Clan
                      </TabsTrigger>
                    </TabsList>

                    {/* Body Tab */}
                    <TabsContent value="body" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Skin Type</h3>
                          <RadioGroup defaultValue="classic" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="classic" id="classic" onClick={() => setSkinType("classic")} />
                              <Label htmlFor="classic">Classic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="slim" id="slim" onClick={() => setSkinType("slim")} />
                              <Label htmlFor="slim">Slim</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Skin Tone</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {["#FFD8C4", "#F1C27D", "#C68642", "#8D5524", "#5C3317"].map((color) => (
                              <div
                                key={color}
                                className={`w-full aspect-square rounded-md cursor-pointer border-2 ${skinColor === color ? "border-[#e0d8c0]" : "border-transparent"}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSkinColor(color)}
                              >
                                {skinColor === color && (
                                  <div className="flex items-center justify-center h-full">
                                    <Check className="h-4 w-4 text-[#141414]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Body Height</h3>
                          <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Body Build</h3>
                          <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Head Tab */}
                    <TabsContent value="head" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Hair Style</h3>
                          <RadioGroup defaultValue="style1" className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="style1" id="style1" />
                              <Label htmlFor="style1">Spiky</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="style2" id="style2" />
                              <Label htmlFor="style2">Long</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="style3" id="style3" />
                              <Label htmlFor="style3">Short</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="style4" id="style4" />
                              <Label htmlFor="style4">Ponytail</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Hair Color</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {["#000000", "#4E3524", "#8B4513", "#FF0000", "#FFFF00"].map((color) => (
                              <div
                                key={color}
                                className={`w-full aspect-square rounded-md cursor-pointer border-2 ${hairColor === color ? "border-[#e0d8c0]" : "border-transparent"}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setHairColor(color)}
                              >
                                {hairColor === color && (
                                  <div className="flex items-center justify-center h-full">
                                    <Check className="h-4 w-4 text-[#e0d8c0]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Eye Color</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {["#3D85C6", "#000000", "#6AA84F", "#674EA7", "#FF0000"].map((color) => (
                              <div
                                key={color}
                                className={`w-full aspect-square rounded-md cursor-pointer border-2 ${eyeColor === color ? "border-[#e0d8c0]" : "border-transparent"}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setEyeColor(color)}
                              >
                                {eyeColor === color && (
                                  <div className="flex items-center justify-center h-full">
                                    <Check className="h-4 w-4 text-[#e0d8c0]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Headband</h3>
                            <Switch
                              checked={headband}
                              onCheckedChange={setHeadband}
                              className="data-[state=checked]:bg-[#473f14]"
                            />
                          </div>

                          {headband && (
                            <div className="mt-2">
                              <h4 className="text-xs font-medium mb-1">Village Symbol</h4>
                              <RadioGroup defaultValue="konoha" className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="konoha"
                                    id="konoha"
                                    onClick={() => setHeadbandVillage("konoha")}
                                  />
                                  <Label htmlFor="konoha">Konoha</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="suna" id="suna" onClick={() => setHeadbandVillage("suna")} />
                                  <Label htmlFor="suna">Suna</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="kiri" id="kiri" onClick={() => setHeadbandVillage("kiri")} />
                                  <Label htmlFor="kiri">Kiri</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="iwa" id="iwa" onClick={() => setHeadbandVillage("iwa")} />
                                  <Label htmlFor="iwa">Iwa</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Outfit Tab */}
                    <TabsContent value="outfit" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Outfit Style</h3>
                          <RadioGroup defaultValue="genin" className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="genin" id="genin" onClick={() => setOutfit("genin")} />
                              <Label htmlFor="genin">Genin</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="chunin" id="chunin" onClick={() => setOutfit("chunin")} />
                              <Label htmlFor="chunin">Chunin</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="jonin" id="jonin" onClick={() => setOutfit("jonin")} />
                              <Label htmlFor="jonin">Jonin</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="anbu" id="anbu" onClick={() => setOutfit("anbu")} />
                              <Label htmlFor="anbu">ANBU</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="casual" id="casual" onClick={() => setOutfit("casual")} />
                              <Label htmlFor="casual">Casual</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Primary Color</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {["#FF0000", "#0000FF", "#008000", "#FFA500", "#800080"].map((color, index) => (
                              <div
                                key={index}
                                className="w-full aspect-square rounded-md cursor-pointer border-2 border-transparent hover:border-[#e0d8c0]"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Secondary Color</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {["#FFFFFF", "#000000", "#808080", "#FFD700", "#C0C0C0"].map((color, index) => (
                              <div
                                key={index}
                                className="w-full aspect-square rounded-md cursor-pointer border-2 border-transparent hover:border-[#e0d8c0]"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Ninja Tools</h3>
                            <Switch className="data-[state=checked]:bg-[#473f14]" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Clan Tab */}
                    <TabsContent value="clan" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Clan</h3>
                          <RadioGroup defaultValue="none" className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="none" onClick={() => setClan("none")} />
                              <Label htmlFor="none">None</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="uchiha" id="uchiha" onClick={() => setClan("uchiha")} />
                              <Label htmlFor="uchiha">Uchiha</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hyuga" id="hyuga" onClick={() => setClan("hyuga")} />
                              <Label htmlFor="hyuga">Hyuga</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="uzumaki" id="uzumaki" onClick={() => setClan("uzumaki")} />
                              <Label htmlFor="uzumaki">Uzumaki</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nara" id="nara" onClick={() => setClan("nara")} />
                              <Label htmlFor="nara">Nara</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Clan Markings</h3>
                            <Switch
                              checked={clanMarkings}
                              onCheckedChange={setClanMarkings}
                              className="data-[state=checked]:bg-[#473f14]"
                              disabled={clan === "none"}
                            />
                          </div>
                        </div>

                        {clan !== "none" && clanMarkings && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Marking Style</h3>
                            <RadioGroup defaultValue="style1" className="grid grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="style1" id="marking1" />
                                <Label htmlFor="marking1">Style 1</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="style2" id="marking2" />
                                <Label htmlFor="marking2">Style 2</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="style3" id="marking3" />
                                <Label htmlFor="marking3">Style 3</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]">
                    Save Skin
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Right Panel: 3D Preview */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card
                className="bg-[#241c14] border-[#473f14]"
                style={{
                  backgroundImage: "url('/images/paper-texture.png')",
                  backgroundRepeat: "repeat",
                  backgroundBlendMode: "overlay",
                }}
              >
                <CardHeader>
                  <CardTitle>Ninja Preview</CardTitle>
                  <CardDescription className="text-[#e0d8c0]/70">3D preview of your character</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] flex items-center justify-center">
                  <SkinPreview />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

