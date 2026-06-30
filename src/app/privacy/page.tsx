import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="mb-10 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-slate-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-500">Last Updated: {currentYear}</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-h2:text-primary">
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              At Airlinecabz, we take your privacy and the security of your Personal Identifiable Information (PII) very seriously. This Privacy Policy outlines our data handling practices in compliance with the Personal Data Protection Act (PDPA) and other applicable global data privacy regulations.
            </p>

            <h2 className="text-2xl mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">To provide our transportation services efficiently, we collect the following information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700">
              <li><strong>Contact Information:</strong> Your full name, email address, and phone number.</li>
              <li><strong>Location Data:</strong> Precise GPS coordinates (latitude and longitude) and text addresses for your requested pickup and drop-off locations.</li>
              <li><strong>Booking Details:</strong> Journey dates, times, vehicle preferences, and flight terminal information.</li>
            </ul>

            <h2 className="text-2xl mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">Your data is strictly utilized for the following operational purposes:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700">
              <li>Facilitating and fulfilling your booked transportation services.</li>
              <li>Communicating booking confirmations, driver assignments, and trip updates (via Email and WhatsApp).</li>
              <li>Ensuring platform security, fraud prevention, and enforcing our Terms of Service.</li>
            </ul>

            <h2 className="text-2xl mt-8 mb-4">3. Data Storage & Residency</h2>
            <p className="mb-6 text-slate-700">
              Airlinecabz operates globally, but to ensure strict data security and regulatory compliance, your data is securely transmitted to and persisted within our <strong>Singapore-based database infrastructure</strong>. By using our services, you consent to the cross-border transfer of your data to Singapore for storage and processing.
            </p>

            <h2 className="text-2xl mt-8 mb-4">4. Third-Party Sharing</h2>
            <p className="mb-6 text-slate-700">
              We do not sell your personal data. We only share necessary data with trusted third-party sub-processors (such as our database providers, email delivery services, and WhatsApp messaging APIs) strictly for the purpose of delivering our services to you.
            </p>

            <h2 className="text-2xl mt-8 mb-4">5. Your Rights & Data Erasure</h2>
            <p className="mb-6 text-slate-700">
              Under applicable laws, you have the right to request access to, modification of, or the complete erasure of your personal data stored on our servers. To execute a "Right to be Forgotten" request, please contact our support team. Upon verification of your identity, we will permanently purge your records from our active databases.
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold mb-2">Contact Us</h3>
              <p className="text-slate-600">
                If you have any questions regarding this Privacy Policy or our data handling architecture, please contact us at <a href="mailto:privacy@airlinecabz.com" className="text-primary hover:underline">privacy@airlinecabz.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}