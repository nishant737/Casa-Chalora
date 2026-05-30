require('dotenv').config();
const { Pool }         = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const bcrypt           = require('bcryptjs');

const pool   = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@casachalora.com' },
  });

  if (!existing) {
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@casachalora.com',
        password: hash,
        role: 'admin',
      },
    });
    console.log('Admin seeded → admin@casachalora.com / admin123');
  } else {
    console.log('Admin already exists, skipping seed.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
