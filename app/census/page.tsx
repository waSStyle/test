"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users } from "lucide-react"

export default function CensusPage() {
  // Mock data for villages and clans
  const villages = [
    {
      name: "Konoha",
      totalCapacity: 50,
      currentMembers: 32,
      clans: [
        { name: "Uzumaki", capacity: 10, members: 7 },
        { name: "Uchiha", capacity: 10, members: 9 },
        { name: "Hyuga", capacity: 10, members: 6 },
        { name: "Nara", capacity: 10, members: 5 },
        { name: "Civilian", capacity: 10, members: 5 },
      ],
    },
    {
      name: "Suna",
      totalCapacity: 40,
      currentMembers: 21,
      clans: [
        { name: "Kazekage", capacity: 8, members: 5 },
        { name: "Puppet Corps", capacity: 8, members: 4 },
        { name: "Wind Users", capacity: 8, members: 6 },
        { name: "Civilian", capacity: 16, members: 6 },
      ],
    },
    {
      name: "Kiri",
      totalCapacity: 40,
      currentMembers: 18,
      clans: [
        { name: "Seven Swordsmen", capacity: 7, members: 4 },
        { name: "Hozuki", capacity: 8, members: 3 },
        { name: "Kaguya", capacity: 8, members: 5 },
        { name: "Civilian", capacity: 17, members: 6 },
      ],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  return (
    <div className="min-h-screen bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <div className="container mx-auto py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Village Census
            </h1>
            <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Village Gate
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-6">
            {villages.map((village, index) => (
              <motion.div key={village.name} variants={itemVariants} custom={index}>
                <Card
                  className="bg-[#241c14] border-[#473f14]"
                  style={{
                    backgroundImage: "url('/images/paper-texture.png')",
                    backgroundRepeat: "repeat",
                    backgroundBlendMode: "overlay",
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{village.name}</CardTitle>
                        <CardDescription className="text-[#e0d8c0]/70">
                          Population: {village.currentMembers}/{village.totalCapacity}
                        </CardDescription>
                      </div>
                      <div className="h-3 w-32 bg-[#0c0c0c]/50 rounded-full overflow-hidden border border-[#473f14]/30">
                        <div
                          className="h-full bg-[#473f14] rounded-full"
                          style={{ width: `${(village.currentMembers / village.totalCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#473f14]/30">
                          <TableHead className="text-[#e0d8c0]">Clan</TableHead>
                          <TableHead className="text-right text-[#e0d8c0]">Members</TableHead>
                          <TableHead className="text-right text-[#e0d8c0]">Capacity</TableHead>
                          <TableHead className="text-right text-[#e0d8c0]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {village.clans.map((clan) => {
                          const percentFull = (clan.members / clan.capacity) * 100
                          let status = "Open"
                          let statusColor = "text-green-500"

                          if (percentFull >= 100) {
                            status = "Full"
                            statusColor = "text-red-500"
                          } else if (percentFull >= 80) {
                            status = "Limited"
                            statusColor = "text-yellow-500"
                          }

                          return (
                            <TableRow key={clan.name} className="border-[#473f14]/30">
                              <TableCell>{clan.name}</TableCell>
                              <TableCell className="text-right">{clan.members}</TableCell>
                              <TableCell className="text-right">{clan.capacity}</TableCell>
                              <TableCell className={`text-right ${statusColor}`}>{status}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

