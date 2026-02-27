import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email || typeof email !== "string") {
            return NextResponse.json({ message: "Email is required" }, { status: 400 })
        }

        const normalizedEmail = email.trim().toLowerCase()

        // Look up the user — but always return the same success response
        // to prevent email enumeration attacks
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, name: true, email: true, password: true },
        })

        // If user has no password (Google OAuth only), we silently succeed
        // (they should use "Sign in with Google" instead)
        if (user && user.password) {
            // Delete any existing reset token for this email
            await prisma.passwordResetToken.deleteMany({
                where: { email: normalizedEmail },
            })

            // Generate a secure random token
            const token = crypto.randomBytes(32).toString("hex")
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

            // Store token
            await prisma.passwordResetToken.create({
                data: {
                    email: normalizedEmail,
                    token,
                    expiresAt,
                },
            })

            // Build reset URL
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
            const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

            // Send email (non-blocking failure)
            await sendPasswordResetEmail({
                to: normalizedEmail,
                name: user.name,
                resetUrl,
            })
        }

        // Always return success — never reveal whether email exists
        return NextResponse.json({
            message: "If an account with that email exists, a reset link has been sent.",
        })
    } catch (error) {
        console.error("[ForgotPassword] Error:", error)
        return NextResponse.json(
            { message: "An error occurred. Please try again." },
            { status: 500 }
        )
    }
}
