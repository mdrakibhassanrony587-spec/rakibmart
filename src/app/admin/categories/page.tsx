"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../layout";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadCategories();
  }, [token, loadCategories]);

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || "", image: cat.image || "" });
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setEditId(null);
    setForm({ name: "", description: "", image: "" });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
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
        loadCategories();
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
    if (!confirm("Are you sure? Products in this category may be affected.")) return;
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📂 Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button onClick={handleNew} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
          ➕ Add Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Category" : "Add Category"}</h2>
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📂</p>
            <p>No categories yet. Create one to get started.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cat.description || "No description"}</p>
                  <p className="text-xs text-gray-400 mt-2">Slug: {cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800">✏️</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
