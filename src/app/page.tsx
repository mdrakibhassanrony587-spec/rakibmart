import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
      <section className="w-full rounded-3xl bg-white p-8 shadow-lg sm:p-12">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-700">Rakib Mart</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Ecommerce Dashboard</h1>
        <p className="mt-4 text-slate-600">
          Products page and admin panel are connected with PostgreSQL using Drizzle ORM.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/products"
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 transition hover:bg-slate-100"
          >
            <p className="font-semibold">View Products</p>
            <p className="text-sm text-slate-600">Live product catalog</p>
          </Link>

          <Link
            href="/admin"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 transition hover:bg-emerald-100"
          >
            <p className="font-semibold">Admin Panel</p>
            <p className="text-sm text-emerald-700">Add and manage products</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
