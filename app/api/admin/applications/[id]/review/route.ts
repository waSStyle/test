import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin", "moderator"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const applicationId = params.id

  try {
    // Get the application data
    const { status, comment } = await req.json()

    // Validate status
    if (!["PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    })

    // Add comment if provided
    if (comment) {
      await prisma.comment.create({
        data: {
          applicationId,
          content: comment,
          authorId: session.user.id,
        },
      })
    }

    // If application is accepted, we might want to update user roles or send Discord notifications
    if (status === "ACCEPTED") {
      // TODO: Implement Discord notification
      // TODO: Add user to appropriate Discord roles
    }

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error("Error reviewing application:", error)
    return NextResponse.json({ error: "Failed to review application" }, { status: 500 })
  }
}

