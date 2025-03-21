"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DiscIcon as Discord, Loader2 } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()

  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  useEffect(() => {
    // If user is already authenticated, redirect to callback URL
    if (status === "authenticated") {
      router.push(callbackUrl)
    }

    // Show error toast if there's an error
    if (error) {
      let errorMessage = "Authentication failed. Please try again."

      switch (error) {
        case "OAuthSignin":
          errorMessage = "Error starting the Discord sign in process."
          break
        case "OAuthCallback":
          errorMessage = "Error during the Discord callback."
          break
        case "OAuthAccountNotLinked":
          errorMessage = "This Discord account is already linked to another account."
          break
        case "Callback":
          errorMessage = "Error during the callback process."
          break
        case "AccessDenied":
          errorMessage = "You denied access to your Discord account."
          break
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [status, router, callbackUrl, error])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("discord", { callbackUrl })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Failed to connect to Discord. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-[#e0d8c0] p-4 bg-[url('/images/paper-texture.png')] bg-repeat">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-[#241c14] p-8 rounded-lg border border-[#473f14] shadow-lg"
        style={{
          backgroundImage: "url('/images/paper-texture.png')",
          backgroundRepeat: "repeat",
          backgroundBlendMode: "overlay",
          boxShadow: "0 0 30px rgba(71, 63, 20, 0.2)",
        }}
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Join the Village</h1>
          <p className="text-[#e0d8c0]/80">Connect with Discord to access the shinobi world</p>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-900/30 border border-red-800">
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>There was a problem signing in with Discord. Please try again.</AlertDescription>
            </Alert>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            className="w-full h-12 bg-[#5865F2] hover:bg-[#4752c4] text-white flex items-center justify-center gap-2"
            onClick={handleLogin}
            disabled={isLoading || status === "loading"}
          >
            {isLoading || status === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Discord className="w-5 h-5" />
                <span>Continue with Discord</span>
              </>
            )}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-[#e0d8c0]/60">
          <p>By logging in, you agree to our Ninja Way and Village Rules</p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <Link href="/" className="text-[#e0d8c0]/80 hover:text-[#a39770] transition-colors">
          ← Return to the Village Gate
        </Link>
      </motion.div>
    </div>
  )
}

