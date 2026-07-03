"use client";

import React, { useEffect, useState, use } from "react";
import { formatPrice } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

interface OrderItem {
  id: number;
  productName: string;
  productPrice: string;
  quantity: number;
  total: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string | null;
  totalAmount: string;
  status: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function InvoicePage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          setOrder(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderNumber]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-xl">Invoice পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + parseFloat(item.total), 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
      {/* Action buttons - hidden on print */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition flex items-center gap-2"
        >
          🖨️ Print / Download PDF
        </button>
        <a
          href="/"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          🏠 Home
        </a>
      </div>

      {/* Invoice */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-orange-500 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={BRAND.logo} alt={BRAND.name} className="h-12 w-auto object-contain" />
            </div>
            <p className="text-gray-500 text-sm">{BRAND.tagline}</p>
            <p className="text-gray-500 text-sm mt-1">📞 {BRAND.phone}</p>
            <p className="text-gray-500 text-sm">✉️ {BRAND.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-orange-500">INVOICE</h2>
            <p className="text-gray-600 mt-1">#{order.orderNumber}</p>
            <p className="text-gray-500 text-sm mt-1">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* Billing info */}
        <div className="grid grid-cols-2 gap-6 py-6">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Bill To</h3>
            <p className="font-bold text-gray-800">{order.customerName}</p>
            <p className="text-gray-600 text-sm">{order.customerPhone}</p>
            <p className="text-gray-600 text-sm">{order.customerEmail}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Ship To</h3>
            <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
            <p className="text-gray-600 text-sm">{order.city}{order.postalCode ? `, ${order.postalCode}` : ""}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-3 text-left text-sm">#</th>
              <th className="px-4 py-3 text-left text-sm">Product</th>
              <th className="px-4 py-3 text-center text-sm">Qty</th>
              <th className="px-4 py-3 text-right text-sm">Price</th>
              <th className="px-4 py-3 text-right text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-3 text-sm">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-right">{formatPrice(item.productPrice)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery:</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-orange-500 pt-2">
              <span>Total:</span>
              <span className="text-orange-500">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 text-center text-sm text-yellow-700 font-medium">
              💰 Cash on Delivery
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-gray-600 font-medium">ধন্যবাদ আপনার অর্ডারের জন্য! 🎉</p>
          <p className="text-gray-400 text-xs mt-2">
            {BRAND.name} — {BRAND.address}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Developed by {BRAND.developer}
          </p>
        </div>
      </div>
    </div>
  );
}
