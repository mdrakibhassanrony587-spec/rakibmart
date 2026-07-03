import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

type NewProductInput = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: string;
  stock: number;
};

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function ensureProductsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      description text NOT NULL DEFAULT '',
      image_url text NOT NULL DEFAULT '',
      price numeric(10,2) NOT NULL,
      stock integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function seedInitialProductsIfEmpty() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);

  if (existing.length > 0) {
    return;
  }

  await db
    .insert(products)
    .values([
      {
        name: "Wireless Bluetooth Headphone",
        slug: "wireless-bluetooth-headphone",
        description: "Comfortable over-ear headphone with clear sound and deep bass.",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
        price: "2499.00",
        stock: 25,
      },
      {
        name: "Smart Fitness Watch",
        slug: "smart-fitness-watch",
        description: "Track heart rate, steps, and sleep with long battery backup.",
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80",
        price: "3199.00",
        stock: 14,
      },
      {
        name: "Portable Mini Speaker",
        slug: "portable-mini-speaker",
        description: "Pocket-size wireless speaker with powerful sound output.",
        imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1000&q=80",
        price: "1599.00",
        stock: 32,
      },
    ])
    .onConflictDoNothing({ target: products.slug });
}

export async function getProducts() {
  await ensureProductsTable();
  await seedInitialProductsIfEmpty();

  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function createProduct(input: NewProductInput) {
  await ensureProductsTable();

  const normalizedSlug = makeSlug(input.slug || input.name);
  const parsedPrice = Number(input.price);

  if (!normalizedSlug) {
    throw new Error("Invalid product slug");
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new Error("Invalid price");
  }

  await db
    .insert(products)
    .values({
      name: input.name.trim(),
      slug: normalizedSlug,
      description: input.description.trim(),
      imageUrl: input.imageUrl.trim(),
      price: parsedPrice.toFixed(2),
      stock: Math.max(0, Math.floor(input.stock)),
      updatedAt: new Date(),
    })
    .onConflictDoNothing({ target: products.slug });
}
