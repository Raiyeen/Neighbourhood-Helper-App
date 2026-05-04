const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const pass = await bcrypt.hash('12341234!', 10)

  const u1 = await prisma.user.create({
    data: { name: 'Dr. John Doe', email: 'john@example.com', password: pass, phone: '555-001', gender: 'Male', address: 'Downtown', profession: 'Doctor', profilePicture: 'https://ui-avatars.com/api/?name=John+Doe&background=c4b5fd&color=4c1d95' }
  })

  const u2 = await prisma.user.create({
    data: { name: 'Alice Smith', email: 'alice@example.com', password: pass, phone: '555-002', gender: 'Female', address: 'Suburbs', profession: 'Engineer', profilePicture: 'https://ui-avatars.com/api/?name=Alice+Smith&background=fde047&color=854d0e' }
  })

  await prisma.post.create({
    data: {
      title: 'Need help moving boxes',
      description: 'Moving some heavy boxes from my living room to the truck. Need a hand urgently tonight!',
      areaName: 'Downtown',
      urgency: 'emergency',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80',
      authorId: u1.id,
      likes: 12,
      rate: 45
    }
  })

  await prisma.post.create({
    data: {
      title: 'Lending my power drill',
      description: 'I have a fully charged Dewalt drill available for anyone who needs to borrow it for the weekend.',
      areaName: 'Suburbs',
      urgency: 'flexible',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&q=80',
      authorId: u2.id,
      likes: 5,
      rate: 10
    }
  })

  await prisma.notification.create({
    data: { userId: u1.id, type: 'COMMENT', sourceId: 1, isRead: false }
  })

  console.log("Seeded successfully!")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
