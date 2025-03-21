import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const villageId = params.id

  try {
    const { name, description, capacity } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Village name is required" }, { status: 400 })
    }

    // Update village
    const village = await prisma.village.update({
      where: { id: villageId },
      data: {
        name,
        description,
        capacity: capacity || 50,
      },
    })

    return NextResponse.json(village)
  } catch (error) {
    console.error("Error updating village:", error)
    return NextResponse.json({ error: "Failed to update village" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const villageId = params.id

  try {
    // Check if there are any accepted applications for this village
    const acceptedApplications = await prisma.application.count({
      where: {
        villageId,
        status: "ACCEPTED",
      },
    })

    if (acceptedApplications > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete village with accepted applications. Move or remove members first.",
        },
        { status: 400 },
      )
    }

    // Delete all applications for this village
    await prisma.application.deleteMany({
      where: { villageId },
    })

    // Delete all clans for this village
    await prisma.clan.deleteMany({
      where: { villageId },
    })

    // Delete the village
    await prisma.village.delete({
      where: { id: villageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting village:", error)
    return NextResponse.json({ error: "Failed to delete village" }, { status: 500 })
  }
}

