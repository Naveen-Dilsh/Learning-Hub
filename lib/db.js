import { PrismaClient } from "@prisma/client"

const globalForPrisma = global

// Create a singleton instance
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
})

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Prevent memory leak: only register shutdown handlers once
if (!globalForPrisma.prismaShutdownRegistered) {
  const shutdown = async () => {
    try {
      await prisma.$disconnect()
      console.log("[DB] Prisma disconnected gracefully")
    } catch (error) {
      console.error("[DB] Error disconnecting:", error)
    }
    process.exit(0)
  }

  // Remove existing listeners to prevent duplicates
  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTERM')
  
  process.once("SIGINT", shutdown)  // Ctrl+C
  process.once("SIGTERM", shutdown) // Docker/Railway stop
  
  globalForPrisma.prismaShutdownRegistered = true
}

export { prisma }
export default prisma
