import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = params.id

  try {
    const { roleIds } = await req.json()

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user roles
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: roleIds.map((id: string) => ({ id })),
        },
      },
      include: {
        roles: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user roles:", error)
    return NextResponse.json({ error: "Failed to update user roles" }, { status: 500 })
  }
}

