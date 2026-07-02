"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  Loader2
} from 'lucide-react';

const COUNTIES = [
  "Gloucestershire",
  "Oxfordshire",
  "Warwickshire",
  "Wiltshire",
  "Worcestershire"
];

const CATEGORIES = [
  "Hotel & Accommodation",
  "Pub & Restaurant",
  "Gastropub & Inn",
  "Café & Bakery",
  "Boutique Shop",
  "Attraction & Tour",
  "Local Business"
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
        // Export resized image with 85% compression quality
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
  const [county, setCounty] = useState(COUNTIES[0]);
  const [subRegion, setSubRegion] = useState('');
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

  // Convert and resize uploaded image on client side (max 1200px width)
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
    
    if (!title.trim() || !subRegion.trim()) {
      setError('Please provide a Business Name and Sub-Region/Village.');
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
        county,
        sub_region: subRegion,
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

      setSubmitted(true);
    } catch (err: any) {
      // Error masking: Shield database details and show clean error description
      setError('We could not save your submission. Please verify your details, check your network, and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-16">
      
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Submit Listing</span>
            <h1 className="font-serif text-base font-bold text-stone-950">Add Your Business</h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        
        {submitted ? (
          /* Success Screen */
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-md animate-fade-in">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Submission Received</h2>
            <p className="text-stone-500 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Thank you! Your business registration details have been submitted directly into our staging verification queue. 
              Our administrative validation team will review the details. Once approved, your listing will go live automatically.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 active:bg-stone-900 text-white font-semibold rounded-xl text-xs transition"
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
                  setSubRegion('');
                  setLatitude('');
                  setLongitude('');
                  setImageBase64(null);
                  setImageName('');
                }}
                className="px-6 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-xs transition"
              >
                Submit Another Business
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs">
            
            <div className="border-b border-stone-100 pb-5 mb-6">
              <h2 className="font-serif text-xl font-bold text-stone-950">Local Business Registration</h2>
              <p className="text-xs text-stone-500 mt-1">
                Your listing will enter a staging validation queue where details are reviewed before appearing publicly.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 mb-6 flex gap-3 items-center text-xs">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Block 1: Basic Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                  1. Core Business Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Business Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Cotswolds Bakery"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Category <span className="text-rose-500">*</span></label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer bg-white"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700">Cotswolds County <span className="text-rose-500">*</span></label>
                      <select
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer bg-white"
                      >
                        {COUNTIES.map(cnt => (
                          <option key={cnt} value={cnt}>{cnt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe your business, history, services, and specialties..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Block 2: Location */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                  2. Geolocation & Address
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Village / Sub-Region <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bourton-on-the-Water"
                      value={subRegion}
                      onChange={(e) => setSubRegion(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Postcode</label>
                    <input
                      type="text"
                      placeholder="e.g. GL54 2EN"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-xs font-bold text-stone-700">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. High Street, Bourton-on-the-Water"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Latitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 51.8862"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Longitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -1.7588"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 mt-2">
                  Providing latitude and longitude enables users to search for your business by proximity distance.
                </p>
              </div>

              {/* Block 3: Contacts */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                  3. Contact Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-stone-450" /> Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +44 1451 820000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-stone-450" /> Website
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://yoursite.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-stone-450" /> Public Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. info@yoursite.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  </div>
              </div>

              {/* Block 4: Image Asset */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4">
                  4. Business Cover Image
                </h3>
                
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:bg-stone-50 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-image-upload"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-stone-100 rounded-full text-stone-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    {imageName ? (
                      <span className="text-xs font-semibold text-amber-600 truncate max-w-[300px]">
                        Selected: {imageName}
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-stone-700">Click to Upload Cover Image</span>
                        <span className="text-[10px] text-stone-400">Supports JPEG, PNG, or WebP (max 2MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-stone-100 pt-6 flex gap-4">
                <Link
                  href="/"
                  className="flex-1 py-3 border border-stone-250 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-xs transition text-center shadow-xs cursor-pointer"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-900 text-white font-semibold rounded-xl text-xs transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                      Submitting Listing...
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4" />
                      Register Business
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
}
