"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.orderNumber);
        clearCart();
      } else {
        setError(data.error || "অর্ডার করতে সমস্যা হয়েছে");
      }
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-3xl font-bold text-green-600 mb-4">অর্ডার সফল হয়েছে!</h1>
          <p className="text-gray-600 mb-2">আপনার অর্ডার নম্বর:</p>
          <p className="text-2xl font-bold text-orange-500 mb-6">{orderSuccess}</p>
          <p className="text-gray-500 mb-6">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ!</p>

          {/* Download Invoice & Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <a
              href={`/invoice/${orderSuccess}`}
              target="_blank"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              🧾 Invoice ডাউনলোড
            </a>
            <a
              href={`/receipt/${orderSuccess}`}
              target="_blank"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              🧾 Receipt ডাউনলোড
            </a>
          </div>

          <Link href="/" className="bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-900 transition inline-block">
            🏠 হোমে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-4">আপনার কার্ট খালি</h1>
        <p className="text-gray-500 mb-6">চেকআউটের আগে কিছু পণ্য যোগ করুন</p>
        <Link href="/products" className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
          🛍️ শপিং করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📋 চেকআউট</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold">📦 ডেলিভারি তথ্য</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">নাম *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                  placeholder="আপনার পুরো নাম"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ইমেইল *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ফোন নম্বর *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">শহর *</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">শহর নির্বাচন করুন</option>
                  <option value="Dhaka">ঢাকা</option>
                  <option value="Chittagong">চট্টগ্রাম</option>
                  <option value="Sylhet">সিলেট</option>
                  <option value="Rajshahi">রাজশাহী</option>
                  <option value="Khulna">খুলনা</option>
                  <option value="Barisal">বরিশাল</option>
                  <option value="Rangpur">রংপুর</option>
                  <option value="Mymensingh">ময়মনসিংহ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">সম্পূর্ণ ঠিকানা *</label>
              <textarea
                name="shippingAddress"
                value={form.shippingAddress}
                onChange={handleChange}
                required
                rows={3}
                placeholder="বাড়ি নম্বর, রাস্তা, এলাকা..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">পোস্ট কোড</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="1234"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">মন্তব্য (ঐচ্ছিক)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800">💰 পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি</p>
              <p className="text-sm text-yellow-600 mt-1">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ প্রসেসিং..." : `✅ অর্ডার কনফার্ম করুন — ${formatPrice(totalAmount)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">📦 অর্ডার সামারি</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-start">
                  <img
                    src={item.image || "https://via.placeholder.com/60"}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>সাবটোটাল:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ডেলিভারি চার্জ:</span>
                <span className="text-green-600">ফ্রি</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>মোট:</span>
                <span className="text-orange-500">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
