import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

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
    const settings = await db.select().from(storeSettings);
    const settingsObj: Record<string, string> = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value || "";
    }
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    for (const [key, value] of Object.entries(body)) {
      const existing = await db
        .select()
        .from(storeSettings)
        .where(eq(storeSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(storeSettings)
          .set({ value: String(value) })
          .where(eq(storeSettings.key, key));
      } else {
        await db.insert(storeSettings).values({
          key,
          value: String(value),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
