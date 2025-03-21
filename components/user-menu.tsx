"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User, Scroll, Shield } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: "/" })
  }

  // Loading state
  if (status === "loading") {
    return <Skeleton className="h-10 w-10 rounded-full" />
  }

  // Not authenticated
  if (status === "unauthenticated" || !session) {
    return (
      <Button asChild variant="outline" className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  // Get Discord avatar URL
  const avatarUrl =
    session.user.image ||
    (session.user.discordId && session.user.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`
      : null)

  // User is authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || ""} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-[#473f14] text-[#e0d8c0]">
              {session.user.name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#241c14] border-[#473f14] text-[#e0d8c0]" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-[#e0d8c0]/70 truncate">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#473f14]/50" />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/applications" className="cursor-pointer flex items-center">
            <Scroll className="mr-2 h-4 w-4" />
            <span>Applications</span>
          </Link>
        </DropdownMenuItem>
        {session.user.roles?.some((role) => ["admin", "moderator"].includes(role)) && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-[#473f14]/50" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

