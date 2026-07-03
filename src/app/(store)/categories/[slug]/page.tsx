import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const [category] = await db.select().from(categories).where(eq(categories.slug, resolvedParams.slug));

  if (!category) {
    notFound();
  }

  const categoryProducts = await db.select({
    id: products.id,
    title: products.title,
    price: products.price,
    imageUrl: products.imageUrl,
    categoryName: categories.name,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.categoryId, category.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-gray-500 mt-2">Showing all products in {category.name}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {categoryProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        {categoryProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
