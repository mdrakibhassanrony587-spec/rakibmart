import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";
import { createSteadfastOrder, hasSteadfastConfig } from "@/lib/steadfast";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

// Enter order into Steadfast courier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.steadfastConsignmentId) {
      return NextResponse.json({ error: "Order already entered to Steadfast" }, { status: 400 });
    }

    // If Steadfast API is configured, use real API. Otherwise simulate.
    if (hasSteadfastConfig()) {
      const result = await createSteadfastOrder({
        invoice: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: `${order.shippingAddress}, ${order.city}${order.postalCode ? ", " + order.postalCode : ""}`,
        cod_amount: parseFloat(order.totalAmount),
        note: order.notes || "",
      });

      if (!result.success || !result.data?.consignment) {
        return NextResponse.json({ error: result.error || "Steadfast entry failed" }, { status: 400 });
      }

      const [updated] = await db
        .update(orders)
        .set({
          steadfastConsignmentId: String(result.data.consignment.consignment_id),
          steadfastTrackingCode: result.data.consignment.tracking_code,
          steadfastStatus: "entered",
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Order entered to Steadfast successfully",
        order: updated,
      });
    } else {
      // Simulation mode (no real API keys) - generates mock tracking data
      const mockConsignmentId = `SF${Date.now().toString().slice(-8)}`;
      const mockTrackingCode = `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const [updated] = await db
        .update(orders)
        .set({
          steadfastConsignmentId: mockConsignmentId,
          steadfastTrackingCode: mockTrackingCode,
          steadfastStatus: "entered",
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Order entered to Steadfast (Simulation Mode - Add API keys for live entry)",
        simulation: true,
        order: updated,
      });
    }
  } catch (error) {
    console.error("Steadfast entry error:", error);
    return NextResponse.json({ error: "Failed to enter order" }, { status: 500 });
  }
}

// Update Steadfast status (RTS / Shipped)
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
    const { steadfastStatus } = body; // "rts" or "shipped"

    const statusMap: Record<string, string> = {
      rts: "processing",
      shipped: "shipped",
    };

    const [updated] = await db
      .update(orders)
      .set({
        steadfastStatus,
        status: statusMap[steadfastStatus] || undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Error updating steadfast status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
