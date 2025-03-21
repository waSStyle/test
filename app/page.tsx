"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { DiscIcon as Discord, Twitter, Github } from "lucide-react"
import { UserMenu } from "@/components/user-menu"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Ninja scroll reveal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  }

  const scrollVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      rotateZ: -10,
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotateZ: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  }

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
        delay: 0.6,
      },
    },
  }

  const buttonVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 1.2,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  // Particle effect for ninja theme
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="flex flex-col min-h-screen bg-[#141414] text-[#e0d8c0] overflow-hidden bg-[url('/images/paper-texture.png')] bg-repeat">
      {/* Animated particles (leaves/paper) */}
      {isLoaded && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-[#473f14]/20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: ["0%", "100%"],
                x: [`${particle.x}%`, `${particle.x + (Math.random() * 20 - 10)}%`],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0c0c]/90 backdrop-blur-sm border-b border-[#473f14]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <NavLink href="/wiki">Wiki</NavLink>
              <NavLink href="/applications">Applications</NavLink>
              <NavLink href="/skin-manager">Skin Manager</NavLink>
              <NavLink href="/census">Census</NavLink>
            </div>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-16">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center h-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            className="text-center relative"
          >
            {/* Scroll background effect */}
            <motion.div
              variants={scrollVariants}
              className="absolute inset-0 -mx-8 -my-12 bg-[#241c14] rounded-lg border-2 border-[#473f14] shadow-lg transform rotate-1"
              style={{
                backgroundImage: "url('/images/paper-texture.png')",
                backgroundRepeat: "repeat",
                boxShadow: "0 0 30px rgba(71, 63, 20, 0.3)",
              }}
            />

            {/* Server Logo */}
            <motion.div variants={scrollVariants} className="relative mb-6 mx-auto">
              <Image
                src="/images/logo.png"
                alt="Rise of Shinobi Logo"
                width={400}
                height={225}
                className="drop-shadow-[0_0_15px_rgba(71,63,20,0.6)]"
                priority
              />
            </motion.div>

            {/* Server Description */}
            <motion.div variants={contentVariants} className="relative">
              <p className="text-xl text-[#e0d8c0] max-w-2xl mx-auto mb-8 font-ninja">
                Embark on your ninja way in our immersive Naruto-inspired roleplay experience. Choose your village, join
                a clan, and forge your own ninja legend.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="relative">
              <Link
                href="/applications"
                className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] px-8 py-3 rounded-md font-medium text-lg transition-all duration-200 inline-block border border-[#3b3414] shadow-md"
                style={{
                  backgroundImage: "url('/images/paper-texture.png')",
                  backgroundBlendMode: "overlay",
                  backgroundRepeat: "repeat",
                }}
              >
                Begin Your Journey
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/90 backdrop-blur-sm border-t border-[#473f14] py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6">
            <SocialLink href="https://discord.gg/example" icon={<Discord className="w-5 h-5" />} label="Discord" />
            <SocialLink href="https://twitter.com/example" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
            <SocialLink href="https://github.com/example" icon={<Github className="w-5 h-5" />} label="GitHub" />
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[#e0d8c0] hover:text-[#a39770] transition-colors duration-200 font-medium">
      {children}
    </Link>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#e0d8c0]/70 hover:text-[#a39770] transition-colors duration-200"
      aria-label={label}
    >
      {icon}
    </Link>
  )
}

