import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export default async function main() {
  try {
    await prisma.$connect();
    console.log(" Database connected successfully!");
  } catch (error) {
    console.error(" Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
