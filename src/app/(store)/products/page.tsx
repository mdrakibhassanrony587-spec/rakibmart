"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  image: string | null;
  stock: number;
  featured: boolean;
  categoryName: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.comparePrice
    ? Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">স্টক শেষ</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        {product.categoryName && (
          <span className="text-xs text-orange-500 font-medium">{product.categoryName}</span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 mt-1 hover:text-orange-500 line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-orange-500">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        <button
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              price: parseFloat(product.price),
              image: product.image || "",
              stock: product.stock,
            })
          }
          disabled={product.stock <= 0}
          className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? "🛒 কার্টে যোগ করুন" : "স্টক নেই"}
        </button>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        params.set("limit", "50");

        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?${params.toString()}`),
          fetch("/api/categories"),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData.products || []);
        setTotal(prodData.total || 0);
        setCategories(catData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4">📂 ক্যাটাগরি</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    !category ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  সব পণ্য ({total})
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                      category === cat.slug ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {search ? `"${search}" এর ফলাফল` : category ? categories.find(c => c.slug === category)?.name || "পণ্য সমূহ" : "সব পণ্য"}
            </h1>
            <span className="text-gray-500">{total} টি পণ্য</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-5xl mb-4">😔</p>
              <p className="text-xl">কোনো পণ্য পাওয়া যায়নি</p>
              <Link href="/products" className="text-orange-500 hover:underline mt-2 inline-block">সব পণ্য দেখুন</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-56 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
