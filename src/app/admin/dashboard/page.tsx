"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking, BookingStatus, toNumber, formatCurrency } from "@/types";
import {
  Banknote, TrendingUp, CalendarDays, Percent, AlertCircle,
  Car, Clock, CheckCircle2, XCircle, LogOut, ChevronRight,
  MessageCircle, Calendar, LayoutDashboard, RefreshCcw, Clock3,
} from "lucide-react";

type DashboardStats = {
  totalBookings: number; pendingBookings: number; confirmedBookings: number;
  completedBookings: number; cancelledBookings: number; totalRevenue: number;
  todayBookings: number; todayRevenue: number; weekRevenue: number;
  monthRevenue: number; avgBookingValue: number; conversionRate: number; upcomingRides: number;
};

type RevenueData = { date: string; revenue: number; bookings: number };

const getStatusConfig = (status: BookingStatus) => {
  switch (status) {
    case "pending":   return { label:"Pending",   cls:"bg-amber-50 text-amber-700 border-amber-200",   icon: Clock3       };
    case "confirmed": return { label:"Confirmed", cls:"bg-blue-50 text-blue-700 border-blue-200",     icon: Car          };
    case "completed": return { label:"Completed", cls:"bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 };
    case "cancelled": return { label:"Cancelled", cls:"bg-red-50 text-red-600 border-red-200",        icon: XCircle      };
    default:          return { label: status,     cls:"bg-slate-50 text-slate-600 border-slate-200",   icon: AlertCircle  };
  }
};

const DEFAULT_STATS: DashboardStats = {
  totalBookings:0, pendingBookings:0, confirmedBookings:0, completedBookings:0,
  cancelledBookings:0, totalRevenue:0, todayBookings:0, todayRevenue:0,
  weekRevenue:0, monthRevenue:0, avgBookingValue:0, conversionRate:0, upcomingRides:0,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [stats, setStats]               = useState<DashboardStats>(DEFAULT_STATS);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [urgentActions, setUrgentActions]   = useState<Booking[]>([]);
  const [revenueChart, setRevenueChart]     = useState<RevenueData[]>([]);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuth");
    const token = sessionStorage.getItem("adminToken");
    if (!isAuthenticated || !token) { router.push("/admin"); return; }
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(id);
  }, [router]);

  const fetchDashboardData = async (attempt = 1): Promise<void> => {
    try {
      setLoading(true); setError(null);
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch("/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      if (data.bookings) {
        const bookings: Booking[] = data.bookings;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7*24*60*60*1000);
        const monthAgo = new Date(today.getTime() - 30*24*60*60*1000);
        const activeBookings = bookings.filter(b => b.status !== "cancelled");
        const totalRev = activeBookings.reduce((s, b) => s + toNumber(b.total_amount), 0);

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b=>b.status==="pending").length,
          confirmedBookings: bookings.filter(b=>b.status==="confirmed").length,
          completedBookings: bookings.filter(b=>b.status==="completed").length,
          cancelledBookings: bookings.filter(b=>b.status==="cancelled").length,
          totalRevenue: totalRev,
          todayBookings: bookings.filter(b=>new Date(b.created_at)>=today).length,
          todayRevenue: bookings.filter(b=>new Date(b.created_at)>=today&&b.status!=="cancelled").reduce((s,b)=>s+toNumber(b.total_amount),0),
          weekRevenue: bookings.filter(b=>new Date(b.created_at)>=weekAgo&&b.status!=="cancelled").reduce((s,b)=>s+toNumber(b.total_amount),0),
          monthRevenue: bookings.filter(b=>new Date(b.created_at)>=monthAgo&&b.status!=="cancelled").reduce((s,b)=>s+toNumber(b.total_amount),0),
          avgBookingValue: activeBookings.length>0 ? totalRev/activeBookings.length : 0,
          conversionRate: bookings.length>0 ? (bookings.filter(b=>b.status==="completed").length/bookings.length)*100 : 0,
          upcomingRides: bookings.filter(b=>(b.status==="confirmed"||b.status==="pending")&&new Date(b.pickup_date)>now).length,
        });

        setUrgentActions(bookings.filter(b=>b.status==="pending").sort((a,b)=>new Date(a.pickup_date).getTime()-new Date(b.pickup_date).getTime()).slice(0,6));
        setRecentBookings(bookings.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,8));

        const chartData: RevenueData[] = [];
        for (let i=6; i>=0; i--) {
          const date = new Date(today.getTime()-i*24*60*60*1000);
          const next = new Date(date.getTime()+24*60*60*1000);
          const day = bookings.filter(b=>{ const d=new Date(b.created_at); return d>=date&&d<next; });
          chartData.push({
            date: date.toLocaleDateString("en-US",{month:"short",day:"numeric"}),
            revenue: day.filter(b=>b.status!=="cancelled").reduce((s,b)=>s+toNumber(b.total_amount),0),
            bookings: day.length,
          });
        }
        setRevenueChart(chartData);
      }
    } catch (err: any) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, attempt*1500));
        return fetchDashboardData(attempt+1);
      }
      setError(err?.message || "Failed to load. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem("adminToken"); sessionStorage.removeItem("adminAuth"); router.push("/admin");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading command center…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-900 mb-1.5">Dashboard Unavailable</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={() => fetchDashboardData()}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">Airlinecabz</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest ml-2">Ops Center</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-0.5 ml-4 pl-4 border-l border-slate-200">
              {[
                { label:"Overview", href:"/admin/dashboard", active:true },
                { label:"Dispatch", href:"/admin/rides",    active:false },
                { label:"Fleet",    href:"/admin/vehicles", active:false },
              ].map(link => (
                <Link key={link.label} href={link.href}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${link.active ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </div>
            <button onClick={signOut} className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-7 space-y-7">

        {/* ── Triage ─────────────────────────────────────────── */}
        {urgentActions.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Needs Attention</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                {urgentActions.length} pending
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {urgentActions.map(booking => (
                <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{booking.customer_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.customer_phone}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 ml-3">{formatCurrency(booking.total_amount)}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(booking.pickup_date).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:true})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="capitalize">{booking.vehicle_type}</span>
                    </div>
                  </div>
                  <Link href="/admin/rides"
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors group-hover:bg-blue-600">
                    Assign Driver <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Metric Cards ───────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Today's Revenue", value: formatCurrency(stats.todayRevenue), sub:`${stats.todayBookings} bookings`, icon: Banknote, accent:"bg-violet-50 text-violet-600" },
            { label:"This Week",       value: formatCurrency(stats.weekRevenue),  sub:"Last 7 days", icon: TrendingUp, accent:"bg-blue-50 text-blue-600" },
            { label:"Upcoming Rides",  value: String(stats.upcomingRides),         sub:"Confirmed & pending", icon: CalendarDays, accent:"bg-slate-100 text-slate-600" },
            { label:"Completion Rate", value: `${stats.conversionRate.toFixed(1)}%`, sub:"Of all bookings", icon: Percent, accent:"bg-emerald-50 text-emerald-600" },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                  <div className={`p-2 rounded-lg ${card.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">{card.value}</p>
                <p className="text-xs text-slate-400">{card.sub}</p>
              </div>
            );
          })}
        </section>

        {/* ── Table + Sidebar ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Recent Bookings Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Last {recentBookings.length} reservations</p>
              </div>
              <Link href="/admin/rides" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                All Dispatches <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Pickup</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentBookings.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No bookings yet.</td></tr>
                  ) : recentBookings.slice(0,7).map(booking => {
                    const cfg = getStatusConfig(booking.status);
                    const Icon = cfg.icon;
                    const pickupTime = new Date(booking.pickup_date).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
                    const pickupDate = new Date(booking.pickup_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 align-top">
                          <p className="text-sm font-semibold text-slate-900">{booking.customer_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{booking.customer_phone}</p>
                        </td>
                        <td className="px-5 py-3.5 align-top max-w-[160px]">
                          <p className="text-xs font-medium text-slate-700 truncate" title={booking.pickup_location}>{booking.pickup_location}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {pickupDate} · {pickupTime}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 align-top text-right">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(booking.total_amount)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">{booking.vehicle_type?.split("-")[0]}</p>
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${cfg.cls}`}>
                            <Icon className="w-3 h-3" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <a href={`https://wa.me/${booking.customer_phone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Hello ${booking.customer_name},\n\nYour booking is confirmed! 🚗\n\nBooking ID: ${booking.id}\nPickup: ${new Date(booking.pickup_date).toLocaleString("en-IN",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:true})}\nVehicle: ${booking.vehicle_type}\nAmount: ₹${booking.total_amount}\n\nThank you – Airlinecabz`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wide">
                            <MessageCircle className="w-3 h-3" /> Send
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-5">

            {/* Revenue Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Revenue</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">{formatCurrency(stats.weekRevenue)}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">This week</p>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {revenueChart.map((d, i) => {
                  const h = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 4) : 4;
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full flex items-end" style={{height:"80px"}}>
                        <div
                          className={`w-full rounded-md transition-all ${isToday ? "bg-slate-900" : "bg-slate-200 group-hover:bg-slate-400"}`}
                          style={{height:`${h}%`}}
                          title={`${d.date}: ${formatCurrency(d.revenue)} (${d.bookings} bookings)`}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">{d.date.split(" ")[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Pipeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Pipeline</h2>
              <div className="space-y-3">
                {[
                  { label:"Pending Review",  value:stats.pendingBookings,   cls:"bg-amber-500" },
                  { label:"Confirmed",       value:stats.confirmedBookings, cls:"bg-blue-500"  },
                  { label:"Completed",       value:stats.completedBookings, cls:"bg-emerald-500" },
                  { label:"Cancelled",       value:stats.cancelledBookings, cls:"bg-slate-300" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.cls}`} />
                    <span className="text-xs text-slate-600 flex-1">{item.label}</span>
                    <span className="text-xs font-bold text-slate-900">{item.value}</span>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.cls} rounded-full transition-all`}
                        style={{width:`${stats.totalBookings > 0 ? Math.min((item.value/stats.totalBookings)*100,100) : 0}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-xl p-5 text-white">
              <p className="text-sm font-bold mb-1">Quick Actions</p>
              <p className="text-xs text-slate-400 mb-4">Jump to common tasks</p>
              <div className="space-y-2">
                {[
                  { label:"Assign Drivers",  sub:"Open dispatch center", icon: Car,            href:"/admin/rides" },
                  { label:"Test WhatsApp",   sub:"Send test notification", icon: MessageCircle, href:"/admin/test-booking-template" },
                ].map(action => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/8 hover:bg-white/15 transition-colors group">
                      <div className="p-1.5 rounded-md bg-white/10">
                        <Icon className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{action.label}</p>
                        <p className="text-[10px] text-slate-400">{action.sub}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
