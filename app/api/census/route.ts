import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Get all villages with clans and member counts
    const villages = await prisma.village.findMany({
      include: {
        clans: true,
      },
    })

    // For each village and clan, get the count of accepted applications
    const villagesWithCounts = await Promise.all(
      villages.map(async (village) => {
        const villageMemberCount = await prisma.application.count({
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
          memberCount: villageMemberCount,
          clans: clansWithCounts,
        }
      }),
    )

    return NextResponse.json(villagesWithCounts)
  } catch (error) {
    console.error("Error fetching census data:", error)
    return NextResponse.json({ error: "Failed to fetch census data" }, { status: 500 })
  }
}

