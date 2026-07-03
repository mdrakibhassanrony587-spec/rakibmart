import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createProduct, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

async function addProductAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const price = String(formData.get("price") ?? "0").trim();
  const stockRaw = String(formData.get("stock") ?? "0").trim();

  if (!name || !price) {
    return;
  }

  const stock = Number.isFinite(Number(stockRaw)) ? Math.max(0, Math.floor(Number(stockRaw))) : 0;

  await createProduct({
    name,
    slug,
    description,
    imageUrl,
    price,
    stock,
  });

  revalidatePath("/products");
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const items = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Panel</h1>
        <Link href="/products" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          View Storefront
        </Link>
      </div>

      <section className="mb-8 rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Add New Product</h2>
        <form action={addProductAction} className="grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="Product name" required className="rounded-lg border border-slate-300 px-3 py-2" />
          <input name="slug" placeholder="slug (optional)" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input name="stock" type="number" min="0" step="1" placeholder="Stock" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input
            name="imageUrl"
            placeholder="Image URL"
            className="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Product description"
            className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"
          />
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 sm:col-span-2">
            Save Product
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Slug</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                  <td className="px-4 py-3 text-emerald-700">৳{Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-slate-500">{product.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
