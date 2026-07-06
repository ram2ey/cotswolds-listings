"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Trash2, 
  MapPin, 
  Layers, 
  Phone, 
  Globe, 
  Loader2, 
  AlertTriangle,
  Inbox,
  Lock
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  category: string;
  town: string;
  address: string;
  phone?: string;
  website?: string;
  tier?: 'basic' | 'silver' | 'gold';
  is_approved?: boolean;
}

export default function AdminDashboard() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'staging' | 'live'>('staging');

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Check saved authentication state
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cotswoldsadmin';
    if (savedAuth === 'true' || !expectedPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle password submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cotswoldsadmin';
    if (passwordInput === expectedPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect authentication credentials. Access denied.');
    }
  };

  // Fetch listings from the API based on active tab
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError(null);
        const endpoint = activeTab === 'live' ? '/api/admin/listings?type=approved' : '/api/admin/listings';
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error('Failed to load listings from the server. Please try again.');
        }
        const data = await res.json();
        setListings(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected connection error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [activeTab]);

  // Display a auto-fading notification message
  const showNotification = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Change listing tier (PUT)
  const handleTierChange = async (id: string, tier: 'basic' | 'silver' | 'gold') => {
    try {
      setListings(prev => prev.map(l => l.id === id ? { ...l, tier } : l));
      
      const res = await fetch('/api/admin/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tier })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update tier.");
      }
      showNotification(`Membership tier updated to ${tier.toUpperCase()} successfully.`);
    } catch (err: any) {
      showNotification("Could not update listing tier. Please try again.", true);
    }
  };

  // Update website URL (PUT)
  const handleWebsiteUpdate = async (id: string, website: string) => {
    try {
      setListings(prev => prev.map(l => l.id === id ? { ...l, website } : l));
      
      const res = await fetch('/api/admin/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, website })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update website.");
      }
      showNotification("Website URL updated successfully.");
    } catch (err: any) {
      showNotification("Could not update website URL. Please try again.", true);
    }
  };

  // Trigger Deep Website Scrape (POST)
  const handleDeepScrape = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    if (!listing.website) {
      showNotification("Please provide a valid website URL before deep scraping.", true);
      return;
    }

    setActionInProgress(id);
    showNotification(`Starting deep web scrape for "${listing.title}". This may take a minute...`);

    try {
      const res = await fetch('/api/admin/scrape-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server error occurred during deep scrape.');
      }

      showNotification(`Deep scrape and AI analysis completed for "${listing.title}". Premium sections populated!`);
    } catch (err: any) {
      showNotification(`Deep scrape failed: ${err.message}`, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Approve Listing Action (POST)
  const handleApprove = async (id: string) => {
    const originalListings = [...listings];
    const listingToApprove = listings.find(l => l.id === id);
    if (!listingToApprove) return;

    // Optimistic UI update: Immediately remove from view for smooth feel
    setListings(prev => prev.filter(l => l.id !== id));
    setActionInProgress(id);

    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error while approving.');
      }

      showNotification(`Listing "${listingToApprove.title}" has been successfully approved and is now live.`);
    } catch (err: any) {
      // Revert optimistic update on failure
      setListings(originalListings);
      showNotification(`Could not approve listing "${listingToApprove.title}". Please check your connection and try again.`, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Reject and Delete Action (DELETE)
  const handleReject = async (id: string) => {
    const originalListings = [...listings];
    const listingToReject = listings.find(l => l.id === id);
    if (!listingToReject) return;

    // Direct confirmation check - keeping it friendly for non-technical staff
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete and reject "${listingToReject.title}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    // Optimistic UI update: Immediately remove from view
    setListings(prev => prev.filter(l => l.id !== id));
    setActionInProgress(id);

    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Server returned an error while rejecting.');
      }

      showNotification(`Listing "${listingToReject.title}" has been rejected and permanently removed.`);
    } catch (err: any) {
      // Revert optimistic update on failure
      setListings(originalListings);
      showNotification(`Could not reject/delete listing "${listingToReject.title}". Please try again.`, true);
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-white font-serif">
              Admin Portal Validation
            </h2>
            <p className="mt-2 text-xs text-stone-400">
              Please enter the administrator passcode to access the staging database queue.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-xs">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter administrator passcode"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="relative block w-full rounded-xl border border-stone-700 bg-stone-850 px-4 py-3 text-sm text-white placeholder-stone-500 focus:z-10 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-semibold text-center flex items-center gap-1 justify-center">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                {authError}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-stone-950 hover:bg-amber-600 active:bg-amber-700 shadow-lg transition cursor-pointer"
              >
                Access Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Top Banner / Navbar */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
              <h1 className="text-xl font-bold tracking-tight text-stone-950 font-serif">
                Cotswolds Directory Admin
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Staging Queue & Directory Manager — Shielded Administrative Environment
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="px-3 py-1 bg-stone-100 rounded-full font-medium text-stone-600">
              Active View: {activeTab === 'live' ? 'Live Directory' : 'Staging Queue'}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs Selector */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('staging')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition cursor-pointer ${
                activeTab === 'staging'
                  ? 'border-amber-500 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              Staging Queue (Pending)
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition cursor-pointer ${
                activeTab === 'live'
                  ? 'border-amber-500 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              Live Directory (Approved)
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Floating Notification */}
        {notification && (
          <div 
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 flex items-start gap-3 ${
              notification.isError 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="mt-0.5">
              {notification.isError ? (
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {notification.isError ? 'Action Unsuccessful' : 'Action Completed'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Global Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
            <p className="text-sm text-stone-500 font-medium">
              Loading {activeTab === 'live' ? 'live' : 'staging queue'} listings...
            </p>
          </div>
        )}

        {/* Global Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-6 max-w-2xl mx-auto flex gap-4 items-start shadow-xs">
            <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Failed to Retrieve Listings</h3>
              <p className="text-sm text-rose-700 mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Reload Panel
              </button>
            </div>
          </div>
        )}

        {/* Empty Queue State */}
        {!loading && !error && listings.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 max-w-xl mx-auto text-center flex flex-col items-center shadow-xs">
            <div className="h-16 w-16 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100 mb-4">
              <Inbox className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-stone-900">
              {activeTab === 'live' ? 'No Live Listings Found' : 'Queue is Clear'}
            </h3>
            <p className="text-sm text-stone-500 mt-2 max-w-xs">
              {activeTab === 'live' 
                ? 'There are no active approved directory listings in the database yet.' 
                : 'Excellent! There are no new listings awaiting verification at this time.'}
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && listings.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-sm font-semibold tracking-wider text-stone-400 uppercase">
                {activeTab === 'live' ? 'Active Directory Listings' : 'Awaiting Business Verification'} ({listings.length})
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {activeTab === 'live'
                  ? 'Manage membership levels (Basic, Silver, Gold), add websites, and trigger deep crawls for claimed listings.'
                  : 'Please verify details carefully. Approvals are pushed live immediately. Rejections permanently purge records.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                    actionInProgress === item.id ? 'opacity-50 pointer-events-none scale-95' : 'scale-100'
                  }`}
                >
                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                        <Layers className="h-3.5 w-3.5" />
                        {item.category}
                      </span>
                      {activeTab === 'live' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          item.tier === 'gold' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : item.tier === 'silver' 
                            ? 'bg-stone-200 text-stone-850 border border-stone-300' 
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          {item.tier || 'basic'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-stone-950 leading-tight mb-2">
                      {item.title}
                    </h3>

                    <div className="space-y-2 mt-4 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </div>
                      
                      {item.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-stone-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-stone-400 shrink-0" />
                        {activeTab === 'live' ? (
                          <input
                            type="text"
                            placeholder="Add website URL..."
                            defaultValue={item.website || ''}
                            onBlur={(e) => handleWebsiteUpdate(item.id, e.target.value)}
                            className="bg-stone-50 hover:bg-stone-100 focus:bg-white px-2 py-1 rounded border border-stone-200 text-xs w-full outline-hidden text-stone-800"
                          />
                        ) : (
                          <span className="truncate">{item.website || 'No website listed'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-stone-100 bg-stone-50 px-6 py-4 flex flex-col gap-3">
                    {activeTab === 'staging' ? (
                      <div className="flex gap-4">
                        {/* Reject Button (Red) */}
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={actionInProgress === item.id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-rose-200 hover:border-rose-300 text-rose-700 bg-white hover:bg-rose-50 active:bg-rose-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                          title="Reject and permanently delete listing record"
                        >
                          <Trash2 className="h-4 w-4" />
                          Reject & Delete
                        </button>
                        
                        {/* Approve Button (Green) */}
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={actionInProgress === item.id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition hover:shadow-md cursor-pointer"
                          title="Approve and publish listing to live directory"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve Listing
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-stone-800">
                          <span className="font-semibold text-stone-600">Membership Tier:</span>
                          <select
                            value={item.tier || 'basic'}
                            onChange={(e) => handleTierChange(item.id, e.target.value as any)}
                            className="bg-white border border-stone-200 rounded-md px-2 py-1 text-xs outline-hidden text-stone-800 cursor-pointer"
                          >
                            <option value="basic">Basic (Standard)</option>
                            <option value="silver">Silver (Premium)</option>
                            <option value="gold">Gold (Elite)</option>
                          </select>
                        </div>
                        
                        {(item.tier === 'gold' || item.tier === 'silver') && (
                          <button
                            onClick={() => handleDeepScrape(item.id)}
                            disabled={actionInProgress === item.id || !item.website}
                            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                              actionInProgress === item.id 
                                ? 'bg-stone-100 text-stone-400 border border-stone-200' 
                                : !item.website 
                                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed' 
                                : 'bg-amber-500 hover:bg-amber-600 text-stone-950 hover:shadow-md'
                            }`}
                            title={item.website ? "Scrape website content and generate premium AI metadata" : "Add website URL before scraping"}
                          >
                            {actionInProgress === item.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Scraping & Formatting...
                              </>
                            ) : (
                              <>
                                <Layers className="h-3.5 w-3.5" />
                                Deep Scrape Web info
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
