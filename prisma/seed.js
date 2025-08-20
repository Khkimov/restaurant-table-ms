const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    { name: 'T1', capacity: 2, x: 1, y: 1 },
    { name: 'T2', capacity: 2, x: 3, y: 1 },
    { name: 'T3', capacity: 4, x: 5, y: 1 },
    { name: 'T4', capacity: 4, x: 7, y: 1 },
    { name: 'T5', capacity: 2, x: 1, y: 3 },
    { name: 'T6', capacity: 4, x: 3, y: 3 },
    { name: 'T7', capacity: 6, x: 5, y: 3 },
    { name: 'T8', capacity: 2, x: 7, y: 3 },
  ];
  
  // Проверяем, есть ли уже столы
  const existingTables = await prisma.table.count();
  if (existingTables === 0) {
    await prisma.table.createMany({ data: tables });
    console.log('Seed: tables created');
  } else {
    console.log('Seed: tables already exist, skipping');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});