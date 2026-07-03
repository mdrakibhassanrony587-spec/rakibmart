"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Search, Package2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useEffect } from "react";

export function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight">RakibMart</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">Products</Link>
            <Link href="/categories" className="text-sm font-medium text-gray-600 hover:text-gray-900">Categories</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="search" 
              placeholder="Search products..." 
              className="h-9 w-64 rounded-md border border-gray-300 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button 
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-900"
          >
            <ShoppingCart className="h-6 w-6" />
            {mounted && totalItems() > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                {totalItems()}
              </span>
            )}
          </button>
          
          <Link href="/admin" className="hidden md:block text-sm font-medium text-blue-600 hover:text-blue-800">
            Admin
          </Link>

          <button className="md:hidden p-2 text-gray-600">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
