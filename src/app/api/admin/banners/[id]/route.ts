import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, image, link, buttonText, active, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (image !== undefined) updateData.image = image;
    if (link !== undefined) updateData.link = link;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (active !== undefined) updateData.active = active;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(String(sortOrder));

    const [updated] = await db
      .update(banners)
      .set(updateData)
      .where(eq(banners.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.delete(banners).where(eq(banners.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
