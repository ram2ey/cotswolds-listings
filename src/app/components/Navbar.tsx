"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PlusCircle, ChevronDown, Share2, Video, Laptop, Search, Palette, Camera } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const pathname = usePathname();

  const services = [
    { name: "Social Media Services", href: "/services/social-media", desc: "Professional social platforms management", icon: Share2 },
    { name: "Digital Media Management", href: "/services/digital-media", desc: "Dynamic content & bespoke storytelling", icon: Video },
    { name: "Website Development", href: "/services/website-development", desc: "High-converting web design & curation", icon: Laptop },
    { name: "Search Engine Optimization", href: "/services/seo", desc: "Dominate Google & local SEO visibility", icon: Search },
    { name: "Graphic Design", href: "/services/graphic-design", desc: "Result-driven branding & visual assets", icon: Palette },
    { name: "Photography & Video", href: "/services/photography-video", desc: "High-impact storytelling & visual media", icon: Camera },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.jpg"
              alt="Cotswolds Pages"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className={`text-xs font-bold transition-colors duration-200 hover:text-stone-950 ${
                pathname === "/search" ? "text-amber-600" : "text-stone-600"
              }`}
            >
              Find Local Business
            </Link>

            {/* Dropdown Link for Services */}
            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`flex items-center gap-1 text-xs font-bold transition-colors duration-200 hover:text-stone-950 cursor-pointer ${
                  pathname.startsWith("/services") ? "text-amber-600" : "text-stone-600"
                }`}
              >
                Our Services
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl py-3 px-2 z-50 grid grid-cols-1 gap-1">
                  {services.map((service) => {
                    const Icon = service.icon;
                    const isServiceActive = pathname === service.href;
                    return (
                      <Link
                        key={service.name}
                        href={service.href}
                        onClick={() => setIsServicesOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition duration-200 ${
                          isServiceActive
                            ? "bg-amber-50 text-amber-705"
                            : "hover:bg-stone-50 text-stone-700 hover:text-stone-950"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isServiceActive ? "bg-amber-500/20 text-amber-750" : "bg-stone-100 text-stone-500"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-[11px] font-bold leading-tight">{service.name}</h4>
                          <p className="text-[9px] text-stone-400 mt-0.5 font-normal leading-tight">{service.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/how-it-works"
              className={`text-xs font-bold transition-colors duration-200 hover:text-stone-950 ${
                pathname === "/how-it-works" ? "text-amber-600" : "text-stone-600"
              }`}
            >
              How It Works
            </Link>

            <Link
              href="/contact"
              className={`text-xs font-bold transition-colors duration-200 hover:text-stone-950 ${
                pathname === "/contact" ? "text-amber-600" : "text-stone-600"
              }`}
            >
              Contact Us
            </Link>

            <Link
              href="/listings/submit"
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl shadow-md hover:shadow-lg transition text-xs font-bold"
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
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-xl text-sm font-bold transition ${
                pathname === "/search" ? "bg-amber-50 text-amber-600" : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              }`}
            >
              Find Local Business
            </Link>

            {/* Mobile Dropdown Trigger */}
            <div>
              <button
                type="button"
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className={`flex w-full items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition ${
                  pathname.startsWith("/services") ? "bg-amber-50 text-amber-600" : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                }`}
              >
                Our Services
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mobile Services Sub-list */}
              {isMobileServicesOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-stone-50/50 rounded-xl mt-1 text-left">
                  {services.map((service) => {
                    const isServiceActive = pathname === service.href;
                    return (
                      <Link
                        key={service.name}
                        href={service.href}
                        onClick={() => {
                          setIsOpen(false);
                          setIsMobileServicesOpen(false);
                        }}
                        className={`block px-3 py-2 rounded-lg text-xs font-bold transition ${
                          isServiceActive
                            ? "text-amber-600 font-extrabold"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        {service.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/how-it-works"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-xl text-sm font-bold transition ${
                pathname === "/how-it-works" ? "bg-amber-50 text-amber-600" : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              }`}
            >
              How It Works
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-xl text-sm font-bold transition ${
                pathname === "/contact" ? "bg-amber-50 text-amber-600" : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              }`}
            >
              Contact Us
            </Link>

            <div className="pt-2 px-3">
              <Link
                href="/listings/submit"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl shadow-md font-bold text-sm transition"
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
