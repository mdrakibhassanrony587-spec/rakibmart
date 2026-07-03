import { db } from "@/db";
import { categories } from "@/db/schema";
import Link from "next/link";
import { Folder } from "lucide-react";

export default async function CategoriesPage() {
  const allCategories = await db.select().from(categories);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Categories</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allCategories.map(cat => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="bg-white border rounded-xl p-6 flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{cat.name}</h3>
              <p className="text-sm text-gray-500">View Products</p>
            </div>
          </Link>
        ))}
        {allCategories.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
}
