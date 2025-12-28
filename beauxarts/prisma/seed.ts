import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {  users } from "./seedData/user";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot run seed script in production environment");
  }

  // Upsert roles first so we can connect by name when creating users
  

  // Upsert users, hashing passwords
  for (const u of users) {
    const hashed = bcrypt.hashSync(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullname: u.fullname,
        password: hashed,
        phone: u.phone,
        
      },
      create: {
        email: u.email,
        fullname: u.fullname,
        password: hashed,
        phone: u.phone,
        
      },
    });
  }

  const counts = await Promise.all([
    prisma.user.count(),
  ]);

  console.log(`Seed done: users=${counts[0]} `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
