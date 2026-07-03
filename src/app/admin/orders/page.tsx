"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../layout";
import { formatPrice } from "@/lib/utils";

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
  steadfastConsignmentId: string | null;
  steadfastTrackingCode: string | null;
  steadfastStatus: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function OrdersContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) loadOrders();
  }, [token, loadOrders]);

  const showMsg = (type: "success" | "error", text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enter order to Steadfast
  const enterToSteadfast = async (order: Order) => {
    setProcessing(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/steadfast`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", data.message || "Steadfast এ এন্ট্রি সফল হয়েছে!");
        loadOrders();
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showMsg("error", data.error || "Steadfast এন্ট্রি ব্যর্থ হয়েছে");
      }
    } catch {
      showMsg("error", "সার্ভার সমস্যা");
    } finally {
      setProcessing(null);
    }
  };

  // Update Steadfast status (RTS / Shipped)
  const updateSteadfast = async (order: Order, steadfastStatus: string) => {
    setProcessing(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/steadfast`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ steadfastStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", steadfastStatus === "rts" ? "RTS হিসেবে মার্ক করা হয়েছে" : "Shipped to Steadfast মার্ক করা হয়েছে");
        loadOrders();
        if (selectedOrder?.id === order.id) setSelectedOrder(data.order);
      } else {
        showMsg("error", data.error || "আপডেট ব্যর্থ");
      }
    } catch {
      showMsg("error", "সার্ভার সমস্যা");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">🛒 Orders</h1>
        <p className="text-gray-500">অর্ডার ম্যানেজ করুন ও Steadfast এ এন্ট্রি দিন</p>
      </div>

      {/* Action Message */}
      {actionMsg && (
        <div className={`px-4 py-3 rounded-lg ${actionMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {actionMsg.type === "success" ? "✅ " : "❌ "}{actionMsg.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", ...statusOptions].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === s ? "bg-orange-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Order #{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 text-2xl">&times;</button>
            </div>

            {/* Steadfast Status Badge */}
            {selectedOrder.steadfastTrackingCode && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-bold text-purple-800 mb-1">🚚 Steadfast Courier</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Consignment:</span> <span className="font-medium">{selectedOrder.steadfastConsignmentId}</span></div>
                  <div><span className="text-gray-500">Tracking:</span> <span className="font-medium">{selectedOrder.steadfastTrackingCode}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Steadfast Status:</span> <span className="font-medium uppercase">{selectedOrder.steadfastStatus}</span></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className="text-sm text-gray-500">Customer</p><p className="font-medium">{selectedOrder.customerName}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedOrder.customerPhone}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedOrder.customerEmail}</p></div>
              <div><p className="text-sm text-gray-500">City</p><p className="font-medium">{selectedOrder.city}</p></div>
              <div className="col-span-2"><p className="text-sm text-gray-500">Address</p><p className="font-medium">{selectedOrder.shippingAddress}</p></div>
              {selectedOrder.notes && (
                <div className="col-span-2"><p className="text-sm text-gray-500">Notes</p><p className="font-medium">{selectedOrder.notes}</p></div>
              )}
            </div>

            {/* Steadfast Actions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold text-gray-700 mb-3">🚚 Steadfast Actions</p>
              <div className="flex flex-wrap gap-2">
                {!selectedOrder.steadfastConsignmentId ? (
                  <button
                    onClick={() => enterToSteadfast(selectedOrder)}
                    disabled={processing === selectedOrder.id}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {processing === selectedOrder.id ? "⏳ প্রসেসিং..." : "📥 Entry to Steadfast"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => updateSteadfast(selectedOrder, "rts")}
                      disabled={processing === selectedOrder.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 ${selectedOrder.steadfastStatus === "rts" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"}`}
                    >
                      📦 RTS (Ready to Ship)
                    </button>
                    <button
                      onClick={() => updateSteadfast(selectedOrder, "shipped")}
                      disabled={processing === selectedOrder.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 ${selectedOrder.steadfastStatus === "shipped" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
                    >
                      🚚 Shipped to Steadfast
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Invoice/Receipt Download */}
            <div className="flex flex-wrap gap-2 mb-4">
              <a href={`/invoice/${selectedOrder.orderNumber}`} target="_blank" className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200">🧾 Invoice</a>
              <a href={`/receipt/${selectedOrder.orderNumber}`} target="_blank" className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200">🧾 Receipt</a>
            </div>

            {/* Status Update */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Order Status</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedOrder.id, s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedOrder.status === s ? statusColors[s] : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-bold mb-3">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm">{item.productName}</td>
                        <td className="px-4 py-2 text-sm">{formatPrice(item.productPrice)}</td>
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm font-medium">{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right mt-3">
                <p className="text-lg font-bold">Total: {formatPrice(selectedOrder.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Steadfast</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500"><p className="text-4xl mb-2">📦</p>No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-orange-600">{order.orderNumber}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${statusColors[order.status] || "bg-gray-100"}`}
                      >
                        {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      {order.steadfastConsignmentId ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          ✓ {order.steadfastStatus || "entered"}
                        </span>
                      ) : (
                        <button
                          onClick={() => enterToSteadfast(order)}
                          disabled={processing === order.id}
                          className="px-2 py-1 text-xs font-medium rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
                        >
                          {processing === order.id ? "⏳" : "📥 Entry"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">👁️ View</button>
                        <a href={`/invoice/${order.orderNumber}`} target="_blank" className="text-green-600 hover:text-green-800 text-xs font-medium ml-1">🧾</a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
