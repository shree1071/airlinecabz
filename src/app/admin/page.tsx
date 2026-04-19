"use client";

import React, { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
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
};

const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [isConnected, setIsConnected] = useState(false);

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
          setBookings((prev) => [payload, ...prev]);
        });

        // Listen for booking updates
        insforge.realtime.on("UPDATE_booking", (payload: any) => {
          console.log("Booking updated:", payload);
          setBookings((prev) =>
            prev.map((b) => (b.id === payload.id ? { ...b, ...payload } : b))
          );
        });

        // Listen for booking deletions
        insforge.realtime.on("DELETE_booking", (payload: any) => {
          console.log("Booking deleted:", payload);
          setBookings((prev) => prev.filter((b) => b.id !== payload.id));
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

  // Filter bookings
  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

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
              href="/admin/rides"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">directions_car</span>
              Active Rides
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
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Total Bookings</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Pending</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-600">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Confirmed</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
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
              </button>
            ))}
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
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">person</span>
                      <span className="font-bold text-slate-900">{booking.customer_name}</span>
                      <span className="text-xs text-slate-500">{booking.customer_email}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-green-600 text-base">location_on</span>
                      <div>
                        <p className="text-slate-700">{booking.pickup_location}</p>
                        <p className="text-slate-500 text-xs">to {booking.dropoff_location}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>🚗 {booking.vehicle_type}</span>
                      <span>📅 {new Date(booking.pickup_date).toLocaleString()}</span>
                      <span className="font-semibold text-slate-900">₹{booking.total_amount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                        booking.status === 'pending' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                        booking.status === 'confirmed' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                        booking.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                        'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
