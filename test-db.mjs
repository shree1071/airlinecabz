import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://m6ys432n.us-east.insforge.app',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzMzNjZ9.MsfiuguCgDkrKbEJvTJ-8fbxM79Aop8AyJao8vJW28Y'
});

async function run() {
  console.log("Fetching bookings...");
  const { data, error } = await client.database.from('bookings').select('*');
  console.log("Error:", error);
  console.log("Data length:", data?.length);
  if (data?.length > 0) {
    console.log("First booking:", JSON.stringify(data[0], null, 2));
  }
}

run();
