"use client";

import { useState } from "react";

export default function WhatsAppHelloTest() {
  const [phoneNumber, setPhoneNumber] = useState("15556393449");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const sendHelloWorld = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/test-hello-world", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.details || data.error || "Failed to send message");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            WhatsApp Hello World Test
          </h1>
          <p className="text-slate-600 mb-6">
            Test sending the pre-approved "hello_world" template
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number (with country code)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="919901366449"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                Format: 91 followed by 10-digit number (no spaces)
              </p>
            </div>

            <button
              onClick={sendHelloWorld}
              disabled={loading || !phoneNumber}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Hello World Template"}
            </button>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                ✓ Success!
              </h3>
              <p className="text-sm text-green-700 mb-3">{result.message}</p>
              <div className="bg-white rounded p-3 text-xs font-mono overflow-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📝 Important Notes:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>The recipient must have WhatsApp installed</li>
              <li>The number must be active and reachable</li>
              <li>Messages may take a few seconds to deliver</li>
              <li>Check your WhatsApp to see if the message arrived</li>
              <li>If using test mode, add the number in Meta Business Manager</li>
            </ul>
          </div>

          <div className="mt-4">
            <a
              href="/admin/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
