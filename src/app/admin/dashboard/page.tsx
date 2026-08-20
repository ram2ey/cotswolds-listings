"use client";

import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
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
  Lock,
  CreditCard,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  LogOut,
  Search,
  X,
  ShieldCheck,
  LayoutGrid,
  List,
  ExternalLink,
  TrendingUp,
  Clock,
  Eye,
  CheckCheck
} from 'lucide-react';
import type { SubscriptionPlan } from '@/lib/plans';

interface Listing {
  id: string;
  title: string;
  category: string;
  town: string;
  address: string;
  phone?: string;
  website?: string;
  tier?: 'basic' | 'claimed' | 'gold' | 'featured';
  is_approved?: boolean;
  premium_metadata?: {
    package_name?: string;
    has_social_addon?: boolean;
  };
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

export default function AdminDashboard() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'staging' | 'live' | 'pricing'>('staging');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterPromo, setFilterPromo] = useState<boolean>(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // Pricing Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const [planDrafts, setPlanDrafts] = useState<Record<string, { name: string; price_monthly_gbp: number | string; description: string; is_active: boolean }>>({});
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [previewPlanId, setPreviewPlanId] = useState<string>('gold');

  // Quick stats counts
  const [stats, setStats] = useState({ liveCount: 0, pendingCount: 0, promoCount: 0 });

  // Check server-side authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthChecking(true);
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Handle password submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication credentials invalid.');
      }

      setIsAuthenticated(true);
      setPasswordInput('');
      showNotification('Administrator authentication verified. Welcome back.');
    } catch (err: any) {
      setAuthError(err.message || 'Access denied.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setListings([]);
      showNotification('Administrator session terminated.');
    }
  };

  // Reset filters when activeTab changes
  useEffect(() => {
    setFilterTier('all');
    setFilterPromo(false);
    setSearchQuery('');
  }, [activeTab]);

  // Fetch listings from the API based on active tab
  useEffect(() => {
    if (!isAuthenticated || activeTab === 'pricing') return;

    async function fetchListings() {
      try {
        setLoading(true);
        setError(null);
        const endpoint = activeTab === 'live' ? '/api/admin/listings?type=approved' : '/api/admin/listings';
        const res = await fetch(endpoint);
        if (!res.ok) {
          if (res.status === 401) {
            setIsAuthenticated(false);
            throw new Error('Administrative session expired. Please sign in again.');
          }
          throw new Error('Failed to load listings from the server. Please try again.');
        }
        const data: Listing[] = await res.json();
        setListings(data);

        // Update stats
        if (activeTab === 'live') {
          setStats(prev => ({
            ...prev,
            liveCount: data.length,
            promoCount: data.filter(d => d.premium_metadata?.has_social_addon).length
          }));
        } else if (activeTab === 'staging') {
          setStats(prev => ({
            ...prev,
            pendingCount: data.length
          }));
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected connection error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [activeTab, isAuthenticated]);

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await fetch('/api/admin/pricing');
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          throw new Error('Administrative session expired.');
        }
        throw new Error('Failed to load subscription plans');
      }
      const data: SubscriptionPlan[] = await res.json();
      setPlans(data);
      
      const drafts: Record<string, any> = {};
      data.forEach(p => {
        drafts[p.id] = {
          name: p.name,
          price_monthly_gbp: p.price_monthly_gbp,
          description: p.description,
          is_active: p.is_active,
        };
      });
      setPlanDrafts(drafts);
    } catch (err: any) {
      showNotification('Could not load subscription pricing: ' + err.message, true);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pricing' && isAuthenticated) {
      fetchPlans();
    }
  }, [activeTab, isAuthenticated]);

  // Display an auto-fading notification message
  const showNotification = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Save changes to a specific subscription plan
  const handleSavePlan = async (id: string) => {
    const draft = planDrafts[id];
    if (!draft) return;

    if (draft.price_monthly_gbp === '' || isNaN(Number(draft.price_monthly_gbp)) || Number(draft.price_monthly_gbp) < 0) {
      showNotification('Please enter a valid positive price amount in GBP.', true);
      return;
    }

    try {
      setSavingPlanId(id);
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: draft.name,
          price_monthly_gbp: Number(draft.price_monthly_gbp),
          description: draft.description,
          is_active: draft.is_active,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const result = await res.json();
      showNotification(result.message || `Pricing updated successfully!`);
      
      setPlans(prev => prev.map(p => p.id === id ? {
        ...p,
        name: draft.name,
        price_monthly_gbp: Number(draft.price_monthly_gbp),
        description: draft.description,
        is_active: draft.is_active,
      } : p));
    } catch (err: any) {
      showNotification(err.message || 'Error updating pricing plan', true);
    } finally {
      setSavingPlanId(null);
    }
  };

  // Trigger modal for Reset all plans to defaults
  const promptResetAllPlans = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Subscription Pricing to Defaults?',
      message: 'This will restore all 5 subscription plan prices and descriptions to standard Cotswolds directory defaults. Any custom pricing will be overwritten.',
      confirmLabel: 'Yes, Reset All Plans',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setSavingPlanId('all');
          const res = await fetch('/api/admin/pricing', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reset_all: true }),
          });

          if (!res.ok) throw new Error('Failed to reset plans');
          showNotification('All subscription plans have been reset to system defaults.');
          await fetchPlans();
        } catch (err: any) {
          showNotification(err.message || 'Error resetting pricing plans', true);
        } finally {
          setSavingPlanId(null);
        }
      }
    });
  };

  // Change listing tier (PUT)
  const handleTierChange = async (id: string, tier: 'basic' | 'claimed' | 'gold' | 'featured') => {
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
    showNotification(`Crawling website for "${listing.title}" with Apify & Gemini AI...`);

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

      showNotification(`Deep crawl and AI analysis completed for "${listing.title}". Metadata saved!`);
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
      setListings(originalListings);
      showNotification(`Could not approve listing "${listingToApprove.title}". Please try again.`, true);
    } finally {
      setActionInProgress(null);
    }
  };

  // Prompt custom confirmation modal for Reject & Delete (DELETE)
  const promptReject = (id: string) => {
    const listingToReject = listings.find(l => l.id === id);
    if (!listingToReject) return;

    setConfirmModal({
      isOpen: true,
      title: `Delete & Reject "${listingToReject.title}"?`,
      message: `Are you sure you want to permanently purge this listing record? This action cannot be undone.`,
      confirmLabel: 'Yes, Permanently Delete',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal(null);
        const originalListings = [...listings];
        setListings(prev => prev.filter(l => l.id !== id));
        setActionInProgress(id);

        try {
          const res = await fetch(`/api/admin/listings?id=${id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            throw new Error('Server returned an error while rejecting.');
          }

          showNotification(`Listing "${listingToReject.title}" has been permanently purged.`);
        } catch (err: any) {
          setListings(originalListings);
          showNotification(`Could not delete listing "${listingToReject.title}". Please try again.`, true);
        } finally {
          setActionInProgress(null);
        }
      }
    });
  };

  // Loading spinner while verifying initial cookie
  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-stone-400 font-medium tracking-wide">
            Verifying administrative session...
          </p>
        </div>
      </div>
    );
  }

  // Login Screen with Server Authentication
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-2xl animate-scale-in">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-white font-serif">
              Cotswolds Admin Portal
            </h2>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Shielded Administrative Gateway. Enter your administrator passcode to proceed.
            </p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <div className="rounded-md">
              <input
                type="password"
                required
                disabled={loggingIn}
                placeholder="Enter administrator passcode"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="block w-full rounded-xl border border-stone-700 bg-stone-800/80 px-4 py-3.5 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium text-center flex items-center gap-2 justify-center">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loggingIn}
                className="pressable group relative flex w-full justify-center items-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-amber-600 active:bg-amber-700 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating Credentials...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Access Administrative Dashboard
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Custom Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-scale-in">
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${confirmModal.isDestructive ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-stone-950">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="pressable flex-1 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`pressable flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition shadow-xs cursor-pointer ${
                  confirmModal.isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
                    : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                }`}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner / Header */}
      <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-lg font-bold tracking-tight text-stone-950 font-serif">
                Cotswolds Directory Admin
              </h1>
            </div>
            <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-widest rounded-full border border-emerald-200">
              Active Shield
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleLogout}
              className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-600 hover:text-rose-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Tabs & View Mode */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('staging')}
              className={`py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'staging'
                  ? 'border-amber-500 text-stone-950'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Staging Queue
              {stats.pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-black">
                  {stats.pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'live'
                  ? 'border-amber-500 text-stone-950'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Live Directory
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'pricing'
                  ? 'border-amber-500 text-stone-950'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Subscription Pricing
            </button>
          </div>

          {activeTab !== 'pricing' && (
            <div className="flex items-center gap-1.5 py-2.5 sm:py-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mr-1">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs' 
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs' 
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
                title="Dense Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Floating Notification */}
        {notification && (
          <div 
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-xl border transition-all duration-300 transform animate-fade-in-up flex items-start gap-3 ${
              notification.isError 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="mt-0.5">
              {notification.isError ? (
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </div>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">
                {notification.isError ? 'Action Unsuccessful' : 'System Notice'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
            </div>
          </div>
        )}

        {/* PRICING TAB CONTENT */}
        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
              <div>
                <h2 className="text-xs font-extrabold tracking-wider text-amber-700 uppercase">
                  Subscription Plans & Monthly Pricing Controls
                </h2>
                <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                  Adjust live monthly membership fees, edit tier titles, and toggle plan visibility. Changes apply immediately to new Stripe checkout sessions.
                </p>
              </div>

              <button
                onClick={promptResetAllPlans}
                disabled={savingPlanId !== null}
                className="pressable inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
                Reset All to Defaults
              </button>
            </div>

            {loadingPlans ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
                <p className="text-xs text-stone-500 font-medium">Loading subscription plans...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const draft = planDrafts[plan.id] || {
                    name: plan.name,
                    price_monthly_gbp: plan.price_monthly_gbp,
                    description: plan.description,
                    is_active: plan.is_active,
                  };
                  const isSaving = savingPlanId === plan.id;
                  const isGold = plan.id === 'gold' || plan.id === 'gold_social';
                  const isFeatured = plan.id === 'featured' || plan.id === 'featured_social';
                  const isSocial = plan.id.includes('social');

                  return (
                    <div
                      key={plan.id}
                      className={`cotswolds-card bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between ${
                        isFeatured 
                          ? 'border-indigo-200 hover:border-indigo-300' 
                          : isGold 
                          ? 'border-amber-200 hover:border-amber-300' 
                          : 'border-emerald-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header & Badges */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isFeatured
                              ? 'bg-indigo-50 text-indigo-850 border border-indigo-200'
                              : isGold
                              ? 'bg-amber-50 text-amber-850 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-850 border border-emerald-200'
                          }`}>
                            {isSocial ? '🚀 Growth Package' : 'Standard Tier'}
                          </span>

                          <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer font-medium">
                            <input
                              type="checkbox"
                              checked={draft.is_active}
                              onChange={(e) => {
                                setPlanDrafts(prev => ({
                                  ...prev,
                                  [plan.id]: { ...prev[plan.id], is_active: e.target.checked }
                                }));
                              }}
                              className="rounded text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                            />
                            <span>{draft.is_active ? 'Active' : 'Disabled'}</span>
                          </label>
                        </div>

                        {/* Title Input */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                            Plan Title
                          </label>
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) => {
                              setPlanDrafts(prev => ({
                                ...prev,
                                [plan.id]: { ...prev[plan.id], name: e.target.value }
                              }));
                            }}
                            className="w-full text-sm font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                          />
                        </div>

                        {/* Price Input */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                            Monthly Subscription Price (£ GBP)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                              £
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={draft.price_monthly_gbp}
                              onChange={(e) => {
                                setPlanDrafts(prev => ({
                                  ...prev,
                                  [plan.id]: { ...prev[plan.id], price_monthly_gbp: e.target.value }
                                }));
                              }}
                              className="w-full pl-8 pr-16 text-lg font-black text-stone-900 bg-stone-50 border border-stone-200 rounded-xl py-2 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">
                              / month
                            </span>
                          </div>
                        </div>

                        {/* Description Input */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                            Subtitle / Description
                          </label>
                          <textarea
                            rows={2}
                            value={draft.description}
                            onChange={(e) => {
                              setPlanDrafts(prev => ({
                                ...prev,
                                [plan.id]: { ...prev[plan.id], description: e.target.value }
                              }));
                            }}
                            className="w-full text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition"
                          />
                        </div>

                        {/* Included Perks List */}
                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                            Included Perks
                          </span>
                          <ul className="space-y-1 text-xs text-stone-600">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px]">
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>{feature.replace('✓ ', '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Save Action */}
                      <div className="mt-6 pt-4 border-t border-stone-100">
                        <button
                          onClick={() => handleSavePlan(plan.id)}
                          disabled={isSaving}
                          className="pressable w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5 text-amber-400" />
                              Save Plan Pricing
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STAGING / LIVE DIRECTORY CONTENT */}
        {activeTab !== 'pricing' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search listings by business name, town, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filters for live tab */}
              {activeTab === 'live' && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 font-medium">Filter Tier:</span>
                    <select
                      value={filterTier}
                      onChange={(e) => setFilterTier(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-hidden text-stone-800 font-semibold cursor-pointer focus:bg-white"
                    >
                      <option value="all">All Tiers</option>
                      <option value="basic">Basic (Standard)</option>
                      <option value="claimed">Claimed Partner</option>
                      <option value="gold">Gold Partner</option>
                      <option value="featured">Featured Partner</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 cursor-pointer hover:bg-stone-100/60 transition">
                    <input
                      type="checkbox"
                      checked={filterPromo}
                      onChange={(e) => setFilterPromo(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                    />
                    <span>Social Promo Only</span>
                  </label>
                </div>
              )}
            </div>

            {/* Global Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
                <p className="text-xs text-stone-500 font-medium">
                  Loading {activeTab === 'live' ? 'live directory' : 'staging queue'} records...
                </p>
              </div>
            )}

            {/* Global Error State */}
            {error && !loading && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-6 max-w-2xl mx-auto flex gap-4 items-start shadow-xs">
                <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Failed to Retrieve Listings</h3>
                  <p className="text-xs text-rose-700 mt-1">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="pressable mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
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
                <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed">
                  {activeTab === 'live' 
                    ? 'There are no active approved directory listings in the database yet.' 
                    : 'All submitted listings have been reviewed and processed.'}
                </p>
              </div>
            )}

            {/* Listings Display (Grid or Table) */}
            {!loading && !error && listings.length > 0 && (() => {
              const displayedListings = listings.filter((item) => {
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  const matchTitle = item.title?.toLowerCase().includes(q);
                  const matchTown = item.town?.toLowerCase().includes(q);
                  const matchAddress = item.address?.toLowerCase().includes(q);
                  const matchCategory = item.category?.toLowerCase().includes(q);
                  const matchPhone = item.phone?.toLowerCase().includes(q);
                  if (!matchTitle && !matchTown && !matchAddress && !matchCategory && !matchPhone) {
                    return false;
                  }
                }

                if (activeTab === 'live') {
                  if (filterTier !== 'all' && (item.tier || 'basic') !== filterTier) {
                    return false;
                  }
                  if (filterPromo && !item.premium_metadata?.has_social_addon) {
                    return false;
                  }
                }
                return true;
              });

              if (displayedListings.length === 0) {
                return (
                  <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center max-w-md mx-auto shadow-xs">
                    <p className="text-xs text-stone-500 font-semibold">No listings match your search criteria.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterTier('all');
                        setFilterPromo(false);
                      }}
                      className="pressable mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Reset Search & Filters
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase">
                      {activeTab === 'live' ? 'Active Directory Listings' : 'Awaiting Business Verification'} ({displayedListings.length})
                    </h2>
                    {searchQuery && (
                      <span className="text-xs text-stone-500 font-medium">
                        Filtered by &quot;{searchQuery}&quot;
                      </span>
                    )}
                  </div>

                  {/* TABLE VIEW */}
                  {viewMode === 'table' ? (
                    <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-extrabold tracking-wider">
                            <tr>
                              <th className="px-5 py-3.5">Business Name & Category</th>
                              <th className="px-5 py-3.5">Location & Town</th>
                              <th className="px-5 py-3.5">Website / Contact</th>
                              <th className="px-5 py-3.5">Tier Status</th>
                              <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {displayedListings.map((item) => (
                              <tr 
                                key={item.id}
                                className={`hover:bg-stone-50/60 transition ${
                                  actionInProgress === item.id ? 'opacity-40 pointer-events-none' : ''
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <div className="font-bold text-stone-900 text-sm font-serif">{item.title}</div>
                                  <div className="text-[11px] text-amber-800 font-medium mt-0.5">{item.category}</div>
                                </td>
                                <td className="px-5 py-4 text-stone-600">
                                  <div className="font-medium text-stone-900">{item.town || 'Cotswolds'}</div>
                                  <div className="text-[11px] text-stone-400 truncate max-w-xs">{item.address}</div>
                                </td>
                                <td className="px-5 py-4 text-stone-600">
                                  {activeTab === 'live' ? (
                                    <input
                                      type="text"
                                      placeholder="Add website URL..."
                                      defaultValue={item.website || ''}
                                      onBlur={(e) => handleWebsiteUpdate(item.id, e.target.value)}
                                      className="bg-stone-50 hover:bg-stone-100 focus:bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-xs w-48 outline-hidden text-stone-800 transition"
                                    />
                                  ) : (
                                    <span className="text-xs truncate max-w-xs block">{item.website || '—'}</span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  {activeTab === 'live' ? (
                                    <select
                                      value={item.tier || 'basic'}
                                      onChange={(e) => handleTierChange(item.id, e.target.value as any)}
                                      className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold outline-hidden text-stone-800 cursor-pointer"
                                    >
                                      <option value="basic">Basic (Standard)</option>
                                      <option value="claimed">Claimed Partner</option>
                                      <option value="gold">Gold Partner</option>
                                      <option value="featured">Featured Partner</option>
                                    </select>
                                  ) : (
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full border border-stone-200">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  {activeTab === 'staging' ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => promptReject(item.id)}
                                        className="pressable p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        title="Reject & Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleApprove(item.id)}
                                        className="pressable px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                                      >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Approve
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-2">
                                      {(item.tier === 'gold' || item.tier === 'featured') && (
                                        <button
                                          onClick={() => handleDeepScrape(item.id)}
                                          disabled={actionInProgress === item.id || !item.website}
                                          className="pressable px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                                          title="Scrape with Apify + Gemini AI"
                                        >
                                          Deep Scrape
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* GRID VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedListings.map((item) => (
                        <div 
                          key={item.id} 
                          className={`cotswolds-card bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between ${
                            actionInProgress === item.id ? 'opacity-40 pointer-events-none' : ''
                          }`}
                        >
                          {/* Card Body */}
                          <div className="p-6">
                            <div className="flex justify-between items-start gap-2 mb-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-100">
                                <Layers className="h-3 w-3" />
                                {item.category}
                              </span>
                              {activeTab === 'live' && (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  item.tier === 'featured' 
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                                    : item.tier === 'gold' 
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                    : item.tier === 'claimed'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                                }`}>
                                  {item.tier || 'basic'}
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif font-bold text-lg text-stone-950 leading-snug mb-2">
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
                                    className="bg-stone-50 hover:bg-stone-100 focus:bg-white px-2 py-1 rounded-lg border border-stone-200 text-xs w-full outline-hidden text-stone-800 transition"
                                  />
                                ) : (
                                  <span className="truncate">{item.website || 'No website listed'}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="border-t border-stone-100 bg-stone-50/70 px-6 py-4 flex flex-col gap-3">
                            {activeTab === 'staging' ? (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => promptReject(item.id)}
                                  disabled={actionInProgress === item.id}
                                  className="pressable flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-rose-200 hover:border-rose-300 text-rose-700 bg-white hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                                
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  disabled={actionInProgress === item.id}
                                  className="pressable flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Approve
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-stone-800">
                                  <span className="font-semibold text-stone-600">Membership Tier:</span>
                                  <select
                                    value={item.tier || 'basic'}
                                    onChange={(e) => handleTierChange(item.id, e.target.value as any)}
                                    className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs outline-hidden text-stone-800 cursor-pointer font-semibold"
                                  >
                                    <option value="basic">Basic (Standard)</option>
                                    <option value="claimed">Claimed Partner</option>
                                    <option value="gold">Gold Partner</option>
                                    <option value="featured">Featured Partner</option>
                                  </select>
                                </div>

                                {item.premium_metadata?.package_name && (
                                  <div className="flex justify-between items-center text-xs text-stone-850 border-t border-stone-100 pt-2">
                                    <span className="font-semibold text-stone-600">Active Package:</span>
                                    <span className="font-bold text-stone-900 capitalize">
                                      {item.premium_metadata.package_name.replace('_', ' ')}
                                    </span>
                                  </div>
                                )}

                                {item.premium_metadata?.has_social_addon && (
                                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 flex items-center justify-between text-xs mt-1">
                                    <span className="text-indigo-850 font-extrabold flex items-center gap-1.5 text-[11px]">
                                      📢 Social Media Promo Active
                                    </span>
                                    <span className="text-[9px] bg-indigo-200 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                      Pending Post
                                    </span>
                                  </div>
                                )}
                                
                                {(item.tier === 'gold' || item.tier === 'featured') && (
                                  <button
                                    onClick={() => handleDeepScrape(item.id)}
                                    disabled={actionInProgress === item.id || !item.website}
                                    className={`pressable w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                                      actionInProgress === item.id 
                                        ? 'bg-stone-100 text-stone-400 border border-stone-200' 
                                        : !item.website 
                                        ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed' 
                                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                                    }`}
                                  >
                                    {actionInProgress === item.id ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Scraping Web Metadata...
                                      </>
                                    ) : (
                                      <>
                                        <Layers className="h-3.5 w-3.5" />
                                        Deep Scrape Web Info
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
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
