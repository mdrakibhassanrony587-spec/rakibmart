import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc, ilike, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    const conditions = [eq(products.active, true)];

    if (category) {
      const cat = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category))
        .limit(1);
      if (cat.length > 0) {
        conditions.push(eq(products.categoryId, cat[0].id));
      }
    }

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    if (featured === "true") {
      conditions.push(eq(products.featured, true));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

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
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);

    return NextResponse.json({
      products: result,
      total: countResult[0].count,
      page,
      totalPages: Math.ceil(countResult[0].count / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
