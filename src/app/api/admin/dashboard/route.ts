import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, categories, employees } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
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
    const totalProducts = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products);

    const totalCategories = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories);

    const totalOrders = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders);

    const pendingOrders = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const totalRevenue = await db
      .select({ total: sql<string>`COALESCE(SUM(total_amount::numeric), 0)::text` })
      .from(orders)
      .where(eq(orders.status, "delivered"));

    const totalEmployees = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employees);

    const activeEmployees = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employees)
      .where(eq(employees.status, "active"));

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(sql`created_at DESC`)
      .limit(5);

    // Orders by status
    const ordersByStatus = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status);

    return NextResponse.json({
      totalProducts: totalProducts[0].count,
      totalCategories: totalCategories[0].count,
      totalOrders: totalOrders[0].count,
      pendingOrders: pendingOrders[0].count,
      totalRevenue: totalRevenue[0].total,
      totalEmployees: totalEmployees[0].count,
      activeEmployees: activeEmployees[0].count,
      recentOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
