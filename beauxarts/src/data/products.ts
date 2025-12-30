export interface Product {
  id: string;
  title: string;
  artist: string;
  price: number;
  image: string;
  category: string;
  description: string;
  dimensions: string;
  medium: string;
  year: number;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    title: "Ethereal Dreams",
    artist: "Maya Chen",
    price: 2400,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    category: "Abstract",
    description: "A mesmerizing exploration of color and form, this piece invites viewers into a dreamlike state where boundaries dissolve and imagination takes flight.",
    dimensions: "48 × 36 inches",
    medium: "Oil on canvas",
    year: 2024,
    featured: true,
  },
  {
    id: "2",
    title: "Urban Solitude",
    artist: "James Wright",
    price: 1800,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    category: "Contemporary",
    description: "Capturing the quiet moments of city life, this work reflects on the paradox of loneliness within crowded spaces.",
    dimensions: "36 × 24 inches",
    medium: "Acrylic on canvas",
    year: 2023,
    featured: true,
  },
  {
    id: "3",
    title: "Nature's Whisper",
    artist: "Elena Volkov",
    price: 3200,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
    category: "Landscape",
    description: "An intimate portrayal of nature's subtle beauty, rendered with delicate brushwork and a muted palette.",
    dimensions: "60 × 40 inches",
    medium: "Mixed media",
    year: 2024,
    featured: true,
  },
  {
    id: "4",
    title: "Geometric Harmony",
    artist: "Alex Torres",
    price: 1500,
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80",
    category: "Abstract",
    description: "Precision meets passion in this carefully composed study of shapes and their relationships.",
    dimensions: "30 × 30 inches",
    medium: "Digital print on archival paper",
    year: 2024,
  },
  {
    id: "5",
    title: "Silent Conversation",
    artist: "Sarah Kim",
    price: 2800,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    category: "Portrait",
    description: "A powerful exploration of human connection and the unspoken words between souls.",
    dimensions: "42 × 32 inches",
    medium: "Oil on linen",
    year: 2023,
    featured: true,
  },
  {
    id: "6",
    title: "Coastal Memory",
    artist: "David Liu",
    price: 2100,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    category: "Landscape",
    description: "Waves of nostalgia wash over this evocative seascape, capturing the essence of summer days.",
    dimensions: "48 × 36 inches",
    medium: "Watercolor on paper",
    year: 2024,
  },
  {
    id: "7",
    title: "Fragments of Time",
    artist: "Nina Patel",
    price: 1900,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
    category: "Abstract",
    description: "Layers of history and memory coalesce in this textured exploration of temporal experience.",
    dimensions: "40 × 40 inches",
    medium: "Collage and acrylic",
    year: 2024,
  },
  {
    id: "8",
    title: "Inner Light",
    artist: "Marcus Bell",
    price: 3500,
    image: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&q=80",
    category: "Contemporary",
    description: "A luminous meditation on the spark of consciousness that dwells within us all.",
    dimensions: "54 × 42 inches",
    medium: "Oil and gold leaf on canvas",
    year: 2024,
  },
];

export const categories = ["All", "Abstract", "Contemporary", "Landscape", "Portrait"];
