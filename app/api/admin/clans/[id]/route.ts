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

  const clanId = params.id

  try {
    const { name, description, capacity } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Clan name is required" }, { status: 400 })
    }

    // Update clan
    const clan = await prisma.clan.update({
      where: { id: clanId },
      data: {
        name,
        description,
        capacity: capacity || 10,
      },
    })

    return NextResponse.json(clan)
  } catch (error) {
    console.error("Error updating clan:", error)
    return NextResponse.json({ error: "Failed to update clan" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clanId = params.id

  try {
    // Check if there are any accepted applications for this clan
    const acceptedApplications = await prisma.application.count({
      where: {
        clanId,
        status: "ACCEPTED",
      },
    })

    if (acceptedApplications > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete clan with accepted applications. Move or remove members first.",
        },
        { status: 400 },
      )
    }

    // Update all applications for this clan to have no clan
    await prisma.application.updateMany({
      where: { clanId },
      data: { clanId: null },
    })

    // Delete the clan
    await prisma.clan.delete({
      where: { id: clanId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting clan:", error)
    return NextResponse.json({ error: "Failed to delete clan" }, { status: 500 })
  }
}

