"use server";

import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData, cartItems: any[], totalAmount: number) {
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const customerAddress = formData.get("customerAddress") as string;

  if (!customerName || !customerEmail || !customerPhone || !customerAddress || cartItems.length === 0) {
    return { error: "Please fill all fields and ensure cart is not empty." };
  }

  try {
    const [newOrder] = await db.insert(orders).values({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      totalAmount: totalAmount.toString(),
      status: "pending",
    }).returning({ id: orders.id });

    const orderItemsData = cartItems.map(item => ({
      orderId: newOrder.id,
      productId: item.id,
      quantity: item.quantity,
      price: item.price.toString(),
    }));

    await db.insert(orderItems).values(orderItemsData);

    revalidatePath("/admin/orders");
    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { error: "Failed to place order." };
  }
}
