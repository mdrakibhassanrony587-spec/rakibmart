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
  customerPhone: string;
  shippingAddress: string;
  city: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function ReceiptPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) setOrder(await res.json());
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
        <p className="text-xl">😔 Receipt পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-sm mx-auto mb-4 flex justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2"
        >
          🖨️ Print Receipt
        </button>
        <a href="/" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300">🏠</a>
      </div>

      {/* Thermal receipt style */}
      <div className="max-w-sm mx-auto bg-white p-6 shadow-sm print:shadow-none font-mono text-sm">
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
          <img src={BRAND.logo} alt={BRAND.name} className="h-10 w-auto object-contain mx-auto mb-2" />
          <p className="text-xs text-gray-500">{BRAND.tagline}</p>
          <p className="text-xs text-gray-500">{BRAND.phone}</p>
        </div>

        <div className="py-4 border-b border-dashed border-gray-300 text-xs">
          <div className="flex justify-between">
            <span>Receipt No:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleString("en-GB")}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Status:</span>
            <span className="uppercase font-bold">{order.status}</span>
          </div>
        </div>

        <div className="py-4 border-b border-dashed border-gray-300 text-xs">
          <p className="font-bold mb-1">Customer:</p>
          <p>{order.customerName}</p>
          <p>{order.customerPhone}</p>
          <p>{order.shippingAddress}, {order.city}</p>
        </div>

        <div className="py-4 border-b border-dashed border-gray-300">
          <div className="flex justify-between text-xs font-bold border-b border-gray-200 pb-1 mb-2">
            <span>Item</span>
            <span>Total</span>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="mb-2 text-xs">
              <p className="font-medium">{item.productName}</p>
              <div className="flex justify-between text-gray-600">
                <span>{item.quantity} x {formatPrice(item.productPrice)}</span>
                <span className="font-medium">{formatPrice(item.total)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="py-4 border-b-2 border-dashed border-gray-300">
          <div className="flex justify-between text-xs">
            <span>Subtotal:</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Delivery:</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2">
            <span>TOTAL:</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          <p className="text-center text-xs mt-2 bg-gray-100 py-1 rounded">💰 Cash on Delivery</p>
        </div>

        <div className="text-center pt-4 text-xs text-gray-500">
          <p>ধন্যবাদ! 🎉</p>
          <p className="mt-1">{BRAND.name}</p>
          <p className="mt-2 text-[10px]">Developed by {BRAND.developer}</p>
        </div>
      </div>
    </div>
  );
}
