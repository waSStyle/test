import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin", "moderator"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all villages with their clans and member counts
    const villages = await prisma.village.findMany({
      include: {
        clans: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Get member counts for each village and clan
    const villagesWithCounts = await Promise.all(
      villages.map(async (village) => {
        const memberCount = await prisma.application.count({
          where: {
            villageId: village.id,
            status: "ACCEPTED",
          },
        })

        const clansWithCounts = await Promise.all(
          village.clans.map(async (clan) => {
            const clanMemberCount = await prisma.application.count({
              where: {
                clanId: clan.id,
                status: "ACCEPTED",
              },
            })

            return {
              ...clan,
              memberCount: clanMemberCount,
            }
          }),
        )

        return {
          ...village,
          memberCount,
          clans: clansWithCounts,
        }
      }),
    )

    return NextResponse.json(villagesWithCounts)
  } catch (error) {
    console.error("Error fetching villages:", error)
    return NextResponse.json({ error: "Failed to fetch villages" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, capacity } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Village name is required" }, { status: 400 })
    }

    // Create new village
    const village = await prisma.village.create({
      data: {
        name,
        description,
        capacity: capacity || 50,
      },
    })

    return NextResponse.json(village)
  } catch (error) {
    console.error("Error creating village:", error)
    return NextResponse.json({ error: "Failed to create village" }, { status: 500 })
  }
}

