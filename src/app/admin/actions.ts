"use server";

import { db } from "@/db";
import { categories, products, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  if (!name) return { error: "Name is required" };

  await db.insert(categories).values({ name, slug });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function createProduct(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = parseInt(formData.get("categoryId") as string);
  const featured = formData.get("featured") === "on";

  if (!title || !description || isNaN(price) || !imageUrl) {
    return { error: "Missing required fields" };
  }

  await db.insert(products).values({
    title,
    description,
    price: price.toString(),
    imageUrl,
    categoryId: isNaN(categoryId) ? null : categoryId,
    featured,
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function updateOrderStatus(id: number, status: string) {
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  return { success: true };
}
