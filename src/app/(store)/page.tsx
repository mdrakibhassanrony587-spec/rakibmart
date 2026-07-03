"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  description: string | null;
}

const banners = [
  { image: "/images/banner1.jpg", title: "সেরা পণ্য, সেরা দামে", subtitle: "হাজার হাজার পণ্য এক জায়গায়", link: "/products", button: "শপিং শুরু করুন" },
  { image: "/images/banner2.jpg", title: "মেগা ইলেকট্রনিক্স ডিল", subtitle: "৫০% পর্যন্ত ছাড়", link: "/products?category=electronics", button: "কিনুন এখনই" },
  { image: "/images/banner3.jpg", title: "ফ্যাশন কালেকশন", subtitle: "নতুন স্টাইল, নতুন লুক", link: "/products?category=clothing", button: "দেখুন" },
];

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.comparePrice
    ? Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm">স্টক শেষ</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm text-gray-700 hover:text-orange-500 line-clamp-2 min-h-[40px]">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-orange-500">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
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
          className="mt-2 w-full bg-orange-500 text-white py-1.5 rounded text-sm font-medium hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? "🛒 কার্টে যোগ করুন" : "স্টক নেই"}
        </button>
      </div>
    </div>
  );
}

function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg h-56 md:h-96">
      {banners.map((banner, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="px-6 md:px-12 max-w-md">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{banner.title}</h2>
              <p className="text-white/90 mb-4 text-sm md:text-lg drop-shadow">{banner.subtitle}</p>
              <Link
                href={banner.link}
                className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition"
              >
                {banner.button} →
              </Link>
            </div>
          </div>
        </div>
      ))}
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2.5 h-2.5 rounded-full transition ${idx === current ? "bg-white w-6" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    async function init() {
      if (!seeded) {
        try {
          await fetch("/api/admin/seed", { method: "POST" });
          setSeeded(true);
        } catch {
          // ignore
        }
      }
      try {
        const [featRes, allRes, catRes] = await Promise.all([
          fetch("/api/products?featured=true&limit=6"),
          fetch("/api/products?limit=12"),
          fetch("/api/categories"),
        ]);
        const featData = await featRes.json();
        const allData = await allRes.json();
        const catData = await catRes.json();
        setFeaturedProducts(featData.products || []);
        setAllProducts(allData.products || []);
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [seeded]);

  const categoryEmojis: Record<string, string> = {
    electronics: "📱",
    clothing: "👕",
    "home-garden": "🏡",
    books: "📚",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "🚚", title: "ফ্রি ডেলিভারি", desc: "৳1000+ অর্ডারে" },
          { icon: "🔄", title: "সহজ রিটার্ন", desc: "7 দিনের মধ্যে" },
          { icon: "💳", title: "নিরাপদ পেমেন্ট", desc: "ক্যাশ অন ডেলিভারি" },
          { icon: "📞", title: "24/7 সাপোর্ট", desc: "সবসময় পাশে" },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3 border border-gray-100">
            <span className="text-2xl md:text-3xl">{f.icon}</span>
            <div>
              <h3 className="font-bold text-xs md:text-sm">{f.title}</h3>
              <p className="text-gray-500 text-[10px] md:text-xs">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📂 ক্যাটাগরি সমূহ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="bg-white rounded-lg shadow-sm p-5 text-center hover:shadow-md hover:-translate-y-1 transition group border border-gray-100"
              >
                <span className="text-4xl block mb-2 group-hover:scale-110 transition">{categoryEmojis[cat.slug] || "📦"}</span>
                <h3 className="font-bold text-gray-800 group-hover:text-orange-500 text-sm">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Sale / Featured */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">🔥 ফ্ল্যাশ সেল</h2>
          <Link href="/products?featured=true" className="text-white text-sm hover:underline font-medium">সব দেখুন →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* All Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">✨ আপনার জন্য</h2>
          <Link href="/products" className="text-orange-500 hover:underline text-sm font-medium">সব দেখুন →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : allProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
            <p className="text-4xl mb-4">📦</p>
            <p>কোনো পণ্য নেই</p>
          </div>
        )}
      </section>
    </div>
  );
}
