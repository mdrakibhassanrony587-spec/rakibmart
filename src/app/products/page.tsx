import Link from "next/link";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const items = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">All Products</h1>
        <Link href="/admin" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Go to Admin
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-600 shadow">No products found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow">
              <img
                src={product.imageUrl || "https://placehold.co/800x500?text=No+Image"}
                alt={product.name}
                className="h-44 w-full object-cover"
              />
              <div className="space-y-3 p-5">
                <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-emerald-700">৳{Number(product.price).toFixed(2)}</p>
                  <p className="text-sm text-slate-500">Stock: {product.stock}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
