"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking, BookingStatus, toNumber, formatCurrency } from "@/types";

type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  avgBookingValue: number;
  conversionRate: number;
  upcomingRides: number;
};

type RevenueData = {
  date: string;
  revenue: number;
  bookings: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    avgBookingValue: 0,
    conversionRate: 0,
    upcomingRides: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [urgentActions, setUrgentActions] = useState<Booking[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("adminAuth");
    const token = sessionStorage.getItem("adminToken");
    
    if (!isAuthenticated || !token) {
      router.push("/admin");
      return;
    }

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get the auth token
      const token = sessionStorage.getItem("adminToken");
      
      // Fetch all bookings with authentication
      const response = await fetch("/api/bookings", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.bookings) {
        const bookings: Booking[] = data.bookings;
        
        // Calculate dates
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Calculate comprehensive stats
        const activeBookings = bookings.filter(b => b.status !== 'cancelled');
        const totalRev = activeBookings.reduce((sum, b) => sum + toNumber(b.total_amount), 0);
        
        const calculatedStats: DashboardStats = {
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
          totalRevenue: totalRev,
          todayBookings: bookings.filter(b => {
            const bookingDate = new Date(b.created_at);
            return bookingDate >= today;
          }).length,
          todayRevenue: bookings
            .filter(b => {
              const bookingDate = new Date(b.created_at);
              return bookingDate >= today && b.status !== 'cancelled';
            })
            .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
          weekRevenue: bookings
            .filter(b => {
              const bookingDate = new Date(b.created_at);
              return bookingDate >= weekAgo && b.status !== 'cancelled';
            })
            .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
          monthRevenue: bookings
            .filter(b => {
              const bookingDate = new Date(b.created_at);
              return bookingDate >= monthAgo && b.status !== 'cancelled';
            })
            .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
          avgBookingValue: activeBookings.length > 0 ? totalRev / activeBookings.length : 0,
          conversionRate: bookings.length > 0 
            ? (bookings.filter(b => b.status === 'completed').length / bookings.length) * 100 
            : 0,
          upcomingRides: bookings.filter(b => 
            (b.status === 'confirmed' || b.status === 'pending') && 
            new Date(b.pickup_date) > now
          ).length,
        };
        
        setStats(calculatedStats);
        
        // Get urgent actions (pending bookings)
        const urgent = bookings
          .filter(b => b.status === 'pending')
          .sort((a, b) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime())
          .slice(0, 5);
        setUrgentActions(urgent);
        
        // Get recent bookings (last 8)
        const recent = bookings
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 8);
        setRecentBookings(recent);
        
        // Generate revenue chart data (last 7 days)
        const chartData: RevenueData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
          
          const dayBookings = bookings.filter(b => {
            const bookingDate = new Date(b.created_at);
            return bookingDate >= date && bookingDate < nextDate;
          });
          
          chartData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayBookings
              .filter(b => b.status !== 'cancelled')
              .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
            bookings: dayBookings.length,
          });
        }
        setRevenueChart(chartData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✓';
      case 'completed': return '✓✓';
      case 'cancelled': return '✕';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Airlinecabz</h1>
                <p className="text-xs text-slate-500">Operations Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live</span>
              </div>
              
              <Link
                href="/admin/vehicles"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
              >
                Fleet
              </Link>
              
              <Link
                href="/admin/rides"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
              >
                All Bookings
              </Link>
              
              <Link
                href="/admin/test-booking-template"
                className="px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                title="Test WhatsApp booking notifications"
              >
                📱 WhatsApp
              </Link>
              
              <button
                onClick={() => {
                  sessionStorage.removeItem("adminToken");
                  sessionStorage.removeItem("adminAuth");
                  router.push("/admin");
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Today's Revenue */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Today</span>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Revenue</h3>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-xs text-slate-500 mt-2">{stats.todayBookings} bookings today</p>
              </div>

              {/* Pending Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">Action Required</span>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Pending</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.pendingBookings}</p>
                <p className="text-xs text-slate-500 mt-2">Awaiting confirmation</p>
              </div>

              {/* Upcoming Rides */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Scheduled</span>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Upcoming</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.upcomingRides}</p>
                <p className="text-xs text-slate-500 mt-2">Confirmed rides</p>
              </div>

              {/* Avg Booking Value */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Average</span>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Avg Value</h3>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.avgBookingValue)}</p>
                <p className="text-xs text-slate-500 mt-2">Per booking</p>
              </div>
            </div>

            {/* Urgent Actions Section */}
            {urgentActions.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Urgent Actions Required</h2>
                    <p className="text-sm text-slate-600">{urgentActions.length} pending bookings need confirmation</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {urgentActions.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-lg p-4 border border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🚕</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{booking.customer_name}</p>
                          <p className="text-sm text-slate-600">{booking.customer_phone}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm text-slate-600">{booking.vehicle_type}</p>
                          <p className="text-xs text-slate-500">{new Date(booking.pickup_date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{formatCurrency(booking.total_amount)}</span>
                        <Link
                          href="/admin/rides"
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
                  <p className="text-sm text-slate-500 mt-1">Latest customer reservations</p>
                </div>
                <Link
                  href="/admin/rides"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pickup</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                              <span className="text-3xl">📋</span>
                            </div>
                            <p className="text-slate-500 font-medium">No bookings yet</p>
                            <p className="text-sm text-slate-400">New bookings will appear here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{booking.customer_name}</p>
                              <p className="text-xs text-slate-500">{booking.customer_phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-900">{booking.vehicle_type}</p>
                            <p className="text-xs text-slate-500">{booking.trip_type === 'to_airport' ? 'To Airport' : 'From Airport'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-900">{new Date(booking.pickup_date).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{new Date(booking.pickup_date).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(booking.total_amount)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                              <span>{getStatusIcon(booking.status)}</span>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`https://wa.me/${booking.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${booking.customer_name},\n\nYour booking has been confirmed.\n\nBooking ID: ${booking.id}\nFrom: ${booking.pickup_location}\nTo: ${booking.dropoff_location}\nDate: ${new Date(booking.pickup_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\nTime: ${new Date(booking.pickup_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}\nVehicle: ${booking.vehicle_type}\nTotal Amount: ₹${booking.total_amount}\n\nWe will contact you 30 minutes before pickup. Have a safe journey.\n\nThank you for choosing Airlinecabz.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                              title="Send WhatsApp confirmation"
                            >
                              <span className="text-sm">💬</span>
                              Send
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Week Revenue */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-4">Last 7 Days</h3>
                <p className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(stats.weekRevenue)}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.weekRevenue / (stats.monthRevenue || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500">of month</span>
                </div>
              </div>

              {/* Month Revenue */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-4">Last 30 Days</h3>
                <p className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(stats.monthRevenue)}</p>
                <p className="text-sm text-slate-500">Total revenue this month</p>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-4">Completion Rate</h3>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Bookings completed successfully</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend (Last 7 Days)</h2>
              <div className="space-y-4">
                {revenueChart.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-slate-600">{day.date}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full transition-all flex items-center justify-end pr-3"
                            style={{ width: `${Math.max((day.revenue / Math.max(...revenueChart.map(d => d.revenue))) * 100, 5)}%` }}
                          >
                            <span className="text-xs font-medium text-white">{formatCurrency(day.revenue)}</span>
                          </div>
                        </div>
                        <div className="w-16 text-sm text-slate-600 text-right">{day.bookings} rides</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⏳</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Pending</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingBookings}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✓</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Confirmed</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.confirmedBookings}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✓✓</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Completed</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.completedBookings}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✕</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Cancelled</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.cancelledBookings}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
