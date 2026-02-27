import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { message: "Token and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        })

        if (!resetToken) {
            return NextResponse.json(
                { message: "Invalid or expired reset link. Please request a new one." },
                { status: 400 }
            )
        }

        // Check expiry
        if (new Date() > resetToken.expiresAt) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({ where: { token } })
            return NextResponse.json(
                { message: "This reset link has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        })

        if (!user) {
            return NextResponse.json(
                { message: "Account not found." },
                { status: 404 }
            )
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update user password and delete token in a transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.delete({ where: { token } }),
        ])

        return NextResponse.json({ message: "Password reset successfully." })
    } catch (error) {
        console.error("[ResetPassword] Error:", error)
        return NextResponse.json(
            { message: "An error occurred. Please try again." },
            { status: 500 }
        )
    }
}
