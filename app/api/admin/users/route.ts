import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all users with their roles
    const users = await prisma.user.findMany({
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

