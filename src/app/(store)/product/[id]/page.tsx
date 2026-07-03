import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  if (isNaN(productId)) notFound();

  const [product] = await db.select({
    id: products.id,
    title: products.title,
    description: products.description,
    price: products.price,
    imageUrl: products.imageUrl,
    categoryName: categories.name,
    categorySlug: categories.slug,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.id, productId));

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover object-center"
            unoptimized
          />
        </div>
        
        <div className="flex flex-col">
          {product.categoryName && (
            <Link href={`/categories/${product.categorySlug}`} className="text-blue-600 hover:underline text-sm font-medium uppercase tracking-wider mb-2">
              {product.categoryName}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <p className="text-3xl font-extrabold text-gray-900 mb-8">${Number(product.price).toFixed(2)}</p>
          
          <div className="prose prose-blue mb-8 text-gray-600">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>

          <div className="mt-auto pt-8 border-t">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
