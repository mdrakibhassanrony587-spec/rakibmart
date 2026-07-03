import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(orders.status, status));
    }

    const whereClause = conditions.length > 0 ? conditions[0] : undefined;

    const result = whereClause
      ? await db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset)
      : await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      result.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json({
      orders: ordersWithItems,
      total: countResult[0].count,
      page,
      totalPages: Math.ceil(countResult[0].count / limit),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
