import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";

interface CartItem {
  productId: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      notes,
      items,
    } = body as {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: string;
      city: string;
      postalCode?: string;
      notes?: string;
      items: CartItem[];
    };

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Fetch product details and calculate totals
    let totalAmount = 0;
    const orderItemsData: {
      productId: number;
      productName: string;
      productPrice: string;
      quantity: number;
      total: string;
    }[] = [];

    for (const item of items) {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (product[0].stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product[0].name}` },
          { status: 400 }
        );
      }

      const price = parseFloat(product[0].price);
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product[0].name,
        productPrice: product[0].price,
        quantity: item.quantity,
        total: itemTotal.toFixed(2),
      });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode: postalCode || "",
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        notes: notes || "",
      })
      .returning();

    // Create order items
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        ...item,
      });
    }

    // Update stock
    for (const item of items) {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      await db
        .update(products)
        .set({ stock: product[0].stock - item.quantity })
        .where(eq(products.id, item.productId));
    }

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
