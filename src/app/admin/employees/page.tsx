"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../layout";
import { formatPrice } from "@/lib/utils";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string | null;
  salary: string | null;
  address: string | null;
  joiningDate: string;
  status: string;
  image: string | null;
  createdAt: string;
}

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: string;
  address: string;
  image: string;
  joiningDate: string;
  status: string;
}

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  phone: "",
  role: "sales",
  department: "",
  salary: "",
  address: "",
  image: "",
  joiningDate: new Date().toISOString().split("T")[0],
  status: "active",
};

const roleOptions = [
  { value: "delivery", label: "🚚 Delivery", color: "bg-purple-100 text-purple-800" },
  { value: "sales", label: "💼 Sales", color: "bg-blue-100 text-blue-800" },
  { value: "support", label: "🎧 Support", color: "bg-green-100 text-green-800" },
  { value: "manager", label: "👔 Manager", color: "bg-orange-100 text-orange-800" },
  { value: "warehouse", label: "📦 Warehouse", color: "bg-yellow-100 text-yellow-800" },
  { value: "accountant", label: "📊 Accountant", color: "bg-indigo-100 text-indigo-800" },
];

const statusOptions = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" },
  { value: "on_leave", label: "On Leave", color: "bg-yellow-100 text-yellow-800" },
];

export default function AdminEmployeesPage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterStatus !== "all") params.set("status", filterStatus);
      
      const res = await fetch(`/api/admin/employees?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, filterRole, filterStatus]);

  useEffect(() => {
    if (token) loadEmployees();
  }, [token, loadEmployees]);

  const handleEdit = (emp: Employee) => {
    setEditId(emp.id);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      department: emp.department || "",
      salary: emp.salary || "",
      address: emp.address || "",
      image: emp.image || "",
      joiningDate: emp.joiningDate.split("T")[0],
      status: emp.status,
    });
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/employees/${editId}` : "/api/admin/employees";
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
        setEditId(null);
        setForm(emptyForm);
        loadEmployees();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save employee");
      }
    } catch {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await fetch(`/api/admin/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getRoleInfo = (role: string) => roleOptions.find(r => r.value === role) || { label: role, color: "bg-gray-100 text-gray-800" };
  const getStatusInfo = (status: string) => statusOptions.find(s => s.value === status) || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👥 Employees</h1>
          <p className="text-gray-500">Manage your team members</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>➕</span> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            {roleOptions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-sm text-gray-500">{employees.length} employees found</p>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedEmployee(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 right-4 text-gray-500 text-xl">&times;</button>
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {selectedEmployee.image ? (
                  <img src={selectedEmployee.image} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleInfo(selectedEmployee.role).color}`}>
                {getRoleInfo(selectedEmployee.role).label}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">📧 Email</span>
                <span className="font-medium">{selectedEmployee.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">📱 Phone</span>
                <span className="font-medium">{selectedEmployee.phone}</span>
              </div>
              {selectedEmployee.department && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">🏢 Department</span>
                  <span className="font-medium">{selectedEmployee.department}</span>
                </div>
              )}
              {selectedEmployee.salary && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">💰 Salary</span>
                  <span className="font-medium">{formatPrice(selectedEmployee.salary)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">📅 Joining Date</span>
                <span className="font-medium">{new Date(selectedEmployee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">🔖 Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedEmployee.status).color}`}>
                  {getStatusInfo(selectedEmployee.status).label}
                </span>
              </div>
              {selectedEmployee.address && (
                <div className="py-2">
                  <span className="text-gray-500 block mb-1">📍 Address</span>
                  <span className="font-medium">{selectedEmployee.address}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { handleEdit(selectedEmployee); setSelectedEmployee(null); }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => { handleDelete(selectedEmployee.id); setSelectedEmployee(null); }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Employee" : "Add New Employee"}</h2>
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary (৳)</label>
                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {saving ? "Saving..." : editId ? "Update Employee" : "Add Employee"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-xl font-medium text-gray-700">No employees found</p>
          <p className="text-gray-500 mt-2">Click &quot;Add Employee&quot; to add your first team member</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition cursor-pointer border border-transparent hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {emp.image ? (
                    <img src={emp.image} alt={emp.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{emp.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{emp.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleInfo(emp.role).color}`}>
                      {getRoleInfo(emp.role).label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(emp.status).color}`}>
                      {getStatusInfo(emp.status).label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t text-xs text-gray-500">
                <span>📱 {emp.phone}</span>
                <span>📅 {new Date(emp.joiningDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
