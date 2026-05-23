'use client';

import { useState } from 'react';

export default function WhatsAppTestPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hello! This is a test message from AirlinCabz.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestMessage = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          message: message.trim()
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            WhatsApp Test Panel
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (with country code)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +919876543210 or 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter Indian mobile number with or without +91
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={sendTestMessage}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Test Message'}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 rounded-md border">
              <h3 className="font-medium mb-2">
                {result.success ? 'Success' : 'Error'}
              </h3>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Get your WhatsApp Business API credentials from Meta Business Manager</li>
              <li>Add them to your .env.local file:
                <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                  <li>WHATSAPP_ACCESS_TOKEN</li>
                  <li>WHATSAPP_PHONE_NUMBER_ID</li>
                  <li>WHATSAPP_BUSINESS_ACCOUNT_ID</li>
                </ul>
              </li>
              <li>Create a message template in Meta Business Manager for booking confirmations</li>
              <li>Test the integration using this panel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}