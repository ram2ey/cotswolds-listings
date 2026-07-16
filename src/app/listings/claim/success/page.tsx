"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { CheckCircle, ArrowRight, ShieldCheck, Sparkles, Home } from 'lucide-react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') || '';
  const sessionId = searchParams?.get('session_id') || '';

  // Determine if it was a mock activation
  const isMock = sessionId.startsWith('mock_');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="relative max-w-lg w-full bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden animate-fade-in my-6">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Success Checkmark with floating micro-animations */}
          <div className="relative flex justify-center mb-6">
            <div className="relative h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/60 shadow-inner">
              <CheckCircle className="h-10 w-10 text-emerald-500 animate-pulse" />
            </div>
            <div className="absolute -top-1 right-1/3 animate-bounce">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-black text-stone-900 tracking-tight">
              Payment Confirmed!
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-105 border border-stone-200 text-stone-650 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secure Checkout Complete
            </div>
          </div>

          {/* Success Card Explanation */}
          <div className="mt-8 bg-stone-50 border border-stone-150 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-stone-450 uppercase tracking-widest">Upgrade Status</p>
              <p className="text-stone-700 text-xs mt-1.5 leading-relaxed">
                Thank you! Your transaction has been verified. Our AI copywriter and Apify content scraper are executing website analysis in the background. 
                Your listing details, highlights, and custom menus will refresh shortly.
              </p>
            </div>

            {sessionId && (
              <div className="border-t border-stone-200/60 pt-3 flex justify-between items-center text-[10px] font-medium text-stone-400">
                <span>Transaction Ref</span>
                <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600 truncate max-w-[200px]">
                  {sessionId}
                </span>
              </div>
            )}
            
            {isMock && (
              <div className="border-t border-stone-200/60 pt-3 flex justify-between items-center text-[10px] font-medium text-amber-600">
                <span>Stripe Environment</span>
                <span className="font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  Offline Mock Mode Fallback
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="py-3.5 border border-stone-250 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold transition shadow-xs text-center flex items-center justify-center gap-1.5"
            >
              <Home className="h-4 w-4 text-stone-400" />
              Return Home
            </Link>

            {slug ? (
              <Link
                href={`/listings/${slug}`}
                className="py-3.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition shadow-md text-center flex items-center justify-center gap-1.5 group"
              >
                View Premium Profile
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:translate-x-0.5 transition" />
              </Link>
            ) : (
              <Link
                href="/search"
                className="py-3.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition shadow-md text-center flex items-center justify-center gap-1.5 group"
              >
                Browse Listings
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:translate-x-0.5 transition" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer theme="dark" />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 gap-4">
        <div className="animate-spin h-8 w-8 border-2 border-stone-300 border-t-amber-550 rounded-full" />
        <p className="text-xs text-stone-500 font-medium">Finalising checkout state...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
