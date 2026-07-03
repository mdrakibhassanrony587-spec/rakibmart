import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        comparePrice: products.comparePrice,
        image: products.image,
        categoryId: products.categoryId,
        stock: products.stock,
        featured: products.featured,
        active: products.active,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products);

    return NextResponse.json({
      products: result,
      total: countResult[0].count,
      page,
      totalPages: Math.ceil(countResult[0].count / limit),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      image,
      categoryId,
      stock,
      featured,
      active,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const slug = generateSlug(name) + "-" + Date.now().toString(36);

    const [product] = await db
      .insert(products)
      .values({
        name,
        slug,
        description: description || "",
        price: parseFloat(price).toFixed(2),
        comparePrice: comparePrice ? parseFloat(comparePrice).toFixed(2) : null,
        image: image || "",
        categoryId: categoryId ? parseInt(categoryId) : null,
        stock: parseInt(stock) || 0,
        featured: featured || false,
        active: active !== false,
      })
      .returning();

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
