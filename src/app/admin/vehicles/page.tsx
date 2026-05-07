"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Vehicle = {
  id: string;
  name: string;
  slug: string;
  base_fare: number;
  per_km_rate: number;
  image_url: string;
  is_ev: boolean;
  is_active: boolean;
  sort_order: number;
  capacity: string;
  vehicle_category: "airport" | "outstation" | "local";
};

type Toast = {
  message: string;
  type: "success" | "error" | "info";
};

export default function VehicleManagementPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state with validation
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    base_fare: "",
    per_km_rate: "",
    image_url: "",
    is_ev: false,
    is_active: true,
    capacity: "",
    vehicle_category: "airport" as "airport" | "outstation" | "local",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Show toast notification
  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (data.vehicles) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      showToast("Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Vehicle name is required";
    if (!formData.capacity.trim()) errors.capacity = "Capacity is required";
    if (!formData.image_url.trim()) errors.image_url = "Image URL is required";
    if (!formData.base_fare && !formData.per_km_rate) {
      errors.pricing = "Either base fare or per km rate must be set";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Auto-generate slug when name changes
    if (name === "name") {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      base_fare: "",
      per_km_rate: "",
      image_url: "",
      is_ev: false,
      is_active: true,
      capacity: "",
      vehicle_category: "airport",
    });
    setEditingVehicle(null);
    setFormErrors({});
  };

  // Open edit modal
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      slug: vehicle.slug,
      base_fare: vehicle.base_fare.toString(),
      per_km_rate: vehicle.per_km_rate.toString(),
      image_url: vehicle.image_url,
      is_ev: vehicle.is_ev,
      is_active: vehicle.is_active,
      capacity: vehicle.capacity,
      vehicle_category: vehicle.vehicle_category,
    });
    setShowAddModal(true);
  };

  // Handle save (add or update)
  const handleSave = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setSaving(true);
    try {
      const vehicleData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        base_fare: parseFloat(formData.base_fare) || 0,
        per_km_rate: parseFloat(formData.per_km_rate) || 0,
        image_url: formData.image_url.trim(),
        is_ev: formData.is_ev,
        is_active: formData.is_active,
        capacity: formData.capacity.trim(),
        vehicle_category: formData.vehicle_category,
      };

      if (editingVehicle) {
        const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vehicleData),
        });

        if (!res.ok) throw new Error("Failed to update vehicle");
        showToast(`${vehicleData.name} updated successfully!`, "success");
      } else {
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vehicleData),
        });

        if (!res.ok) throw new Error("Failed to add vehicle");
        showToast(`${vehicleData.name} added successfully!`, "success");
      }

      await fetchVehicles();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      showToast("Failed to save vehicle. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete vehicle");

      showToast(`${name} deleted successfully`, "success");
      await fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      showToast("Failed to delete vehicle. Please try again.", "error");
    }
  };

  // Toggle active status
  const toggleActive = async (vehicle: Vehicle) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vehicle, is_active: !vehicle.is_active }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      showToast(
        `${vehicle.name} ${!vehicle.is_active ? "activated" : "deactivated"}`,
        "success"
      );
      await fetchVehicles();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  // Filter and search vehicles
  const filteredVehicles = vehicles
    .filter(v => filterCategory === "all" || v.vehicle_category === filterCategory)
    .filter(v => 
      searchQuery === "" || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.capacity.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
            toast.type === "success" ? "bg-green-600 text-white" :
            toast.type === "error" ? "bg-red-600 text-white" :
            "bg-blue-600 text-white"
          }`}>
            <span className="material-symbols-outlined">
              {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin")}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all hover:scale-105"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">garage</span>
                  Vehicle Management
                </h1>
                <p className="text-sm text-slate-500">Manage your fleet with ease</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add Vehicle
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search vehicles by name or capacity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">directions_car</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vehicles.length}</p>
                <p className="text-xs text-slate-500">Total Vehicles</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vehicles.filter(v => v.is_active).length}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600">flight</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vehicles.filter(v => v.vehicle_category === "airport").length}</p>
                <p className="text-xs text-slate-500">Airport</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600">explore</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{vehicles.filter(v => v.vehicle_category === "outstation").length}</p>
                <p className="text-xs text-slate-500">Outstation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 flex gap-2 shadow-sm border border-slate-200">
          {[
            { value: "all", label: "All", icon: "apps", count: vehicles.length },
            { value: "airport", label: "Airport", icon: "flight", count: vehicles.filter(v => v.vehicle_category === "airport").length },
            { value: "outstation", label: "Outstation", icon: "explore", count: vehicles.filter(v => v.vehicle_category === "outstation").length },
            { value: "local", label: "Local", icon: "location_city", count: vehicles.filter(v => v.vehicle_category === "local").length },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterCategory(tab.value)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                filterCategory === tab.value
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filterCategory === tab.value ? "bg-white/20" : "bg-slate-100"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <span className="material-symbols-outlined text-7xl text-slate-300 mb-4 block">directions_car_filled</span>
            <p className="text-slate-500 text-lg font-medium mb-2">No vehicles found</p>
            <p className="text-slate-400 text-sm">
              {searchQuery ? "Try a different search term" : "Add your first vehicle to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] group"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100">
                  <Image
                    src={vehicle.image_url}
                    alt={vehicle.name}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {vehicle.is_ev && (
                      <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        EV
                      </div>
                    )}
                    <button
                      onClick={() => toggleActive(vehicle)}
                      className={`text-xs px-3 py-1 rounded-full font-bold shadow-lg transition-all ${
                        vehicle.is_active 
                          ? "bg-green-500 text-white hover:bg-green-600" 
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {vehicle.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-lg capitalize ${
                      vehicle.vehicle_category === "airport" ? "bg-purple-500 text-white" :
                      vehicle.vehicle_category === "outstation" ? "bg-orange-500 text-white" :
                      "bg-blue-500 text-white"
                    }`}>
                      {vehicle.vehicle_category}
                    </span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{vehicle.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{vehicle.slug}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg">
                      <span className="text-slate-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">group</span>
                        Capacity
                      </span>
                      <span className="font-bold text-slate-900">{vehicle.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-green-50 px-3 py-2 rounded-lg">
                      <span className="text-green-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        Base Fare
                      </span>
                      <span className="font-bold text-green-700">₹{vehicle.base_fare}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-blue-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">route</span>
                        Per KM
                      </span>
                      <span className="font-bold text-blue-700">₹{vehicle.per_km_rate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-all font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id, vehicle.name)}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">
                    {editingVehicle ? "edit" : "add_circle"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                  </h2>
                  <p className="text-xs text-blue-100">
                    {editingVehicle ? "Update vehicle information" : "Fill in the details below"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Vehicle Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">directions_car</span>
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota Innova Crysta"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.name ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="auto-generated"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 font-mono text-sm"
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Auto-generated from vehicle name
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">category</span>
                  Category *
                </label>
                <select
                  name="vehicle_category"
                  value={formData.vehicle_category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="airport">🛫 Airport</option>
                  <option value="outstation">🗺️ Outstation</option>
                  <option value="local">🏙️ Local</option>
                </select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    Base Fare (₹)
                  </label>
                  <input
                    type="number"
                    name="base_fare"
                    value={formData.base_fare}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">route</span>
                    Per KM Rate (₹)
                  </label>
                  <input
                    type="number"
                    name="per_km_rate"
                    value={formData.per_km_rate}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              {formErrors.pricing && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formErrors.pricing}
                </p>
              )}

              {/* Capacity */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  Capacity *
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 7+1"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.capacity ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.capacity && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {formErrors.capacity}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">image</span>
                  Image URL *
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="/imgi_9_innova.png"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm ${
                    formErrors.image_url ? "border-red-500" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.image_url && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {formErrors.image_url}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Upload image to /public folder first, then enter the path
                </p>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 p-4 bg-slate-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_ev"
                    checked={formData.is_ev}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Electric Vehicle (EV)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Active
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                disabled={saving}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-all font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      {editingVehicle ? "check_circle" : "add_circle"}
                    </span>
                    {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
