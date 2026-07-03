import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { asc } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

export async function GET(request: NextRequest) {
  const token = getToken(request);
  // Allow public access for active banners only
  const isAdmin = token && verifyToken(token);

  try {
    if (isAdmin) {
      const result = await db.select().from(banners).orderBy(asc(banners.sortOrder));
      return NextResponse.json(result);
    } else {
      const { eq } = await import("drizzle-orm");
      const result = await db
        .select()
        .from(banners)
        .where(eq(banners.active, true))
        .orderBy(asc(banners.sortOrder));
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, image, link, buttonText, active, sortOrder } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [banner] = await db
      .insert(banners)
      .values({
        title,
        subtitle: subtitle || "",
        image: image || "",
        link: link || "",
        buttonText: buttonText || "",
        active: active !== false,
        sortOrder: parseInt(sortOrder) || 0,
      })
      .returning();

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
