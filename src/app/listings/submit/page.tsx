"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from "../../components/Navbar";
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  MessageSquare, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  "Construction & Home Maintenance",
  "Health & Beauty",
  "Professional Services",
  "Car & Automotive",
  "Hotels & Motels",
  "Restaurants & Cafés"
];

// Helper function to resize uploaded image cover on the client side
const resizeImage = (file: File, maxWidth: number): Promise<{ base64: string; type: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          base64: dataUrl,
          type: 'image/jpeg'
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function SubmitListing() {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [town, setTown] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Image states
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postcodeSuccess, setPostcodeSuccess] = useState<string | null>(null);
  
  // Subscription plans state
  const [selectedTier, setSelectedTier] = useState<'basic' | 'claim' | 'gold' | 'gold_social' | 'featured' | 'featured_social'>('basic');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Convert and resize uploaded image on client side
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image (JPEG/PNG/WebP).');
      return;
    }

    setError(null);
    setImageName(file.name);

    try {
      setSubmitting(true);
      const result = await resizeImage(file, 1200);
      setImageBase64(result.base64);
      setImageType(result.type);
    } catch (err) {
      console.warn("Client-side image resizing failed, using reader fallback: ", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImageType(file.type);
      };
      reader.readAsDataURL(file);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWebsiteBlur = () => {
    if (website.trim() && !/^https?:\/\//i.test(website)) {
      setWebsite(`https://${website.trim()}`);
    }
  };

  const handlePostcodeBlur = async () => {
    const pc = postcode.trim();
    if (!pc) {
      setPostcodeSuccess(null);
      return;
    }
    if (!validatePostcode(pc)) {
      setPostcodeSuccess(null);
      return;
    }

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 200 && data.result) {
          setLatitude(data.result.latitude.toString());
          setLongitude(data.result.longitude.toString());
          const detectedTown = data.result.admin_district || data.result.parish || 'Cotswolds';
          setPostcodeSuccess(`Verified location: ${detectedTown} (Coordinates mapped)`);
          if (!town) {
            setTown(detectedTown);
          }
          setError(null);
        }
      }
    } catch (err) {
      console.warn("Postcode geocoding lookup failed:", err);
    }
  };

  // Postcode and phone regex validations
  const validatePostcode = (pc: string) => {
    const regex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$/i;
    return regex.test(pc.trim());
  };

  const validatePhone = (ph: string) => {
    const clean = ph.replace(/[^\d+]/g, '');
    return clean.length >= 7;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !town.trim()) {
      setError('Please provide a Business Name and Town/Village.');
      return;
    }

    if (postcode && !validatePostcode(postcode)) {
      setError('Invalid UK postcode format. Please enter a valid postcode (e.g. GL54 1BN).');
      return;
    }

    if (phone && !validatePhone(phone)) {
      setError('Invalid phone number. Please enter a valid telephone number.');
      return;
    }

    if (selectedTier !== 'basic' && (!website.trim() || !/^https?:\/\//i.test(website))) {
      setError('A valid website URL starting with http:// or https:// is required for premium plans so we can enrich your profile.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title,
        description,
        category,
        phone: phone || null,
        website: website || null,
        email: email || null,
        whatsapp: null,
        address,
        postcode,
        town,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        imageBase64,
        imageType
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Our servers encountered an issue storing your submission.');
      }

      const result = await res.json();

      if (selectedTier === 'basic') {
        setSubmitted(true);
      } else {
        setSubmitting(false);
        setCheckoutLoading(true);
        
        const checkoutRes = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            listingId: result.id,
            tier: selectedTier,
            website: website
          })
        });

        if (!checkoutRes.ok) {
          const errorData = await checkoutRes.json();
          throw new Error(errorData.error || 'Failed to initialize premium checkout session.');
        }

        const session = await checkoutRes.json();
        if (session.url) {
          window.location.href = session.url;
        } else {
          throw new Error('No redirect URL returned from payment server.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'We could not save your submission. Please verify your details, check your network, and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans pb-20 selection:bg-amber-100 selection:text-amber-900">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-100 py-12 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Link 
              href="/" 
              className="pressable inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
              Add Your Cotswolds Business
            </h1>
            <p className="text-stone-400 text-xs mt-1">
              Join the official curated business network of the Cotswolds.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-800/80 border border-stone-700 px-4 py-2 rounded-2xl">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-stone-300">Reviewed by Local Curators</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {submitted ? (
          /* Success Screen */
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-lg animate-scale-in max-w-xl mx-auto">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Submission Received</h2>
            <p className="text-stone-600 text-xs mt-3 max-w-md mx-auto leading-relaxed">
              Thank you! Your business registration details have been submitted into our staging verification queue. 
              Our curators will review the details. Once approved, your listing will go live automatically.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/"
                className="pressable px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                Return to Directory
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setDescription('');
                  setPhone('');
                  setWebsite('');
                  setEmail('');
                  setAddress('');
                  setPostcode('');
                  setTown('');
                  setLatitude('');
                  setLongitude('');
                  setImageBase64(null);
                  setImageName('');
                  setPostcodeSuccess(null);
                }}
                className="pressable px-6 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-xs transition"
              >
                Submit Another Business
              </button>
            </div>
          </div>
        ) : (
          /* Split Form & Live Preview Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Submission Form */}
            <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="border-b border-stone-100 pb-4 mb-6">
                <h2 className="font-serif text-xl font-bold text-stone-950">Business Details Form</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Fill in your official business information below. Preview updates in real time.
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 mb-6 flex gap-3 items-center text-xs animate-fade-in">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Block 1: Basic Info */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                    1. Core Information
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Business Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. The Cotswolds Bakery & Tearoom"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Category <span className="text-rose-500">*</span></label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer bg-white transition"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your history, hospitality, specialties, or services..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Block 2: Location */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                    2. Location & Address
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Town / Village <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stow-on-the-Wold"
                        value={town}
                        onChange={(e) => setTown(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">UK Postcode</label>
                      <input
                        type="text"
                        placeholder="e.g. GL54 1BN"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        onBlur={handlePostcodeBlur}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase transition"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Street Address</label>
                      <input
                        type="text"
                        placeholder="e.g. The Square, High Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  {postcodeSuccess && (
                    <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{postcodeSuccess}</span>
                    </div>
                  )}
                </div>

                {/* Block 3: Contact */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                    3. Contact Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-stone-400" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +44 1451 820000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-stone-400" /> Official Website
                      </label>
                      <input
                        type="url"
                        placeholder="e.g. https://yoursite.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        onBlur={handleWebsiteBlur}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-stone-400" /> Public Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. info@yoursite.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Block 4: Cover Image Asset */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                    4. Cover Image Asset
                  </h3>
                  
                  {imageBase64 ? (
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4 animate-scale-in">
                      <div className="flex items-center gap-3">
                        <img 
                          src={imageBase64} 
                          alt="Cover preview" 
                          className="h-14 w-14 object-cover rounded-xl border border-stone-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-stone-900 truncate max-w-xs">{imageName || 'Cover image uploaded'}</p>
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ Resized & optimized for web</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageBase64(null);
                          setImageName('');
                          setImageType('');
                        }}
                        className="pressable p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-2xl p-6 text-center hover:bg-stone-50/50 transition relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="cover-image-upload"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-stone-100 rounded-full text-stone-400">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-stone-700">Click to Upload Cover Image</span>
                        <span className="text-[10px] text-stone-400">JPEG, PNG, or WebP (max 4MB)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Block 5: Tier Selection */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                    5. Membership Tier & Placement
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div 
                      onClick={() => setSelectedTier('basic')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        selectedTier === 'basic' 
                          ? 'border-stone-800 bg-stone-100' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">Free Listing</span>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">Standard directory inclusion.</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-200/60 font-black text-xs text-stone-900">
                        £0 <span className="text-[9px] font-normal text-stone-400">/mo</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSelectedTier('gold')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        selectedTier === 'gold' 
                          ? 'border-amber-500 bg-amber-500/5 shadow-xs' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-amber-900 block">Gold Partner</span>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">Verified badge & AI highlights.</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-200/60 font-black text-xs text-amber-900">
                        £50 <span className="text-[9px] font-normal text-stone-400">/mo</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSelectedTier('featured')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        selectedTier === 'featured' 
                          ? 'border-indigo-600 bg-indigo-500/5 shadow-xs' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-indigo-950 block">Featured Partner</span>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">Top search & VIP spotlight.</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-200/60 font-black text-xs text-indigo-950">
                        £100 <span className="text-[9px] font-normal text-stone-400">/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="border-t border-stone-100 pt-6 flex gap-3">
                  <Link
                    href="/"
                    className="pressable flex-1 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-xs transition text-center"
                  >
                    Cancel
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={submitting || checkoutLoading}
                    className="pressable flex-1 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                        Submitting...
                      </>
                    ) : checkoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                        Redirecting to checkout...
                      </>
                    ) : selectedTier === 'basic' ? (
                      <>
                        <Store className="h-4 w-4" />
                        Submit for Verification
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        Proceed to Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Live Interactive Directory Card Preview */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-amber-600" />
                  Live Directory Card Preview
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-stone-200/70 text-stone-600 rounded-full">
                  Real-time
                </span>
              </div>

              {/* Rendered Preview Card */}
              <div className="cotswolds-card bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-md">
                <div className="h-44 bg-stone-200 relative overflow-hidden">
                  {imageBase64 ? (
                    <img 
                      src={imageBase64} 
                      alt="Business Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-stone-400 p-6 text-center">
                      <Store className="h-8 w-8 text-amber-500 mb-2 opacity-80" />
                      <span className="text-xs font-bold text-stone-300">Cover photo will appear here</span>
                      <span className="text-[10px] text-stone-500 mt-0.5">Upload an image in section 4</span>
                    </div>
                  )}

                  {/* Tier Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-md ${
                      selectedTier.includes('featured')
                        ? 'bg-indigo-600 text-white'
                        : selectedTier.includes('gold')
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-900/80 text-white backdrop-blur-xs'
                    }`}>
                      {selectedTier.includes('featured') ? '👑 Featured' : selectedTier.includes('gold') ? '⭐ Gold' : 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                      <Layers className="h-2.5 w-2.5" />
                      {category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-stone-950 leading-snug">
                    {title || 'Your Business Name'}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {description || 'Your business description and specialties will be showcased here for residents and tourists.'}
                  </p>

                  <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{address ? `${address}, ` : ''}{town || 'Cotswolds Town'}</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        <span className="truncate text-amber-700 font-semibold">{website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
