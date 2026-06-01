"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await insforge.auth.signInWithOAuth({
        provider: 'google',
        // Instead of redirecting immediately, we could also use a popup or just rely on standard OAuth redirect.
        // Wait, standard OAuth redirect will refresh the page and lose form state.
        // For Insforge (Supabase under the hood), we can set skipBrowserRedirect to false, but to keep form state we should either:
        // 1. Save form state to localStorage before auth.
        // 2. Use a popup for OAuth if supported.
        redirectTo: window.location.href, // Redirect back to this exact page
      });
      if (error) throw error;
      
      // If popup or smooth auth happens without full redirect:
      // onSuccess();
    } catch (err: any) {
      console.error("Auth error:", err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-brandDark/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-8 shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Subtle glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brandBlue rounded-full mix-blend-multiply filter blur-[64px] opacity-20 pointer-events-none" />

              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="text-center mb-6 mt-2 relative z-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <span className="material-symbols-outlined text-3xl text-brandBlue">lock_person</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 font-headline tracking-tight mb-1">
                  Secure Your Ride
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  Sign in quickly to confirm your booking and track your driver.
                </p>
              </div>

              <div className="relative z-10">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 py-3 px-6 rounded-xl font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-slate-400">
                      progress_activity
                    </span>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {loading ? "Connecting..." : "Continue with Google"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
