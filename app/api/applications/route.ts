import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { sendApplicationNotification } from "@/lib/discord-bot"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's applications
    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        village: true,
        clan: true,
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { villageId, clanId, biography, skinId } = data

    // Check if user already has a pending application
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You already have a pending application" }, { status: 400 })
    }

    // Check if village exists
    const village = await prisma.village.findUnique({
      where: { id: villageId },
      include: { clans: true },
    })

    if (!village) {
      return NextResponse.json({ error: "Village not found" }, { status: 404 })
    }

    // Check if clan exists and belongs to the village
    if (clanId) {
      const clan = await prisma.clan.findUnique({
        where: { id: clanId },
      })

      if (!clan || clan.villageId !== villageId) {
        return NextResponse.json({ error: "Invalid clan selection" }, { status: 400 })
      }

      // Check if clan is full
      const clanMemberCount = await prisma.application.count({
        where: {
          clanId,
          status: "ACCEPTED",
        },
      })

      if (clanMemberCount >= clan.capacity) {
        return NextResponse.json({ error: "This clan is full" }, { status: 400 })
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        villageId,
        clanId,
        biography,
        skinId,
      },
      include: {
        user: true,
        village: true,
        clan: true,
      },
    })

    // Send Discord notification
    sendApplicationNotification(application)

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}

