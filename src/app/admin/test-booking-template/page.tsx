"use client";

import { useState } from "react";

export default function TestBookingTemplatePage() {
  const [phoneNumber, setPhoneNumber] = useState("919901366449");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test-booking-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send message");
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              📱 Test Booking Confirmation Template
            </h1>
            <p className="text-slate-600">
              Test the WhatsApp booking confirmation message with sample data
            </p>
          </div>

          {/* Test Sample Data */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              📋 Sample Booking Data
            </h2>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Customer:</strong> Rajesh Kumar</p>
              <p><strong>Booking ID:</strong> BK-TEST-12345</p>
              <p><strong>From:</strong> Koramangala, Bangalore</p>
              <p><strong>To:</strong> Kempegowda International Airport</p>
              <p><strong>Date:</strong> Monday, 26 May 2026</p>
              <p><strong>Time:</strong> 08:30 AM</p>
              <p><strong>Vehicle:</strong> Toyota Innova Crysta</p>
              <p><strong>Amount:</strong> ₹2,500</p>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              WhatsApp Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="919901366449"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-slate-500">
              Format: Country code + number (e.g., 919901366449 for India)
            </p>
          </div>

          {/* Send Button */}
          <button
            onClick={handleTest}
            disabled={loading || !phoneNumber}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? "Sending..." : "📤 Send Test Message"}
          </button>

          {/* Results */}
          {error && (
            <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ❌ Error
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              {result?.message && (
                <div className="mt-4 p-4 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    {result.message}
                  </p>
                  {result.instructions && (
                    <p className="text-sm text-red-700">
                      {result.instructions}
                    </p>
                  )}
                </div>
              )}

              {result?.details && (
                <details className="mt-4">
                  <summary className="text-sm text-red-700 cursor-pointer hover:text-red-800">
                    Show technical details
                  </summary>
                  <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {result && !error && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Success!
              </h3>
              <p className="text-green-700 mb-4">
                Booking confirmation sent to {result.sentTo}
              </p>
              
              <details className="mt-4">
                <summary className="text-sm text-green-700 cursor-pointer hover:text-green-800">
                  Show response details
                </summary>
                <pre className="mt-2 p-4 bg-green-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              ⚠️ Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li>
                • The <code className="bg-amber-100 px-2 py-1 rounded">booking_confirmation</code> template must be created and approved in Meta Business Manager first
              </li>
              <li>
                • Template approval usually takes 1-24 hours
              </li>
              <li>
                • See <code className="bg-amber-100 px-2 py-1 rounded">WHATSAPP_BOOKING_TEMPLATE_SETUP.md</code> for detailed setup instructions
              </li>
              <li>
                • The recipient's phone number must be registered on WhatsApp
              </li>
              <li>
                • Test with your own number first before using customer numbers
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="mt-6 flex gap-4">
            <a
              href="/admin/dashboard"
              className="flex-1 text-center px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              ← Back to Dashboard
            </a>
            <a
              href="/admin/whatsapp-hello"
              className="flex-1 text-center px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Test Hello World →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
