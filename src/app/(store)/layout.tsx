"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

function CartSidebar() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <h2 className="text-lg font-bold">🛒 কার্ট ({totalItems})</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-5xl mb-4">🛒</p>
              <p>আপনার কার্ট খালি</p>
              <Link href="/products" onClick={() => setIsCartOpen(false)} className="text-orange-500 hover:underline mt-2 inline-block">শপিং শুরু করুন</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                  <p className="text-orange-500 font-bold">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded bg-gray-200 text-sm font-bold hover:bg-gray-300"
                    >-</button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded bg-gray-200 text-sm font-bold hover:bg-gray-300"
                    >+</button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-red-500 text-sm hover:text-red-700"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>মোট:</span>
              <span className="text-orange-500">{formatPrice(totalAmount)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg text-center font-bold hover:from-orange-600 hover:to-red-600 transition"
            >
              চেকআউট করুন →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreHeader() {
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gray-900 text-white text-center text-xs py-2 px-4">
        🎉 বিশেষ অফার! ৳1000+ অর্ডারে ফ্রি ডেলিভারি — এখনই কিনুন!
      </div>

      <header className="bg-gradient-to-r from-orange-500 to-red-500 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3 gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src={BRAND.logo} alt={BRAND.name} className="h-10 w-auto object-contain bg-white/95 rounded-lg p-1" />
              <span className="text-2xl font-bold text-white hidden sm:block drop-shadow">{BRAND.name}</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="আপনার পছন্দের পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-l-lg focus:outline-none text-gray-800"
              />
              <button
                type="submit"
                className="px-8 py-2.5 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 font-medium"
              >
                🔍 খুঁজুন
              </button>
            </form>

            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 text-white hover:text-gray-100 bg-white/20 px-4 py-2 rounded-lg"
              >
                <span className="text-2xl">🛒</span>
                <span className="hidden sm:block font-medium">কার্ট</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3 flex">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none text-gray-800"
            />
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-r-lg">🔍</button>
          </form>
        </div>
      </header>

      {/* Nav categories */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 py-3 text-sm font-medium overflow-x-auto">
            <Link href="/" className="text-gray-700 hover:text-orange-500 whitespace-nowrap flex items-center gap-1">🏠 হোম</Link>
            <Link href="/products" className="text-gray-700 hover:text-orange-500 whitespace-nowrap flex items-center gap-1">📦 সব পণ্য</Link>
            <Link href="/products?category=electronics" className="text-gray-700 hover:text-orange-500 whitespace-nowrap">📱 ইলেকট্রনিক্স</Link>
            <Link href="/products?category=clothing" className="text-gray-700 hover:text-orange-500 whitespace-nowrap">👕 ফ্যাশন</Link>
            <Link href="/products?category=home-garden" className="text-gray-700 hover:text-orange-500 whitespace-nowrap">🏡 হোম & লিভিং</Link>
            <Link href="/products?category=books" className="text-gray-700 hover:text-orange-500 whitespace-nowrap">📚 বই</Link>
            <Link href="/products?featured=true" className="text-red-500 hover:text-red-600 whitespace-nowrap font-bold">🔥 হট ডিল</Link>
          </div>
        </div>
      </nav>
    </>
  );
}

function StoreFooter() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={BRAND.logo} alt={BRAND.name} className="h-10 w-auto object-contain bg-white rounded-lg p-1" />
              <span className="text-xl font-bold">{BRAND.name}</span>
            </div>
            <p className="text-gray-400 text-sm">বাংলাদেশের সেরা অনলাইন শপিং প্ল্যাটফর্ম। সেরা মানের পণ্য, সেরা দামে, দ্রুত ডেলিভারি।</p>
            <div className="flex gap-3 mt-4">
              <span className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 cursor-pointer transition">📘</span>
              <span className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 cursor-pointer transition">📷</span>
              <span className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 cursor-pointer transition">▶️</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-orange-500">হোম</Link></li>
              <li><Link href="/products" className="hover:text-orange-500">সব পণ্য</Link></li>
              <li><Link href="/checkout" className="hover:text-orange-500">চেকআউট</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">ক্যাটাগরি</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/products?category=electronics" className="hover:text-orange-500">ইলেকট্রনিক্স</Link></li>
              <li><Link href="/products?category=clothing" className="hover:text-orange-500">ফ্যাশন</Link></li>
              <li><Link href="/products?category=home-garden" className="hover:text-orange-500">হোম & লিভিং</Link></li>
              <li><Link href="/products?category=books" className="hover:text-orange-500">বই</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">যোগাযোগ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📞 {BRAND.phone}</li>
              <li>✉️ {BRAND.email}</li>
              <li>📍 {BRAND.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="mt-2 text-orange-400 font-medium">Developed by {BRAND.developer}</p>
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter />
        <CartSidebar />
      </div>
    </CartProvider>
  );
}
