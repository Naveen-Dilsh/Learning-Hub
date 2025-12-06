import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { unstable_cache, revalidateTag } from "next/cache"

// Cached function for user profile
const getCachedUserProfile = unstable_cache(
  async (userId) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        studentNumber: true,
        credits: true,
        role: true,
        createdAt: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        district: true,
        postalCode: true,
        country: true,
      },
    })
  },
  ['user-profile'],
  {
    revalidate: 120, // Cache for 2 minutes
    tags: ['user-profile'],
  }
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getCachedUserProfile(session.user.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[Profile] Error fetching user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, image, phone, addressLine1, addressLine2, city, district, postalCode, country } = body

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
        ...(phone !== undefined && { phone }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country !== undefined && { country }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        studentNumber: true,
        credits: true,
        role: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        district: true,
        postalCode: true,
        country: true,
      },
    })

    // Invalidate cache
    revalidateTag('user-profile')

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[Profile] Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
