import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { roles, users } from "./seedData/user";

async function main() {
  // Upsert roles first so we can connect by name when creating users
  for (const r of roles) {
    await prisma.userRole.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name },
    });
  }

  // Upsert users, hashing passwords
  for (const u of users) {
    const hashed = bcrypt.hashSync(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullname: u.fullname,
        password: hashed,
        phone: u.phone,
        role: { connect: { name: u.role } },
      },
      create: {
        email: u.email,
        fullname: u.fullname,
        password: hashed,
        phone: u.phone,
        role: { connect: { name: u.role } },
      },
    });
  }

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.userRole.count(),
  ]);

  console.log(`Seed done: users=${counts[0]} roles=${counts[1]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
