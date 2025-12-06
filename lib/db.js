import { PrismaClient } from "@prisma/client"

const globalForPrisma = global

// Create a singleton instance
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// REMOVE THIS - it's causing the problem:
// process.on("beforeExit", async () => {
//   await prisma.$disconnect()
//   console.log("[v0] Prisma disconnected")
// })

// Use proper shutdown signals instead:
const shutdown = async () => {
  await prisma.$disconnect()
  console.log("[v0] Prisma disconnected")
  process.exit(0)
}

process.on("SIGINT", shutdown)  // Ctrl+C
process.on("SIGTERM", shutdown) // Docker/Railway stop

export { prisma }
export default prisma
