
import { Role } from "@/generated/prisma/client";

export interface UserSeedData {
  email: string;
  fullname: string;
  password: string;
  phone: string;
  role: Role;
  artistProfile?: {
    storeName: string;
    bio: string;
  };
}

export const users: UserSeedData[] = [
  // --- ADMIN ---
  {
    email: "admin@artstore.com",
    fullname: "Site Admin",
    password: "Password123!",
    phone: "555-0000",
    role: "ADMIN",
  },
  // --- BUYERS (Regular Users) ---
  {
    email: "alice@example.com",
    fullname: "Alice Buyer",
    password: "Password123!",
    phone: "555-0100",
    role: "USER",
  },
  {
    email: "bob@example.com",
    fullname: "Bob Collector",
    password: "Password123!",
    phone: "555-0101",
    role: "USER",
  },
  // --- ARTISTS (Matching names from artwork.ts) ---
  {
    email: "maya@art.com",
    fullname: "Maya Chen",
    password: "Password123!",
    phone: "555-0201",
    role: "SELLER",
    artistProfile: {
      storeName: "Maya Chen Studio",
      bio: "Abstract artist exploring the boundaries of color and dreams.",
    },
  },
  {
    email: "james@art.com",
    fullname: "James Wright",
    password: "Password123!",
    phone: "555-0202",
    role: "SELLER",
    artistProfile: {
      storeName: "Wright Perspectives",
      bio: "Capturing the solitude and beauty of modern urban life.",
    },
  },
  {
    email: "elena@art.com",
    fullname: "Elena Volkov",
    password: "Password123!",
    phone: "555-0203",
    role: "SELLER",
    artistProfile: {
      storeName: "Volkov Nature",
      bio: "Bringing the whispers of the wild onto canvas.",
    },
  },
  {
    email: "alex@art.com",
    fullname: "Alex Torres",
    password: "Password123!",
    phone: "555-0204",
    role: "SELLER",
    artistProfile: {
      storeName: "Geometric Soul",
      bio: "Finding harmony in precise shapes and digital forms.",
    },
  },
  {
    email: "sarah@art.com",
    fullname: "Sarah Kim",
    password: "Password123!",
    phone: "555-0205",
    role: "SELLER",
    artistProfile: {
      storeName: "Kim Portraits",
      bio: "Exploring the unspoken conversations between souls.",
    },
  },
  {
    email: "david@art.com",
    fullname: "David Liu",
    password: "Password123!",
    phone: "555-0206",
    role: "SELLER",
    artistProfile: {
      storeName: "Liu Watercolors",
      bio: "Evocative seascapes and memories of the coast.",
    },
  },
  {
    email: "nina@art.com",
    fullname: "Nina Patel",
    password: "Password123!",
    phone: "555-0207",
    role: "SELLER",
    artistProfile: {
      storeName: "Patel Collage",
      bio: "Layering history and time through texture.",
    },
  },
  {
    email: "marcus@art.com",
    fullname: "Marcus Bell",
    password: "Password123!",
    phone: "555-0208",
    role: "SELLER",
    artistProfile: {
      storeName: "Bell Gold",
      bio: "Luminous meditations on consciousness.",
    },
  },
];