"use client";

import React, { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  trip_type?: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  base_fare: number;
  taxes: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  address_line1?: string;
  address_line2?: string;
  landmark?: string;
  area?: string;
  pincode?: string;
};

type DashboardStats = {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
};

const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalBookings: 0,
    todayBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageBookingValue: 0,
  });

  // Calculate statistics
  const calculateStats = (bookingsList: Booking[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedBookings = bookingsList.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);
    
    const todayBookings = bookingsList.filter(b => new Date(b.created_at) >= todayStart);
    const todayRevenue = todayBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0);
    
    const weekBookings = bookingsList.filter(b => new Date(b.created_at) >= weekStart);
    const weekRevenue = weekBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0);
    
    const monthBookings = bookingsList.filter(b => new Date(b.created_at) >= monthStart);
    const monthRevenue = monthBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0);

    setStats({
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalBookings: bookingsList.length,
      todayBookings: todayBookings.length,
      pendingBookings: bookingsList.filter(b => b.status === 'pending').length,
      confirmedBookings: bookingsList.filter(b => b.status === 'confirmed').length,
      completedBookings: completedBookings.length,
      cancelledBookings: bookingsList.filter(b => b.status === 'cancelled').length,
      averageBookingValue: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0,
    });
  };

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
    } else {
      alert("Incorrect password");
    }
  };

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch bookings and setup real-time
  useEffect(() => {
    if (!isAuthenticated) return;

    const setupRealtimeAndFetch = async () => {
      try {
        // Fetch initial bookings
        const { data, error } = await insforge.database
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching bookings:", error);
        } else {
          setBookings(data || []);
          calculateStats(data || []);
        }
        setLoading(false);

        // Connect to real-time
        await insforge.realtime.connect();
        setIsConnected(true);

        // Subscribe to bookings channel
        const subscribeResult = await insforge.realtime.subscribe("bookings");
        
        if (!subscribeResult.ok) {
          console.error("Failed to subscribe:", subscribeResult.error.message);
          return;
        }

        // Listen for new bookings
        insforge.realtime.on("INSERT_booking", (payload: any) => {
          console.log("New booking:", payload);
          setBookings((prev) => {
            const updated = [payload, ...prev];
            calculateStats(updated);
            return updated;
          });
        });

        // Listen for booking updates
        insforge.realtime.on("UPDATE_booking", (payload: any) => {
          console.log("Booking updated:", payload);
          setBookings((prev) => {
            const updated = prev.map((b) => (b.id === payload.id ? { ...b, ...payload } : b));
            calculateStats(updated);
            return updated;
          });
        });

        // Listen for booking deletions
        insforge.realtime.on("DELETE_booking", (payload: any) => {
          console.log("Booking deleted:", payload);
          setBookings((prev) => {
            const updated = prev.filter((b) => b.id !== payload.id);
            calculateStats(updated);
            return updated;
          });
        });

      } catch (err) {
        console.error("Setup error:", err);
        setLoading(false);
      }
    };

    setupRealtimeAndFetch();

    // Cleanup
    return () => {
      insforge.realtime.unsubscribe("bookings");
      insforge.realtime.disconnect();
    };
  }, [isAuthenticated]);

  // Handle status update
  const updateStatus = async (id: string, newStatus: string) => {
    // If confirming a booking, show payment confirmation dialog
    if (newStatus === 'confirmed') {
      const paymentMethod = prompt('Payment Method (cash/online/card):');
      if (!paymentMethod) return;

      const driverName = prompt('Assign Driver Name (optional):');
      const driverPhone = prompt('Driver Phone (optional):');
      const vehicleNumber = prompt('Vehicle Number (optional):');

      // Get the booking details
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      try {
        // Move to confirmed_rides table
        const { error: insertError } = await insforge.database
          .from('confirmed_rides')
          .insert([{
            booking_id: id,
            customer_name: booking.customer_name,
            customer_email: booking.customer_email,
            trip_type: booking.trip_type || 'to_airport',
            pickup_location: booking.pickup_location,
            dropoff_location: booking.dropoff_location,
            pickup_date: booking.pickup_date,
            vehicle_type: booking.vehicle_type,
            base_fare: booking.base_fare,
            taxes: booking.taxes,
            total_amount: booking.total_amount,
            payment_method: paymentMethod,
            payment_status: 'paid',
            ride_status: 'scheduled',
            driver_name: driverName || null,
            driver_phone: driverPhone || null,
            vehicle_number: vehicleNumber || null,
          }]);

        if (insertError) {
          console.error('Error creating confirmed ride:', insertError);
          alert('Failed to confirm booking');
          return;
        }

        // Update booking status
        const { error: updateError } = await insforge.database
          .from('bookings')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', id);

        if (updateError) {
          console.error('Error updating booking:', updateError);
          alert('Failed to update booking status');
          return;
        }

        alert('Booking confirmed and moved to active rides!');
      } catch (err) {
        console.error('Error confirming booking:', err);
        alert('Failed to confirm booking');
      }
    } else {
      // Regular status update
      const { error } = await insforge.database
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      }
    }
  };

  // Handle delete booking
  const deleteBooking = async (id: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete booking for ${customerName}?`)) {
      return;
    }

    const { error } = await insforge.database
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    } else {
      // Remove from local state immediately
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
    setPassword("");
  };

  // Filter bookings with search and date
  const filteredBookings = bookings.filter(b => {
    // Status filter
    const statusMatch = filter === "all" || b.status === filter;
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || 
      b.customer_name.toLowerCase().includes(searchLower) ||
      b.customer_email.toLowerCase().includes(searchLower) ||
      b.pickup_location.toLowerCase().includes(searchLower) ||
      b.dropoff_location.toLowerCase().includes(searchLower) ||
      b.vehicle_type.toLowerCase().includes(searchLower);
    
    // Date filter
    let dateMatch = true;
    if (dateFilter !== "all") {
      const bookingDate = new Date(b.pickup_date);
      const now = new Date();
      
      if (dateFilter === "today") {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateMatch = bookingDate >= todayStart;
      } else if (dateFilter === "week") {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateMatch = bookingDate >= weekStart;
      } else if (dateFilter === "month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateMatch = bookingDate >= monthStart;
      }
    }
    
    return statusMatch && searchMatch && dateMatch;
  });

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h1>
            <p className="text-slate-600">Enter password to access bookings</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-slate-600">{isConnected ? 'Live' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/admin/vehicles"
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">garage</span>
              <span className="hidden sm:inline">Manage Vehicles</span>
            </a>
            <a
              href="/admin/rides"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">directions_car</span>
              <span className="hidden sm:inline">Active Rides</span>
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 md:p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">payments</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs opacity-90 mt-1">Total Revenue</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 md:p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">today</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
            <p className="text-xs opacity-90 mt-1">{stats.todayBookings} bookings</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 md:p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">pending_actions</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Action</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.pendingBookings}</p>
            <p className="text-xs opacity-90 mt-1">Pending Approval</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 md:p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">trending_up</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Avg</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">₹{Math.round(stats.averageBookingValue)}</p>
            <p className="text-xs opacity-90 mt-1">Per Booking</p>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">analytics</span>
            Revenue Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-1">This Week</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.weekRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.monthRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completedBookings}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by name, email, location, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">Status</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-75">
                      ({bookings.filter(b => b.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filters */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">Pickup Date</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateFilter(option.value as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    dateFilter === option.value
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing <span className="font-bold text-slate-900">{filteredBookings.length}</span> of <span className="font-bold">{bookings.length}</span> bookings
            </p>
            {(searchQuery || filter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                  setDateFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">inbox</span>
            <p className="text-slate-600">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{booking.customer_name}</p>
                        <p className="text-xs text-slate-500">{booking.customer_email}</p>
                      </div>
                      <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                        booking.trip_type === 'to_airport' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {booking.trip_type === 'to_airport' ? '✈️ To Airport' : '🏠 From Airport'}
                      </span>
                    </div>
                    
                    {/* Route Info */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-600 text-lg mt-0.5">trip_origin</span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">PICKUP</p>
                          <p className="text-sm text-slate-900">{booking.pickup_location}</p>
                          {booking.address_line1 && (
                            <p className="text-xs text-slate-600 mt-1">
                              {[booking.address_line1, booking.address_line2, booking.landmark, booking.area, booking.pincode].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="border-l-2 border-dashed border-slate-300 ml-2 h-4"></div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-red-600 text-lg mt-0.5">location_on</span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">DROPOFF</p>
                          <p className="text-sm text-slate-900">{booking.dropoff_location}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Details */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-purple-600 text-base">directions_car</span>
                        <span className="font-semibold text-purple-900">{booking.vehicle_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-blue-600 text-base">calendar_today</span>
                        <span className="font-semibold text-blue-900">{new Date(booking.pickup_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-orange-600 text-base">schedule</span>
                        <span className="font-semibold text-orange-900">{new Date(booking.pickup_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-green-600 text-base">payments</span>
                        <span className="font-semibold text-green-900">₹{booking.total_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex gap-4 text-[10px] text-slate-400">
                      <span>Created: {new Date(booking.created_at).toLocaleString()}</span>
                      <span>Updated: {new Date(booking.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex lg:flex-col items-center gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors min-w-[140px] ${
                        booking.status === 'pending' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                        booking.status === 'confirmed' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                        booking.status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' :
                        'border-red-300 bg-red-50 text-red-700'
                      }`}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="confirmed">✅ Confirmed</option>
                      <option value="completed">🎉 Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                    
                    <div className="flex gap-2">
                      <a
                        href={`tel:${booking.customer_email}`}
                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Call customer"
                      >
                        <span className="material-symbols-outlined text-xl">call</span>
                      </a>
                      
                      <a
                        href={`mailto:${booking.customer_email}`}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Email customer"
                      >
                        <span className="material-symbols-outlined text-xl">email</span>
                      </a>
                      
                      <button
                        onClick={() => deleteBooking(booking.id, booking.customer_name)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete booking"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
