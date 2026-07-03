import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const featuredProducts = await db.select({
    id: products.id,
    title: products.title,
    price: products.price,
    imageUrl: products.imageUrl,
    categoryName: categories.name,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.featured, true))
  .limit(8);

  const allCategories = await db.select().from(categories).limit(6);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Welcome to RakibMart
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-blue-100 mb-10">
            Discover our curated collection of premium products. Shop the latest trends with confidence and style.
          </p>
          <Link href="/products" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link href="/categories" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {allCategories.map(cat => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="bg-white border rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{cat.name}</h3>
            </Link>
          ))}
          {allCategories.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8 border-2 border-dashed rounded-xl">
              No categories found. Admin needs to add some.
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {featuredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12 border-2 border-dashed rounded-xl">
              No featured products found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
