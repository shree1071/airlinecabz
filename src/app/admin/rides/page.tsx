"use client";

import React, { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { useRouter } from "next/navigation";

type ConfirmedRide = {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  trip_type: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
  total_amount: number;
  payment_method: string;
  ride_status: string;
  notes: string | null;
  confirmed_at: string;
};

export default function ActiveRidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<ConfirmedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth !== "true") {
      router.push("/admin");
      return;
    }

    fetchRides();
  }, [router]);

  const fetchRides = async () => {
    const { data, error } = await insforge.database
      .from("confirmed_rides")
      .select("*")
      .order("pickup_date", { ascending: true });

    if (error) {
      console.error("Error fetching rides:", error);
    } else {
      setRides(data || []);
    }
    setLoading(false);
  };

  const updateRideStatus = async (id: string, newStatus: string) => {
    if (newStatus === "completed") {
      // Move to completed_rides
      const ride = rides.find(r => r.id === id);
      if (!ride) return;

      const rating = prompt("Customer Rating (1-5):");
      const feedback = prompt("Customer Feedback (optional):");

      const { error: insertError } = await insforge.database
        .from("completed_rides")
        .insert([{
          booking_id: ride.booking_id,
          confirmed_ride_id: id,
          customer_name: ride.customer_name,
          customer_email: ride.customer_email,
          customer_phone: ride.customer_phone,
          trip_type: ride.trip_type,
          pickup_location: ride.pickup_location,
          dropoff_location: ride.dropoff_location,
          pickup_date: ride.pickup_date,
          vehicle_type: ride.vehicle_type,
          driver_name: ride.driver_name,
          driver_phone: ride.driver_phone,
          vehicle_number: ride.vehicle_number,
          total_amount: ride.total_amount,
          payment_method: ride.payment_method,
          actual_amount: ride.total_amount,
          rating: rating ? parseInt(rating) : null,
          feedback: feedback || null,
          completed_at: new Date().toISOString(),
        }]);

      if (insertError) {
        console.error("Error archiving ride:", insertError);
        alert("Failed to complete ride");
        return;
      }

      // Delete from confirmed_rides
      const { error: deleteError } = await insforge.database
        .from("confirmed_rides")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting ride:", deleteError);
      } else {
        setRides(prev => prev.filter(r => r.id !== id));
        alert("Ride completed and archived!");
      }
    } else {
      const { error } = await insforge.database
        .from("confirmed_rides")
        .update({ 
          ride_status: newStatus,
          ...(newStatus === "in_progress" && { started_at: new Date().toISOString() })
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating ride:", error);
        alert("Failed to update ride status");
      } else {
        fetchRides();
      }
    }
  };

  const filteredRides = filter === "all" 
    ? rides 
    : rides.filter(r => r.ride_status === filter);

  if (loading) return <div className="p-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin")} className="p-2 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Active Rides</h1>
              <p className="text-xs text-slate-600">Confirmed & Scheduled Rides</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Scheduled</p>
            <p className="text-3xl font-bold text-blue-600">
              {rides.filter(r => r.ride_status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-orange-600">
              {rides.filter(r => r.ride_status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Total Active</p>
            <p className="text-3xl font-bold text-slate-900">{rides.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex gap-2">
            {['all', 'scheduled', 'in_progress'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Rides List */}
        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">directions_car</span>
            <p className="text-slate-600">No active rides</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">person</span>
                      <span className="font-bold text-slate-900">{ride.customer_name}</span>
                      <span className="text-xs text-slate-500">{ride.customer_email}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-green-600 text-base">
                        {ride.trip_type === 'to_airport' ? 'flight_takeoff' : 'flight_land'}
                      </span>
                      <div>
                        <p className="text-slate-700">{ride.pickup_location}</p>
                        <p className="text-slate-500 text-xs">to {ride.dropoff_location}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>🚗 {ride.vehicle_type}</span>
                      <span>📅 {new Date(ride.pickup_date).toLocaleString()}</span>
                      <span className="font-semibold text-slate-900">₹{ride.total_amount}</span>
                      <span>💳 {ride.payment_method}</span>
                    </div>

                    {(ride.driver_name || ride.vehicle_number) && (
                      <div className="bg-blue-50 rounded-lg p-3 text-xs">
                        {ride.driver_name && <p>👤 Driver: {ride.driver_name}</p>}
                        {ride.driver_phone && <p>📞 {ride.driver_phone}</p>}
                        {ride.vehicle_number && <p>🚗 Vehicle: {ride.vehicle_number}</p>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={ride.ride_status}
                      onChange={(e) => updateRideStatus(ride.id, e.target.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                        ride.ride_status === 'scheduled' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                        ride.ride_status === 'in_progress' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                        'border-green-200 bg-green-50 text-green-700'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Complete</option>
                    </select>
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
