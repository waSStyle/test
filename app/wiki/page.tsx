"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen } from "lucide-react"

export default function WikiPage() {
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

  return (
    <div className="min-h-screen bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <div className="container mx-auto py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Ninja Scrolls
            </h1>
            <Button variant="outline" asChild className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Village Gate
              </Link>
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
                <CardTitle>Ancient Knowledge</CardTitle>
                <CardDescription className="text-[#e0d8c0]/70">Learn about our world, rules, and jutsu</CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <div className="w-full h-full flex items-center justify-center bg-[#0c0c0c]/50 rounded-md border border-[#473f14]/30">
                  <p className="text-[#e0d8c0]/50">GitBook documentation will be embedded here using an iframe</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

