"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthContextType {
  token: string | null;
  user: { id: number; username: string; name: string } | null;
  login: (token: string, user: { id: number; username: string; name: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function LoginPage({ onLogin }: { onLogin: (token: string, user: { id: number; username: string; name: string }) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-4xl">🛍️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ShopBD Admin</h1>
          <p className="text-gray-500 mt-1">Management Dashboard</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "⏳ Logging in..." : "🔐 Login to Dashboard"}
          </button>
        </form>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            <strong>Default Credentials:</strong><br/>
            Username: <code className="bg-gray-200 px-1 rounded">admin</code><br/>
            Password: <code className="bg-gray-200 px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ onLogout, user }: { onLogout: () => void; user: { name: string } }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuGroups = [
    {
      title: "Main",
      links: [
        { href: "/admin", label: "Dashboard", icon: "📊" },
      ],
    },
    {
      title: "Store Management",
      links: [
        { href: "/admin/products", label: "Products", icon: "📦" },
        { href: "/admin/categories", label: "Categories", icon: "📂" },
        { href: "/admin/orders", label: "Orders", icon: "🛒" },
      ],
    },
    {
      title: "Team",
      links: [
        { href: "/admin/employees", label: "Employees", icon: "👥" },
      ],
    },
    {
      title: "Website",
      links: [
        { href: "/admin/banners", label: "Banners/Sliders", icon: "🖼️" },
        { href: "/admin/settings", label: "Store Settings", icon: "⚙️" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🛍️</span>
            </div>
            <div>
              <span className="text-lg font-bold">ShopBD</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <div className="space-y-1 px-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                      pathname === link.href
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-medium text-sm">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/" 
              target="_blank"
              className="flex-1 text-center text-xs bg-gray-800 text-gray-300 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              🌐 View Store
            </Link>
            <button 
              onClick={onLogout} 
              className="flex-1 text-xs bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600/30 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; username: string; name: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedUser = localStorage.getItem("admin_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // ignore
      }
    }
    setHydrated(true);
  }, []);

  const login = useCallback((t: string, u: { id: number; username: string; name: string }) => {
    setToken(t);
    setUser(u);
    localStorage.setItem("admin_token", t);
    localStorage.setItem("admin_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar onLogout={logout} user={user} />
        <div className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
