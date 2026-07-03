import Link from 'next/link';
import { Package, LayoutDashboard, ShoppingCart, Tags, LogOut } from 'lucide-react';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin" className="text-xl font-bold text-gray-900 tracking-tight">
            RakibMart <span className="text-blue-600">Admin</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 group">
            <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 group">
            <ShoppingCart className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            Orders
          </Link>
          <Link href="/admin/products" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 group">
            <Package className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            Products
          </Link>
          <Link href="/admin/categories" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 group">
            <Tags className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            Categories
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 border-t p-4">
          <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group">
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
