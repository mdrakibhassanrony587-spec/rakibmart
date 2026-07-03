import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers, categories, products } from "@/db/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Check if admin already exists
    const existing = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminUsers);

    if (existing[0].count > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    // Create admin user (username: admin, password: admin123)
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({
      username: "admin",
      password: hashedPassword,
      name: "Md Rakib Hassan Rony",
    });

    // Create categories
    const [electronics] = await db
      .insert(categories)
      .values({ name: "Electronics", slug: "electronics", description: "Electronic gadgets and devices" })
      .returning();
    const [clothing] = await db
      .insert(categories)
      .values({ name: "Clothing", slug: "clothing", description: "Fashion and apparel" })
      .returning();
    const [home] = await db
      .insert(categories)
      .values({ name: "Home & Garden", slug: "home-garden", description: "Home essentials and garden items" })
      .returning();
    const [books] = await db
      .insert(categories)
      .values({ name: "Books", slug: "books", description: "Books and educational materials" })
      .returning();

    // Create sample products
    const sampleProducts = [
      {
        name: "Wireless Bluetooth Headphones",
        slug: "wireless-bluetooth-headphones",
        description: "High-quality wireless headphones with active noise cancellation. Perfect for music lovers and professionals.",
        price: "2500.00",
        comparePrice: "3500.00",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        categoryId: electronics.id,
        stock: 50,
        featured: true,
        active: true,
      },
      {
        name: "Smart Watch Pro",
        slug: "smart-watch-pro",
        description: "Advanced smartwatch with heart rate monitor, GPS tracking, and 7-day battery life.",
        price: "4500.00",
        comparePrice: "6000.00",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        categoryId: electronics.id,
        stock: 30,
        featured: true,
        active: true,
      },
      {
        name: "Premium Cotton T-Shirt",
        slug: "premium-cotton-tshirt",
        description: "100% organic cotton t-shirt. Comfortable and stylish for everyday wear.",
        price: "800.00",
        comparePrice: "1200.00",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        categoryId: clothing.id,
        stock: 100,
        featured: true,
        active: true,
      },
      {
        name: "Denim Jacket Classic",
        slug: "denim-jacket-classic",
        description: "Classic denim jacket with modern fit. Perfect for all seasons.",
        price: "2200.00",
        comparePrice: "3000.00",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
        categoryId: clothing.id,
        stock: 40,
        featured: false,
        active: true,
      },
      {
        name: "Ceramic Coffee Mug Set",
        slug: "ceramic-coffee-mug-set",
        description: "Set of 4 handcrafted ceramic mugs. Microwave and dishwasher safe.",
        price: "650.00",
        comparePrice: "900.00",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
        categoryId: home.id,
        stock: 75,
        featured: true,
        active: true,
      },
      {
        name: "Indoor Plant Pot",
        slug: "indoor-plant-pot",
        description: "Beautiful ceramic plant pot for indoor decoration. Comes with drainage hole.",
        price: "450.00",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500",
        categoryId: home.id,
        stock: 60,
        featured: false,
        active: true,
      },
      {
        name: "Programming with Python",
        slug: "programming-with-python",
        description: "Complete guide to Python programming for beginners and intermediate learners.",
        price: "350.00",
        comparePrice: "500.00",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
        categoryId: books.id,
        stock: 200,
        featured: false,
        active: true,
      },
      {
        name: "Portable Bluetooth Speaker",
        slug: "portable-bluetooth-speaker",
        description: "Waterproof portable speaker with 12-hour battery life and rich bass.",
        price: "1800.00",
        comparePrice: "2500.00",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        categoryId: electronics.id,
        stock: 45,
        featured: true,
        active: true,
      },
    ];

    await db.insert(products).values(sampleProducts);

    return NextResponse.json({ message: "Seeded successfully", admin: { username: "admin", password: "admin123" } });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
