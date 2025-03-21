import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, capacity, villageId } = await req.json()

    if (!name || !villageId) {
      return NextResponse.json({ error: "Clan name and village ID are required" }, { status: 400 })
    }

    // Check if village exists
    const village = await prisma.village.findUnique({
      where: { id: villageId },
    })

    if (!village) {
      return NextResponse.json({ error: "Village not found" }, { status: 404 })
    }

    // Create new clan
    const clan = await prisma.clan.create({
      data: {
        name,
        description,
        capacity: capacity || 10,
        villageId,
      },
    })

    return NextResponse.json(clan)
  } catch (error) {
    console.error("Error creating clan:", error)
    return NextResponse.json({ error: "Failed to create clan" }, { status: 500 })
  }
}

