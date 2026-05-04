const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({ datasourceUrl: "file:./dev.db" })

async function main() {
  // Empty data first if desired, or skip
  await prisma.post.createMany({
    data: [
      { title: "Need a ladder", description: "I need a tall ladder to clean my gutters this weekend.", areaName: "Northside", accessories: "Ladder" },
      { title: "Lost dog seen", description: "Saw a golden retriever wandering near the park.", areaName: "West End", accessories: "" },
      { title: "Borrowing a drill", description: "Does anyone have a power drill I can borrow for an hour?", areaName: "Eastside", accessories: "Power Drill, Bits" }
    ]
  })
  console.log("Seeding complete.")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
