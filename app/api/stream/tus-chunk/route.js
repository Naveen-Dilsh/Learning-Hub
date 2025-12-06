import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { uploadTusChunk } from "@/lib/cloudflare-stream"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const chunk = formData.get("chunk")
    const uploadUrl = formData.get("uploadUrl")
    const offset = parseInt(formData.get("offset") || "0")

    if (!chunk || !uploadUrl) {
      return NextResponse.json(
        { message: "Missing chunk or upload URL" },
        { status: 400 }
      )
    }

    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    const buffer = Buffer.from(await chunk.arrayBuffer())
    const newOffset = await uploadTusChunk(uploadUrl, buffer, offset, apiToken)

    return NextResponse.json({
      offset: newOffset,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error uploading chunk:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
