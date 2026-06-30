import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="mb-10 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-slate-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-500">Effective Date: January 1, {currentYear}</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-h2:text-primary">
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              Welcome to Airlinecabz. By accessing our platform and booking our transportation services, you agree to be bound by the following Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-2xl mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6 text-slate-700">
              By utilizing the Airlinecabz web application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, as well as our Privacy Policy.
            </p>

            <h2 className="text-2xl mt-8 mb-4">2. Service Provision</h2>
            <p className="mb-4 text-slate-700">
              Airlinecabz acts as a platform to facilitate the booking of airport transportation. We strive to ensure timely and safe journeys; however:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700">
              <li>We do not guarantee vehicle availability until a booking is explicitly confirmed by our administrative team.</li>
              <li>Estimated times of arrival (ETAs) and journey durations are estimates based on routing algorithms and are subject to traffic and weather conditions.</li>
            </ul>

            <h2 className="text-2xl mt-8 mb-4">3. User Responsibilities</h2>
            <p className="mb-4 text-slate-700">As a user of our platform, you agree to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700">
              <li>Provide accurate, current, and complete information during the booking process.</li>
              <li>Be ready at the designated pickup location at the scheduled time.</li>
              <li>Not use the service for any unlawful purposes or to transport illegal goods.</li>
            </ul>

            <h2 className="text-2xl mt-8 mb-4">4. Cancellations & Refunds</h2>
            <p className="mb-6 text-slate-700">
              Cancellations made prior to vehicle dispatch may be eligible for a full refund. Cancellations made after a vehicle has been dispatched or in the event of a "no-show" may incur a cancellation fee. Specific fee structures will be communicated upon booking confirmation.
            </p>

            <h2 className="text-2xl mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="mb-6 text-slate-700">
              To the maximum extent permitted by applicable law, Airlinecabz shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses, resulting from your access to or use of our services, or any delay or failure in service fulfillment.
            </p>

            <h2 className="text-2xl mt-8 mb-4">6. Modifications to Service</h2>
            <p className="mb-6 text-slate-700">
              We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the Service.
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold mb-2">Legal Jurisdiction</h3>
              <p className="text-slate-600">
                These terms are governed by the applicable regional laws where the platform operates. For legal inquiries, please contact our administrative team.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
