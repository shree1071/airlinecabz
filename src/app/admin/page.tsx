"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const revenue = bookings.reduce((acc, curr) => {
    return curr.payment_status !== "unpaid" ? acc + Number(curr.deposit_amount) : acc;
  }, 0);
  
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  useEffect(() => {
    if (isLoaded && user) {
      if (user.publicMetadata?.role !== "admin") {
        router.push("/");
        return;
      }
      fetchBookings();
    }
  }, [user, isLoaded, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filteredBookings = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (!isLoaded || loading) return <div className="p-12 text-center font-bold">Loading Admin...</div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900">directions_car</span>
            <h1 className="text-xl font-bold tracking-tighter text-blue-900 font-headline">AirlinCabz <span className="text-sm font-medium text-outline">Admin</span></h1>
          </div>
          <button onClick={() => router.push("/")} className="text-sm font-bold text-slate-500 hover:text-blue-900">Exit Admin</button>
        </div>
      </header>

      <main className="pt-24 pb-24 px-4 space-y-6 max-w-3xl mx-auto">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-6 rounded-3xl text-on-primary shadow-lg">
            <p className="text-on-primary-container text-xs font-semibold uppercase tracking-wider mb-1">Total Revenue (Deposits)</p>
            <h2 className="text-3xl font-extrabold font-headline tracking-tight">₹{revenue.toLocaleString()}</h2>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-blue-900 text-sm">calendar_today</span>
            </div>
            <p className="text-outline text-[10px] font-bold uppercase tracking-tight">Total Bookings</p>
            <p className="text-xl font-bold text-on-surface">{bookings.length}</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-amber-600 text-sm">pending</span>
            </div>
            <p className="text-outline text-[10px] font-bold uppercase tracking-tight">Pending</p>
            <p className="text-xl font-bold text-on-surface">{pendingCount}</p>
          </div>
        </section>

        {/* Filters */}
        <section className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0 transition-colors ${
                filter === f ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {f}
            </button>
          ))}
        </section>

        {/* Booking List */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-lg font-bold font-headline text-blue-900">Recent Bookings</h3>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Live Updates</span>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center text-outline py-12">No bookings found in this category.</div>
          )}

          {filteredBookings.map((b) => (
            <div key={b.id} className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[10px] font-bold text-primary tracking-tighter bg-primary-fixed px-2 py-0.5 rounded-md">
                      {b.id.split("-")[0].toUpperCase()}
                    </p>
                    <span className={`status-${b.status === 'pending' ? 'pending' : b.status === 'cancelled' ? 'cancelled' : 'confirmed'}`}>
                      {b.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-on-surface">{b.customer_name}</h4>
                  <p className="text-xs text-outline">{b.customer_email}</p>
                  
                  <div className="mt-3 text-sm">
                    <div className="flex items-center gap-1 text-on-surface-variant"><span className="material-symbols-outlined text-[14px]">flight_takeoff</span> {b.pickup_location}</div>
                    <div className="flex items-center gap-1 text-on-surface-variant mt-1"><span className="material-symbols-outlined text-[14px]">flight_land</span> {b.dropoff_location}</div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-none pt-4 md:pt-0">
                  <div className="text-left md:text-right mb-0 md:mb-4">
                    <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Fare</p>
                    <p className="font-bold text-blue-900">₹{b.total_amount}</p>
                    <p className="text-[10px] text-outline">Paid: ₹{b.deposit_amount}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(b.id, "confirmed")} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200">
                          <span className="material-symbols-outlined text-sm text-emerald-700">check</span>
                        </button>
                        <button onClick={() => updateStatus(b.id, "cancelled")} className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200">
                          <span className="material-symbols-outlined text-sm text-red-700">close</span>
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <button onClick={() => updateStatus(b.id, "completed")} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
