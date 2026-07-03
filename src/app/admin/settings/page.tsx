"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../layout";

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "ShopBD",
    storeTagline: "সেরা পণ্য, সেরা দামে",
    storeEmail: "info@shopbd.com",
    storePhone: "+880 1234-567890",
    storeAddress: "ঢাকা, বাংলাদেশ",
    currency: "৳",
    deliveryCharge: "0",
    freeDeliveryMinimum: "1000",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    footerText: "© 2024 ShopBD. সর্বস্বত্ব সংরক্ষিত।",
    announcementBar: "",
    metaTitle: "ShopBD - Online Shopping",
    metaDescription: "বাংলাদেশের সেরা অনলাইন শপিং প্ল্যাটফর্ম",
  });

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadSettings();
  }, [token, loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">⚙️ Store Settings</h1>
          <p className="text-gray-500">Configure your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {saving ? "⏳ Saving..." : saved ? "✅ Saved!" : "💾 Save Changes"}
        </button>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🏪</span> Store Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input
              type="text"
              name="storeTagline"
              value={settings.storeTagline}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="storeEmail"
              value={settings.storeEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              name="storePhone"
              value={settings.storePhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="storeAddress"
              value={settings.storeAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Delivery */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🚚</span> Pricing & Delivery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Currency Symbol</label>
            <input
              type="text"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Charge (৳)</label>
            <input
              type="number"
              name="deliveryCharge"
              value={settings.deliveryCharge}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Free Delivery Minimum (৳)</label>
            <input
              type="number"
              name="freeDeliveryMinimum"
              value={settings.freeDeliveryMinimum}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📱</span> Social Media Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook URL</label>
            <input
              type="url"
              name="facebookUrl"
              value={settings.facebookUrl}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input
              type="url"
              name="instagramUrl"
              value={settings.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">YouTube URL</label>
            <input
              type="url"
              name="youtubeUrl"
              value={settings.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SEO & Meta */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🔍</span> SEO Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={settings.metaTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea
              name="metaDescription"
              value={settings.metaDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Other */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📢</span> Other Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Announcement Bar Text</label>
            <input
              type="text"
              name="announcementBar"
              value={settings.announcementBar}
              onChange={handleChange}
              placeholder="e.g., Free shipping on orders over ৳1000!"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to hide announcement bar</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Text</label>
            <input
              type="text"
              name="footerText"
              value={settings.footerText}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {saving ? "⏳ Saving..." : saved ? "✅ Saved Successfully!" : "💾 Save All Settings"}
        </button>
      </div>
    </div>
  );
}
