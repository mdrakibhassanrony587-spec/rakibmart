"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../layout";

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  link: string | null;
  buttonText: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminBannersPage() {
  const { token } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    buttonText: "",
    active: true,
    sortOrder: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBanners(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadBanners();
  }, [token, loadBanners]);

  const handleEdit = (banner: Banner) => {
    setEditId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      link: banner.link || "",
      buttonText: banner.buttonText || "",
      active: banner.active,
      sortOrder: banner.sortOrder.toString(),
    });
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setEditId(null);
    setForm({
      title: "",
      subtitle: "",
      image: "",
      link: "",
      buttonText: "",
      active: true,
      sortOrder: "0",
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/banners/${editId}` : "/api/admin/banners";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        loadBanners();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !banner.active }),
      });
      loadBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🖼️ Banners & Sliders</h1>
          <p className="text-gray-500">Manage homepage banners and promotional sliders</p>
        </div>
        <button onClick={handleNew} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
          ➕ Add Banner
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Banner" : "Add New Banner"}</h2>
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Banner Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g., Summer Sale 50% Off!"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  rows={2}
                  placeholder="Additional promotional text..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="e.g., Shop Now"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/products"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium">Active (visible on website)</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? "Saving..." : editId ? "Update Banner" : "Create Banner"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="text-xl font-medium text-gray-700">No banners yet</p>
          <p className="text-gray-500 mt-2">Create banners to showcase on your homepage</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {banner.image ? (
                  <div className="w-full md:w-64 h-40 shrink-0">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full md:w-64 h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-4xl text-white">🖼️</span>
                  </div>
                )}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800">{banner.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {banner.active ? "Active" : "Hidden"}
                        </span>
                      </div>
                      {banner.subtitle && <p className="text-gray-500 text-sm">{banner.subtitle}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Order: {banner.sortOrder}</span>
                        {banner.link && <span>Link: {banner.link}</span>}
                        {banner.buttonText && <span>Button: {banner.buttonText}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        banner.active
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {banner.active ? "🙈 Hide" : "👁️ Show"}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
