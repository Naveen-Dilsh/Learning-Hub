import { prisma } from "../lib/db.js"

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartlearn.com" },
    update: {},
    create: {
      email: "admin@smartlearn.com",
      name: "Admin User",
      role: "ADMIN",
    },
  })

  console.log("Admin user created:", admin)
  console.log("Database seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
