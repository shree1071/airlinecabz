"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  MapPin, Car, User, Phone, Banknote, Building, CreditCard,
  CheckCircle2, XCircle, Clock3, Search, ArrowLeft, MessageCircle,
  Plus, RefreshCcw, X, AlertTriangle,
} from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/ui/leaflet-map"), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
      Loading Map...
    </div>
  ) 
});

type RideStatus = "pending" | "scheduled" | "in_progress" | "completed" | "cancelled" | "confirmed";
type PaymentMethod = "cash" | "upi" | "corporate_invoice" | "prepaid_online";

type Assignment = {
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
};

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  trip_type: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  total_amount: number;
  status: RideStatus;
  assignments?: Assignment[];
  financials?: { payment_method?: string };
  payment_method?: string; // added to flat DTO potentially
};

const PAYMENT_METHODS = [
  { value: "cash",             label: "Cash",    icon: Banknote  },
  { value: "upi",              label: "UPI",     icon: Phone     },
  { value: "corporate_invoice",label: "B2B",     icon: Building  },
  { value: "prepaid_online",   label: "Prepaid", icon: CreditCard},
];

const STATUS_CONFIG: Record<RideStatus, { label: string; cls: string; dot: string; icon: React.ElementType }> = {
  pending:     { label: "Pending",    cls: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-400",   icon: AlertTriangle },
  scheduled:   { label: "Scheduled",  cls: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400",   icon: Clock3        },
  confirmed:   { label: "Confirmed",  cls: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400",   icon: Clock3        },
  in_progress: { label: "Dispatched", cls: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500",    icon: Car           },
  completed:   { label: "Completed",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2  },
  cancelled:   { label: "Cancelled",  cls: "bg-red-50 text-red-600 border-red-200",          dot: "bg-red-500",     icon: XCircle       },
};

const fmt = (n: number | string) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (s: string) => {
  const d = new Date(s);
  return {
    raw: d,
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

function StatusBadge({ status }: { status: RideStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function DispatchPage() {
  const router = useRouter();
  const [rides, setRides]               = useState<Booking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [timeFilter, setTimeFilter]     = useState<"all"|"today"|"upcoming">("all");
  const [statusFilter, setStatusFilter] = useState<"active"|"completed">("active");
  const [selected, setSelected]         = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen]     = useState(false);

  const fetchRides = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch("/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) {
          setRides(data.bookings.sort((a: any, b: any) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime()));
        }
      }
    } catch(e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") !== "true") { router.push("/admin"); return; }
    fetchRides();
    const id = setInterval(fetchRides, 30000);
    return () => clearInterval(id);
  }, [router, fetchRides]);

  const filtered = useMemo(() => {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate()+1);
    return rides.filter(r => {
      const activeStatus = r.status !== "completed" && r.status !== "cancelled";
      if (statusFilter === "active" && !activeStatus) return false;
      if (statusFilter === "completed" && r.status !== "completed") return false;
      
      const d = new Date(r.pickup_date);
      if (timeFilter === "today" && (d < todayStart || d >= tomorrowStart)) return false;
      if (timeFilter === "upcoming" && d < tomorrowStart) return false;

      if (search) {
        const t = search.toLowerCase();
        const driverName = r.assignments?.[0]?.driver_name || "";
        if (![r.customer_name, r.customer_phone, driverName, r.id].some(v => v?.toLowerCase().includes(t))) return false;
      }
      return true;
    });
  }, [rides, search, timeFilter, statusFilter]);

  const open = (ride: Booking) => { setSelected(ride); setDialogOpen(true); };

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <Toaster position="top-right" richColors />

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/dashboard")} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Dispatch Center</span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                {filtered.length} rides
              </span>
            </div>
          </div>
          <button onClick={fetchRides} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-md transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-1">
            {(["all","today","upcoming"] as const).map(f => (
              <button key={f} onClick={() => setTimeFilter(f)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${timeFilter===f ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                {f === "all" ? "All Rides" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
              {(["active","completed"] as const).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${statusFilter===f ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-500 hover:text-slate-900"}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Name, phone, booking ID…"
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[960px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3.5 w-36">Pickup</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Route</th>
                  <th className="px-5 py-3.5 w-44">Driver</th>
                  <th className="px-5 py-3.5 w-28 text-right">Fare</th>
                  <th className="px-5 py-3.5 w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_,j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3.5 bg-slate-100 rounded animate-pulse" style={{width: `${60+Math.random()*30}%`}} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">No rides match your filters.</td></tr>
                ) : filtered.map(ride => {
                  const dt = fmtDate(ride.pickup_date);
                  const isUrgent = (ride.status === "scheduled" || ride.status === "pending") && dt.raw.getTime() - Date.now() < 7200000 && dt.raw.getTime() - Date.now() > 0;
                  const driver = ride.assignments?.[0];
                  
                  return (
                    <tr key={ride.id} onClick={() => open(ride)}
                      className={`group cursor-pointer transition-colors hover:bg-blue-50/40 ${isUrgent ? "bg-amber-50/30" : ""}`}>

                      <td className="px-5 py-3.5 align-top">
                        <div className="font-semibold text-slate-900 text-sm">{dt.time}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{dt.date}</div>
                        {isUrgent && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Urgent</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 align-top">
                        <div className="font-medium text-slate-900 text-sm">{ride.customer_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{ride.customer_phone}</div>
                      </td>

                      <td className="px-5 py-3.5 align-top max-w-[260px]">
                        <div className="flex items-start gap-2 mb-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                          <span className="text-xs text-slate-700 leading-relaxed truncate" title={ride.pickup_location}>{ride.pickup_location}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-sm bg-slate-700 shrink-0 mt-1" />
                          <span className="text-xs text-slate-400 leading-relaxed truncate" title={ride.dropoff_location}>{ride.dropoff_location}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 align-top">
                        {driver?.driver_name ? (
                          <>
                            <div className="text-sm font-medium text-slate-900">{driver.driver_name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{driver.vehicle_number}</div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                            <Plus className="w-3 h-3" /> Assign
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 align-top text-right">
                        <div className="font-semibold text-slate-900 text-sm">{fmt(ride.total_amount)}</div>
                        <div className="text-xs text-slate-400 mt-0.5 capitalize">{ride.payment_method?.replace(/_/g," ") || "Cash"}</div>
                      </td>

                      <td className="px-5 py-3.5 align-top">
                        <StatusBadge status={ride.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <RideDialog ride={selected} open={dialogOpen} onClose={() => setDialogOpen(false)} onUpdated={fetchRides} />
    </div>
  );
}

function RideDialog({ ride, open, onClose, onUpdated }: {
  ride: Booking | null; open: boolean; onClose: () => void; onUpdated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    driver_name:"", 
    driver_phone:"", 
    vehicle_number:"", 
    payment_method:"cash" as PaymentMethod, 
    base_amount:0, 
    extras:0, 
    ride_status:"pending" as RideStatus 
  });

  useEffect(() => {
    if (ride) {
      const driver = ride.assignments?.[0];
      setForm({ 
        driver_name: driver?.driver_name || "", 
        driver_phone: driver?.driver_phone || "", 
        vehicle_number: driver?.vehicle_number || "", 
        payment_method: (ride.payment_method as PaymentMethod) || "cash", 
        base_amount: ride.total_amount, 
        extras: 0, 
        ride_status: ride.status 
      });
    }
  }, [ride]);

  const total = Number(form.base_amount) + Number(form.extras||0);
  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const updateRideStatus = async (status: string, markCompleted = false) => {
    if (!ride) return; setSaving(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch(`/api/bookings/${ride.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          status,
          driver_name: form.driver_name || undefined,
          driver_phone: form.driver_phone || undefined,
          vehicle_number: form.vehicle_number || undefined,
          payment_method: form.payment_method,
          total_amount: total,
        })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(markCompleted ? "Ride completed and archived." : "Saved successfully.");
      onUpdated();
      onClose();
    } catch { 
      toast.error("Could not save changes."); 
    } finally { 
      setSaving(false); 
    }
  };

  const save = () => updateRideStatus(form.ride_status);
  const complete = () => updateRideStatus("completed", true);

  if (!ride) return null;
  const dt = fmtDate(ride.pickup_date);
  const waMsg = encodeURIComponent(`*NEW DISPATCH – Airlinecabz*\n\n📍 From: ${ride.pickup_location}\n🏁 To: ${ride.dropoff_location}\n📅 ${dt.date} at ${dt.time}\n\n👤 Customer: ${ride.customer_name}\n📞 ${ride.customer_phone}\n\n💰 Collect: ${form.payment_method==="cash"?fmt(total):"Already paid / B2B"}\n\nPlease confirm.`);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent showCloseButton={false} className="!max-w-[900px] w-full p-0 gap-0 bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
        
        <div className="flex items-start justify-between px-8 pt-6 pb-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Dispatch #{ride.id.slice(0,6).toUpperCase()}</h2>
              <StatusBadge status={form.ride_status} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{ride.customer_name} · <span className="text-slate-400">{dt.date} at {dt.time}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[600px] max-h-[75vh]">
          <div className="w-full md:w-[45%] bg-slate-50/50 border-r border-slate-100 p-8 flex flex-col gap-8 overflow-y-auto">
            <div className="w-full h-48 bg-slate-200/60 rounded-xl border border-slate-200/80 overflow-hidden relative group shadow-inner">
              <LeafletMap pickup={ride.pickup_location} dropoff={ride.dropoff_location} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Trip Route</h3>
              <div className="flex items-stretch gap-4 relative">
                <div className="absolute top-1.5 bottom-1.5 left-[5px] w-px bg-slate-200" />
                <div className="flex flex-col justify-between py-1 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                  <div className="w-3 h-3 rounded-sm bg-slate-800 ring-4 ring-white" />
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Pickup</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{ride.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Drop-off</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{ride.dropoff_location}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Passenger</h3>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {ride.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{ride.customer_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ride.customer_phone}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Vehicle Req.</span>
                  <span className="font-semibold text-slate-900 capitalize">{ride.vehicle_type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[55%] bg-white p-8 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Driver & Fleet</h3>
                  {form.driver_phone && (
                    <a href={`https://wa.me/${form.driver_phone.replace(/\D/g,"")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors uppercase tracking-wide">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Driver Name</label>
                    <input value={form.driver_name} onChange={e=>set("driver_name",e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium text-slate-900"
                      placeholder="e.g. Ramesh Kumar" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                      <input value={form.driver_phone} onChange={e=>set("driver_phone",e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium text-slate-900"
                        placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vehicle Reg.</label>
                      <input value={form.vehicle_number} onChange={e=>set("vehicle_number",e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium text-slate-900 uppercase"
                        placeholder="KA01AB1234" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Billing & Payment</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1 mb-4 grid grid-cols-4 gap-1">
                  {PAYMENT_METHODS.map(pm => {
                    const active = form.payment_method === pm.value;
                    return (
                      <button key={pm.value} onClick={()=>set("payment_method",pm.value)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-center transition-all ${active ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}>
                        <span className="text-[11px] font-bold tracking-wide">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm px-1">
                    <span className="text-slate-500 font-medium">Base Fare</span>
                    <span className="font-bold text-slate-900">{fmt(form.base_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm px-1">
                    <span className="text-slate-500 font-medium">Tolls / Parking / Wait</span>
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input type="number" value={form.extras||""} onChange={e=>set("extras",Number(e.target.value))}
                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all shadow-sm"
                        placeholder="0" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between px-1">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total to Collect</span>
                    <span className="text-3xl font-bold tracking-tight text-slate-900">{fmt(total)}</span>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Dispatch Status</h3>
                <div className="flex items-center gap-3">
                  {(["scheduled","confirmed","in_progress"] as RideStatus[]).map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const active = form.ride_status === s;
                    return (
                      <button key={s} onClick={()=>set("ride_status",s)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${active ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                        <span className={`w-2 h-2 rounded-full ${active ? "bg-white animate-pulse" : cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
              <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors px-2">Discard</button>
              <div className="flex gap-3">
                <button onClick={save} disabled={saving}
                  className="px-6 py-2.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50 shadow-sm">
                  {saving ? "Saving…" : "Save Progress"}
                </button>
                <button onClick={complete} disabled={saving}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm shadow-blue-600/20">
                  <CheckCircle2 className="w-4 h-4" /> Finalize Ride
                </button>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
