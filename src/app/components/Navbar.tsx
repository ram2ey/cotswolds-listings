"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PlusCircle } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Find Local Business", href: "/search" },
    { name: "How It Works", href: "/#how-it-works" },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <svg className="w-5.5 h-4.5 text-amber-500 shrink-0" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14.5c-3-2.5-7-2.5-10-1.5V1.5c3-1 7-1 10 1.5M12 14.5c3-2.5 7-2.5 10-1.5V1.5c-3-1-7-1-10 1.5M12 3v11.5" />
            </svg>
            <span className="font-serif text-lg font-black tracking-tight text-amber-500">
              Cotswolds<span className="text-stone-950 font-sans font-light ml-1">Pages</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold transition-colors duration-200 hover:text-stone-950 ${
                    isActive ? "text-amber-600" : "text-stone-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/listings/submit"
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl shadow-md hover:shadow-lg transition text-xs font-bold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Your Listing
            </Link>
          </div>

          {/* Hamburger Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white" id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? "bg-amber-55 text-amber-600"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 px-3">
              <Link
                href="/listings/submit"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl shadow-md font-bold text-sm transition"
              >
                <PlusCircle className="h-4 w-4" />
                Add Your Listing
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
