import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { mcUuid } = await req.json()

    if (!mcUuid) {
      return NextResponse.json({ error: "Minecraft UUID is required" }, { status: 400 })
    }

    // Check if the UUID is already in use
    const existingUser = await prisma.user.findUnique({
      where: { mcUuid },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        {
          error: "This Minecraft account is already linked to another user",
        },
        { status: 400 },
      )
    }

    // Update the user's Minecraft UUID
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { mcUuid },
    })

    return NextResponse.json({ success: true, mcUuid })
  } catch (error) {
    console.error("Error updating Minecraft UUID:", error)
    return NextResponse.json({ error: "Failed to update Minecraft UUID" }, { status: 500 })
  }
}

