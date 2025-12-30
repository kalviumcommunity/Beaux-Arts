
import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";


import { PrismaClient } from "@/generated/prisma/client";

import { users } from "./seedData/user";

import { products, categories as categoryNames } from "./seedData/artwork";


const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed with Driver Adapter...");

  // --- 1. Create Categories ---
  console.log("Creating Categories...");
  for (const name of categoryNames) {
    if (name === "All") continue;
    
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- 2. Create Users & Artists ---
  console.log("Creating Users and Artists...");
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullname: u.fullname,
        role: u.role,
      },
      create: {
        email: u.email,
        fullname: u.fullname,
        password: hashed,
        phone: u.phone,
        role: u.role,
      },
    });

    if (u.artistProfile) {
      await prisma.artist.upsert({
        where: { userId: user.id },
        update: {
          storeName: u.artistProfile.storeName,
          bio: u.artistProfile.bio,
        },
        create: {
          userId: user.id,
          storeName: u.artistProfile.storeName,
          bio: u.artistProfile.bio,
        },
      });
    }
  }

  // --- 3. Create Artworks ---
  console.log("Creating Artworks...");
  for (const product of products) {
    // A. Find Artist
    const artistUser = await prisma.user.findFirst({
      where: { fullname: product.artist },
      include: { artist: true },
    });

    if (!artistUser || !artistUser.artist) {
      console.warn(`⚠️ Skipping "${product.title}": Artist "${product.artist}" not found.`);
      continue;
    }

    // B. Find Category
    const categoryName = product.category;
    const category = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    // C. Create Artwork
    // Note: We are mapping "image" (string) to "image" (String[]) here
    await prisma.artwork.create({
      data: {
        title: product.title,
        description: product.description,
        price: product.price,
        image: [product.image], 
        dimensions: product.dimensions,
        medium: product.medium,
        year: product.year, 
        featured: product.featured || false,
        stock: 1,
        isUnique: true,
        artist: {
          connect: { id: artistUser.artist.id }
        },
        categories: category ? {
          create: {
            category: {
              connect: { id: category.id }
            }
          }
        } : undefined
      }
    });
  }

  const userCount = await prisma.user.count();
  const artworkCount = await prisma.artwork.count();
  console.log(`✅ Seed done: ${userCount} users, ${artworkCount} artworks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the pool/adapter connection
    await prisma.$disconnect();
  });