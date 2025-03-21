import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's skins
    const skins = await prisma.skin.findMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json(skins)
  } catch (error) {
    console.error("Error fetching skins:", error)
    return NextResponse.json({ error: "Failed to fetch skins" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { name, skinData, imageUrl } = data

    // Create skin
    const skin = await prisma.skin.create({
      data: {
        name,
        data: skinData,
        imageUrl,
        userId: session.user.id,
      },
    })

    return NextResponse.json(skin)
  } catch (error) {
    console.error("Error creating skin:", error)
    return NextResponse.json({ error: "Failed to create skin" }, { status: 500 })
  }
}

