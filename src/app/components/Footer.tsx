"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";

interface FooterProps {
  theme?: "light" | "dark";
}

export default function Footer({ theme = "light" }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubscribed(true);
    setEmail("");
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isDark = theme === "dark";

  // Theme-specific CSS classes
  const bgClass = isDark ? "bg-stone-950 text-stone-300 border-t border-stone-850" : "bg-white text-stone-900 border-t border-stone-200";
  const titleClass = isDark ? "text-stone-400" : "text-stone-400";
  const mutedTextClass = isDark ? "text-stone-400" : "text-stone-500";
  const linkHoverClass = isDark ? "hover:text-white" : "hover:text-stone-950";
  const inputBgClass = isDark ? "bg-stone-900 border-stone-800 text-white placeholder-stone-500 focus:ring-amber-500 focus:border-amber-500" : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-450 focus:ring-amber-500 focus:border-amber-500";
  const dividerClass = isDark ? "border-stone-800" : "border-stone-100";
  const logoSrc = isDark ? "/logo-dark.jpg" : "/logo-light.jpg";

  return (
    <footer className={`${bgClass} py-16 transition-colors duration-300 relative z-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-12">
          {/* Column 1: Branding */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Cotswolds Pages"
                className="h-12 w-auto object-contain rounded-md"
              />
            </Link>
            <p className={`text-xs ${mutedTextClass} leading-relaxed pr-2`}>
              A premium, high-performance local business directory. Connecting visitors and residents to boutique hotels, local tradesmen, coaching inns, and artisan shops across the Cotswold region.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg w-fit font-bold border border-amber-500/20">
              Verified Cotswolds Partner
            </div>
          </div>

          {/* Column 2: Discover Villages */}
          <div>
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${titleClass} mb-4`}>
              Explore Locations
            </h4>
            <ul className={`space-y-2 text-xs font-semibold ${mutedTextClass}`}>
              <li>
                <Link href="/search?region=Broadway" className={`${linkHoverClass} transition`}>
                  Broadway
                </Link>
              </li>
              <li>
                <Link href="/search?region=Bourton-on-the-Water" className={`${linkHoverClass} transition`}>
                  Bourton-on-the-Water
                </Link>
              </li>
              <li>
                <Link href="/search?region=Stow-on-the-Wold" className={`${linkHoverClass} transition`}>
                  Stow-on-the-Wold
                </Link>
              </li>
              <li>
                <Link href="/search?region=Chipping%20Campden" className={`${linkHoverClass} transition`}>
                  Chipping Campden
                </Link>
              </li>
              <li>
                <Link href="/search?region=Cirencester" className={`${linkHoverClass} transition`}>
                  Cirencester
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation & Contact */}
          <div>
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${titleClass} mb-4`}>
              Quick Directory
            </h4>
            <ul className={`space-y-2.5 text-xs font-semibold ${mutedTextClass} mb-4`}>
              <li>
                <Link href="/search" className={`${linkHoverClass} transition`}>
                  Directory Search
                </Link>
              </li>
              <li>
                <Link href="/listings/submit" className={`${linkHoverClass} transition`}>
                  Claim Your Free Listing
                </Link>
              </li>
              <li>
                <a href="mailto:info@cotswoldspages.co.uk" className={`${linkHoverClass} transition`}>
                  info@cotswoldspages.co.uk
                </a>
              </li>
            </ul>
            <div className={`pt-3 border-t ${dividerClass} flex gap-3 text-[11px] text-stone-400`}>
              <a href="#" className={`${linkHoverClass} transition`}>Facebook</a>
              <span>•</span>
              <a href="#" className={`${linkHoverClass} transition`}>Instagram</a>
              <span>•</span>
              <a href="#" className={`${linkHoverClass} transition`}>YouTube</a>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${titleClass}`}>
              Join Our Newsletter
            </h4>
            <p className={`text-xs ${mutedTextClass} leading-relaxed`}>
              Subscribe to get seasonal local guides, verified builder rosters, and exclusive boutique hotel offers.
            </p>

            {subscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs font-medium animate-fade-in">
                ✓ Thank you for subscribing to our newsletter!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:ring-2 focus:outline-hidden focus:ring-offset-0 transition-all ${inputBgClass}`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2.5 p-1 text-stone-400 hover:text-amber-500 transition cursor-pointer"
                    aria-label="Submit subscription"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
                {error && (
                  <span className="text-[10px] text-rose-500 font-bold ml-1 animate-pulse">
                    {error}
                  </span>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & Scroll To Top bar */}
        <div className={`border-t ${dividerClass} mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6`}>
          <div className="text-[10px] text-stone-400 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Cotswolds Pages. All rights reserved. Connecting local communities online and offline.</p>
          </div>

          {/* Back to Top button */}
          <button
            onClick={scrollToTop}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition duration-300 cursor-pointer border ${
              isDark
                ? "border-stone-800 hover:bg-stone-900 text-stone-400 hover:text-white"
                : "border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-950"
            }`}
          >
            Back to Top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
