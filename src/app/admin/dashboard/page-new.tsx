"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Booking, BookingStatus, toNumber, formatCurrency } from "@/types";
import WhatsAppButton from "@/components/WhatsAppButton";

type DashboardView = "overview" | "bookings" | "calendar" | "customers" | "analytics";

type BookingWithActions = Booking & {
  isEditing?: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [bookings, setBookings] = useState<BookingWithActions[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    avgBookingValue: 0,
  });

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchBookings();

    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(fetchBookings, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router, autoRefresh]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch("/api/bookings", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        calculateStats(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList: Booking[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeBookings = bookingsList.filter(b => b.status !== 'cancelled');
    const totalRev = activeBookings.reduce((sum, b) => sum + toNumber(b.total_amount), 0);

    setStats({
      totalBookings: bookingsList.length,
      pendingBookings: bookingsList.filter(b => b.status === 'pending').length,
      confirmedBookings: bookingsList.filter(b => b.status === 'confirmed').length,
      completedBookings: bookingsList.filter(b => b.status === 'completed').length,
      cancelledBookings: bookingsList.filter(b => b.status === 'cancelled').length,
      todayBookings: bookingsList.filter(b => new Date(b.created_at) >= today).length,
      todayRevenue: bookingsList
        .filter(b => new Date(b.created_at) >= today && b.status !== 'cancelled')
        .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
      weekRevenue: bookingsList
        .filter(b => new Date(b.created_at) >= weekAgo && b.status !== 'cancelled')
        .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
      monthRevenue: bookingsList
        .filter(b => new Date(b.created_at) >= monthAgo && b.status !== 'cancelled')
        .reduce((sum, b) => sum + toNumber(b.total_amount), 0),
      avgBookingValue: activeBookings.length > 0 ? totalRev / activeBookings.length : 0,
    });
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === "today") {
        filtered = filtered.filter(b => new Date(b.pickup_date) >= today);
      } else if (dateFilter === "week") {
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b => {
          const pickupDate = new Date(b.pickup_date);
          return pickupDate >= today && pickupDate <= weekFromNow;
        });
      } else if (dateFilter === "month") {
        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b => {
          const pickupDate = new Date(b.pickup_date);
          return pickupDate >= today && pickupDate <= monthFromNow;
        });
      }
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Airlinecabz</h1>
                <p className="text-xs text-slate-500">Operations Dashboard</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setCurrentView("overview")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === "overview"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setCurrentView("bookings")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === "bookings"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                📋 All Bookings
              </button>
              <button
                onClick={() => setCurrentView("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === "calendar"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setCurrentView("customers")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === "customers"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                👥 Customers
              </button>
              <button
                onClick={() => setCurrentView("analytics")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === "analytics"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                📈 Analytics
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-slate-100 text-slate-600"
                }`}
                title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              >
                {autoRefresh ? "🔄 Live" : "⏸️ Paused"}
              </button>

              {/* Fleet */}
              <Link
                href="/admin/vehicles"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                🚗 Fleet
              </Link>

              {/* WhatsApp Test */}
              <Link
                href="/admin/test-booking-template"
                className="px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                title="Test WhatsApp"
              >
                💬
              </Link>

              {/* Sign Out */}
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

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Overview View */}
        {currentView === "overview" && (
          <OverviewView
            stats={stats}
            bookings={bookings}
            onViewChange={setCurrentView}
          />
        )}

        {/* Bookings View */}
        {currentView === "bookings" && (
          <BookingsView
            bookings={filteredBookings}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            updateBookingStatus={updateBookingStatus}
            deleteBooking={deleteBooking}
            openEditModal={openEditModal}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Calendar View */}
        {currentView === "calendar" && (
          <CalendarView bookings={bookings} />
        )}

        {/* Customers View */}
        {currentView === "customers" && (
          <CustomersView bookings={bookings} />
        )}

        {/* Analytics View */}
        {currentView === "analytics" && (
          <AnalyticsView bookings={bookings} stats={stats} />
        )}
      </main>

      {/* Edit Modal */}
      {showEditModal && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}

// Overview View Component
function OverviewView({ stats, bookings, onViewChange }: any) {
  const urgentBookings = bookings
    .filter((b: Booking) => b.status === 'pending')
    .sort((a: Booking, b: Booking) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime())
    .slice(0, 5);

  const upcomingRides = bookings
    .filter((b: Booking) => {
      const pickupDate = new Date(b.pickup_date);
      const now = new Date();
      return pickupDate > now && (b.status === 'confirmed' || b.status === 'pending');
    })
    .sort((a: Booking, b: Booking) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Bookings"
          value={stats.todayBookings}
          subtitle={`Revenue: ${formatCurrency(stats.todayRevenue)}`}
          icon="📅"
          color="blue"
        />
        <MetricCard
          title="Pending Actions"
          value={stats.pendingBookings}
          subtitle="Needs confirmation"
          icon="⏳"
          color="amber"
          onClick={() => onViewChange("bookings")}
        />
        <MetricCard
          title="Confirmed Rides"
          value={stats.confirmedBookings}
          subtitle="Ready to go"
          icon="✓"
          color="green"
        />
        <MetricCard
          title="Week Revenue"
          value={formatCurrency(stats.weekRevenue)}
          subtitle={`Avg: ${formatCurrency(stats.avgBookingValue)}`}
          icon="💰"
          color="emerald"
        />
      </div>

      {/* Urgent Actions */}
      {urgentBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">⚠️ Urgent Actions</h2>
            <span className="text-sm text-slate-500">{urgentBookings.length} pending</span>
          </div>
          <div className="space-y-3">
            {urgentBookings.map((booking: Booking) => (
              <UrgentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Rides */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">🚗 Upcoming Rides</h2>
          <button
            onClick={() => onViewChange("calendar")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Calendar →
          </button>
        </div>
        <div className="space-y-3">
          {upcomingRides.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No upcoming rides</p>
          ) : (
            upcomingRides.map((booking: Booking) => (
              <UpcomingRideCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <StatusBar label="Pending" count={stats.pendingBookings} total={stats.totalBookings} color="amber" />
            <StatusBar label="Confirmed" count={stats.confirmedBookings} total={stats.totalBookings} color="blue" />
            <StatusBar label="Completed" count={stats.completedBookings} total={stats.totalBookings} color="green" />
            <StatusBar label="Cancelled" count={stats.cancelledBookings} total={stats.totalBookings} color="red" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Today</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">This Week</p>
              <p className="text-xl font-semibold text-slate-700">{formatCurrency(stats.weekRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">This Month</p>
              <p className="text-xl font-semibold text-slate-700">{formatCurrency(stats.monthRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => onViewChange("bookings")}
              className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors text-left"
            >
              📋 View All Bookings
            </button>
            <button
              onClick={() => onViewChange("calendar")}
              className="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors text-left"
            >
              📅 Check Calendar
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors text-left"
            >
              📈 View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, subtitle, icon, color, onClick }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'blue' | 'amber' | 'green' | 'emerald';
  onClick?: () => void;
}) {
  const colorClasses: Record<'blue' | 'amber' | 'green' | 'emerald', string> = {
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    green: "from-green-500 to-green-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

// Urgent Booking Card
function UrgentBookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-slate-900">{booking.customer_name}</p>
        <p className="text-sm text-slate-600">
          {booking.pickup_location} → {booking.dropoff_location}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(booking.pickup_date).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <WhatsAppButton booking={booking} variant="small" />
        <span className="text-lg font-semibold text-slate-900">{formatCurrency(booking.total_amount)}</span>
      </div>
    </div>
  );
}

// Upcoming Ride Card
function UpcomingRideCard({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-slate-900">{booking.customer_name}</p>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {booking.status}
          </span>
        </div>
        <p className="text-sm text-slate-600">{booking.vehicle_type}</p>
        <p className="text-xs text-slate-500 mt-1">
          📍 {booking.pickup_location}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900">
          {new Date(booking.pickup_date).toLocaleDateString()}
        </p>
        <p className="text-xs text-slate-500">
          {new Date(booking.pickup_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// Status Bar Component
function StatusBar({ label, count, total, color }: { 
  label: string; 
  count: number; 
  total: number; 
  color: 'amber' | 'blue' | 'green' | 'red';
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorClasses: Record<'amber' | 'blue' | 'green' | 'red', string> = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{count}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]} transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// Bookings View Component
function BookingsView({
  bookings,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  updateBookingStatus,
  deleteBooking,
  openEditModal,
  getStatusColor,
}: any) {
  const [sortField, setSortField] = useState<'pickup_date' | 'created_at' | 'total_amount'>('pickup_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedBookings = [...bookings].sort((a, b) => {
    let aVal, bVal;
    
    if (sortField === 'total_amount') {
      aVal = toNumber(a[sortField]);
      bVal = toNumber(b[sortField]);
    } else {
      aVal = new Date(a[sortField]).getTime();
      bVal = new Date(b[sortField]).getTime();
    }
    
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, phone, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Next 7 Days</option>
              <option value="month">Next 30 Days</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{bookings.length}</span> bookings
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <button
              onClick={() => toggleSort('pickup_date')}
              className={`px-3 py-1 text-sm rounded-lg ${
                sortField === 'pickup_date' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Pickup {sortField === 'pickup_date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('created_at')}
              className={`px-3 py-1 text-sm rounded-lg ${
                sortField === 'created_at' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('total_amount')}
              className={`px-3 py-1 text-sm rounded-lg ${
                sortField === 'total_amount' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Amount {sortField === 'total_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pickup</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                sortedBookings.map((booking: Booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{booking.customer_name}</p>
                        <p className="text-sm text-slate-500">{booking.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">📍 {booking.pickup_location}</p>
                        <p className="text-slate-500">→ {booking.dropoff_location}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">
                          {new Date(booking.pickup_date).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-slate-500">
                          {new Date(booking.pickup_date).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-900">{booking.vehicle_type}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{formatCurrency(booking.total_amount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <WhatsAppButton booking={booking} variant="icon" />
                        <button
                          onClick={() => openEditModal(booking)}
                          className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit booking"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete booking"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const pickupDate = new Date(booking.pickup_date);
      return (
        pickupDate.getDate() === date.getDate() &&
        pickupDate.getMonth() === date.getMonth() &&
        pickupDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dayBookings = getBookingsForDate(date);
            const isToday = 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();
            const isSelected = selectedDate?.getDate() === day && 
              selectedDate?.getMonth() === month && 
              selectedDate?.getFullYear() === year;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : dayBookings.length > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-sm font-medium">{day}</div>
                {dayBookings.length > 0 && (
                  <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {dayBookings.length} ride{dayBookings.length > 1 ? 's' : ''}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {selectedDate ? (
            <>
              {selectedDate.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </>
          ) : (
            'Select a date'
          )}
        </h3>

        {selectedDate && selectedDateBookings.length > 0 ? (
          <div className="space-y-3">
            {selectedDateBookings.map(booking => (
              <div key={booking.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-900">{booking.customer_name}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  {new Date(booking.pickup_date).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  📍 {booking.pickup_location}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(booking.total_amount)}
                </p>
              </div>
            ))}
          </div>
        ) : selectedDate ? (
          <p className="text-center text-slate-500 py-8">No bookings for this date</p>
        ) : (
          <p className="text-center text-slate-500 py-8">Click on a date to view bookings</p>
        )}
      </div>
    </div>
  );
}

// Customers View Component
function CustomersView({ bookings }: { bookings: Booking[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Group bookings by customer
  const customerMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    bookings: Booking[];
    totalSpent: number;
    lastBooking: string;
  }>();

  bookings.forEach(booking => {
    const key = booking.customer_email || booking.customer_phone;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
        bookings: [],
        totalSpent: 0,
        lastBooking: booking.created_at,
      });
    }
    const customer = customerMap.get(key)!;
    customer.bookings.push(booking);
    if (booking.status !== 'cancelled') {
      customer.totalSpent += toNumber(booking.total_amount);
    }
    if (new Date(booking.created_at) > new Date(customer.lastBooking)) {
      customer.lastBooking = booking.created_at;
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) => 
    new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime()
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Repeat Customers</p>
          <p className="text-3xl font-bold text-slate-900">
            {customers.filter(c => c.bookings.length > 1).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Avg Bookings/Customer</p>
          <p className="text-3xl font-bold text-slate-900">
            {customers.length > 0 ? (bookings.length / customers.length).toFixed(1) : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Top Customer Spent</p>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(Math.max(...customers.map(c => c.totalSpent), 0))}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Last Booking</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-slate-900">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{customer.email}</p>
                        <p className="text-slate-500">{customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-slate-900">{customer.bookings.length}</span>
                        {customer.bookings.length > 1 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            Repeat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{formatCurrency(customer.totalSpent)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600">
                        {new Date(customer.lastBooking).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        💬 Contact
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ bookings, stats }: { bookings: Booking[]; stats: any }) {
  // Revenue by vehicle type
  const revenueByVehicle = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((acc, booking) => {
      const vehicle = booking.vehicle_type;
      if (!acc[vehicle]) {
        acc[vehicle] = { count: 0, revenue: 0 };
      }
      acc[vehicle].count++;
      acc[vehicle].revenue += toNumber(booking.total_amount);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

  const vehicleStats = Object.entries(revenueByVehicle)
    .map(([vehicle, data]) => ({ vehicle, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Revenue by status
  const statusRevenue = {
    pending: bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + toNumber(b.total_amount), 0),
    confirmed: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + toNumber(b.total_amount), 0),
    completed: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + toNumber(b.total_amount), 0),
  };

  // Popular routes
  const routeMap = new Map<string, number>();
  bookings.forEach(booking => {
    const route = `${booking.pickup_location} → ${booking.dropoff_location}`;
    routeMap.set(route, (routeMap.get(route) || 0) + 1);
  });
  const popularRoutes = Array.from(routeMap.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Booking trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyBookings = last7Days.map(date => {
    const count = bookings.filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate.toDateString() === date.toDateString();
    }).length;
    return {
      date: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      count,
    };
  });

  const maxDailyBookings = Math.max(...dailyBookings.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(stats.monthRevenue)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Avg Booking Value</p>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(stats.avgBookingValue)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Per booking</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-slate-900">
            {stats.totalBookings > 0 
              ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.completedBookings} of {stats.totalBookings}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Cancellation Rate</p>
          <p className="text-3xl font-bold text-slate-900">
            {stats.totalBookings > 0 
              ? ((stats.cancelledBookings / stats.totalBookings) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.cancelledBookings} cancelled
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">📈 Booking Trend (Last 7 Days)</h3>
          <div className="space-y-3">
            {dailyBookings.map((day, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{day.date}</span>
                  <span className="text-sm font-semibold text-slate-900">{day.count} bookings</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${(day.count / maxDailyBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">💰 Revenue by Status</h3>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">Pending</span>
                <span className="text-lg font-bold text-amber-900">{formatCurrency(statusRevenue.pending)}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">{stats.pendingBookings} bookings</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Confirmed</span>
                <span className="text-lg font-bold text-blue-900">{formatCurrency(statusRevenue.confirmed)}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">{stats.confirmedBookings} bookings</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-700">Completed</span>
                <span className="text-lg font-bold text-emerald-900">{formatCurrency(statusRevenue.completed)}</span>
              </div>
              <p className="text-xs text-emerald-600 mt-1">{stats.completedBookings} bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Vehicle */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">🚗 Revenue by Vehicle Type</h3>
          <div className="space-y-3">
            {vehicleStats.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No data available</p>
            ) : (
              vehicleStats.map((stat, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{stat.vehicle}</span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(stat.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{stat.count} bookings</span>
                    <span className="text-slate-600">Avg: {formatCurrency(stat.revenue / stat.count)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">🔥 Popular Routes</h3>
          <div className="space-y-3">
            {popularRoutes.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No data available</p>
            ) : (
              popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{route.route}</p>
                    <p className="text-xs text-slate-500">{route.count} bookings</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Booking Modal (placeholder)
function EditBookingModal({ booking, onClose, onSave }: {
  booking: Booking;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    customer_phone: booking.customer_phone,
    pickup_location: booking.pickup_location,
    dropoff_location: booking.dropoff_location,
    pickup_date: booking.pickup_date.slice(0, 16), // Format for datetime-local input
    vehicle_type: booking.vehicle_type,
    status: booking.status,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
      } else {
        alert("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Error updating booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Edit Booking</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Customer Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900">Booking Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
              <input
                type="text"
                value={formData.pickup_location}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dropoff Location</label>
              <input
                type="text"
                value={formData.dropoff_location}
                onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.pickup_date}
                  onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                <input
                  type="text"
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BookingStatus })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
