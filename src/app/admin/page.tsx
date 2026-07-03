"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./layout";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: string;
  totalEmployees: number;
  activeEmployees: number;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: string;
    status: string;
    createdAt: string;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">👋 Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/products" className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-3xl font-bold text-gray-800">{data.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{data.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders?status=pending" className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-800">{data.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">{formatPrice(data.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/categories" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📂</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-800">{data.totalCategories}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/employees" className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {data.totalEmployees} <span className="text-sm font-normal text-green-600">({data.activeEmployees} active)</span>
              </p>
            </div>
          </div>
        </Link>

        <Link href="/" target="_blank" className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-sm p-5 text-white hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌐</span>
            </div>
            <div>
              <p className="text-sm text-green-100">View Store</p>
              <p className="text-lg font-bold">Open Public Site →</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Order Status Breakdown */}
      {data.ordersByStatus && data.ordersByStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">📊 Orders by Status</h2>
          <div className="flex flex-wrap gap-3">
            {data.ordersByStatus.map((item) => (
              <div
                key={item.status}
                className={`px-4 py-2 rounded-lg ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}
              >
                <span className="font-medium capitalize">{item.status}:</span>
                <span className="ml-2 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">⚡ Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">➕</span>
              <span className="font-medium">Add New Product</span>
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">📂</span>
              <span className="font-medium">Manage Categories</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">📋</span>
              <span className="font-medium">View All Orders</span>
            </Link>
            <Link href="/admin/employees" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">👥</span>
              <span className="font-medium">Manage Employees</span>
            </Link>
            <Link href="/admin/banners" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">🖼️</span>
              <span className="font-medium">Edit Banners</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">⚙️</span>
              <span className="font-medium">Store Settings</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">🕐 Recent Orders</h2>
            <Link href="/admin/orders" className="text-blue-600 text-sm hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <p className="text-3xl mb-2">📦</p>
                      <p>No orders yet</p>
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
