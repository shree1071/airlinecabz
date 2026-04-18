"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/seed-vehicles", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to seed vehicles");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Seed Vehicles Database</h1>
          <button
            onClick={() => router.push("/")}
            className="text-slate-600 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="font-bold text-blue-900 mb-2">What does this do?</h2>
            <p className="text-sm text-blue-800">
              This will populate your database with all 25 vehicles from your landing page:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>11 Airport taxi vehicles (Hatchback to Tempo Traveller AC)</li>
              <li>7 Outstation vehicles (Sedan to Innova Hycross)</li>
              <li>7 Local hire vehicles (4hrs/8hrs packages)</li>
            </ul>
          </div>

          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Seeding Database..." : "Seed Vehicles Now"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-900 mb-2">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-green-900 mb-2">Success!</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>{result.message}</p>
                {result.inserted !== undefined && (
                  <p className="font-semibold">
                    Inserted: {result.inserted} new vehicles
                  </p>
                )}
                {result.total !== undefined && (
                  <p>Total vehicles in database: {result.total}</p>
                )}
              </div>
              <button
                onClick={() => router.push("/book")}
                className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Go to Booking Page
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Note: This operation is safe to run multiple times. It will only insert vehicles that don't already exist.
          </p>
        </div>
      </div>
    </div>
  );
}
