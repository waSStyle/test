import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/db"

// Define a settings model in the database
// For simplicity, we'll use a key-value approach
// In a real app, you might want to create a proper Settings model in your Prisma schema

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin", "moderator"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all settings
    const settingsRecords = await prisma.setting.findMany()

    // Convert to a key-value object
    const settings = settingsRecords.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value)
      } catch (e) {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session?.user || !session.user.roles?.some((role) => ["admin"].includes(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await req.json()

    // Update or create each setting
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)

      await prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

