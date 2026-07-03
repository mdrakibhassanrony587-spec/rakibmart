"use client";

import React, { useEffect, useState, use } from "react";
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
  images: string | null;
  stock: number;
  featured: boolean;
  categoryName: string | null;
  createdAt: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${resolvedParams.slug}`);
        if (res.ok) {
          setProduct(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😔</p>
        <h1 className="text-2xl font-bold mb-4">পণ্যটি পাওয়া যায়নি</h1>
        <Link href="/products" className="text-orange-500 hover:underline">সব পণ্য দেখুন</Link>
      </div>
    );
  }

  const discount = product.comparePrice
    ? Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image || "",
        stock: product.stock,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">হোম</Link>
        <span>›</span>
        <Link href="/products" className="hover:text-orange-500">পণ্য</Link>
        <span>›</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <img
            src={product.image || "https://via.placeholder.com/600x600?text=No+Image"}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>

        {/* Info */}
        <div>
          {product.categoryName && (
            <span className="text-sm text-orange-500 font-medium">{product.categoryName}</span>
          )}
          <h1 className="text-3xl font-bold mt-1 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-orange-500">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-full">-{discount}%</span>
              </>
            )}
          </div>

          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-6 ${
            product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {product.stock > 0 ? `✅ স্টকে আছে (${product.stock} টি)` : "❌ স্টক শেষ"}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">বিবরণ:</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">পরিমাণ:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-lg font-bold hover:bg-gray-100"
                  >-</button>
                  <span className="px-4 py-2 font-medium border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-lg font-bold hover:bg-gray-100"
                  >+</button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition"
              >
                🛒 কার্টে যোগ করুন — {formatPrice(parseFloat(product.price) * quantity)}
              </button>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xl">🚚</span> ফ্রি ডেলিভারি
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xl">🔄</span> 7 দিনে রিটার্ন
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xl">💳</span> নিরাপদ পেমেন্ট
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xl">✅</span> অরিজিনাল পণ্য
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
