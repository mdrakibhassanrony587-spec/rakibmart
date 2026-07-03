import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductsPage() {
  const allProducts = await db.select({
    id: products.id,
    title: products.title,
    price: products.price,
    imageUrl: products.imageUrl,
    categoryName: categories.name,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {allProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        {allProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}
