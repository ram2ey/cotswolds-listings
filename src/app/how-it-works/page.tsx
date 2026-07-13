import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { Search, CheckCircle2, Heart, TrendingUp, Sparkles, MapPin, Layers, ArrowRight } from "lucide-react";

export const metadata = {
  title: "How It Works | Cotswolds Pages",
  description: "Learn how Cotswolds Pages connects local residents with trusted businesses and helps local enterprises grow their digital reach.",
};

export default function HowItWorks() {
  const residentSteps = [
    {
      title: "Hyper-Local Search",
      description: "Easily find services across Cirencester, Chipping Norton, Bourton-on-the-Water, and surrounding villages.",
      icon: Search,
    },
    {
      title: "Verified Listings",
      description: "Connect with reputable, trusted local experts. We list vetted professionals right on your doorstep.",
      icon: CheckCircle2,
    },
    {
      title: "Support Community",
      description: "Help independent businesses thrive by shopping locally. Build a stronger local economy together.",
      icon: Heart,
    },
  ];

  const businessSteps = [
    {
      title: "Enhanced Visibility",
      description: "Improve your local SEO rankings and online presence to stand out where local customers look first.",
      icon: TrendingUp,
    },
    {
      title: "Simple Setup",
      description: "Create and manage your professional listing profile in just a few clicks. Fast, intuitive, and hassle-free.",
      icon: Sparkles,
    },
    {
      title: "Targeted Growth",
      description: "Reach the exact towns, villages, and customers you serve in the Cotswolds region.",
      icon: MapPin,
    },
    {
      title: "Flexible Options",
      description: "Choose free listings for basic presence or upgrade to premium gold plans for maximum exposure.",
      icon: Layers,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-stone-950 text-white py-20 px-4 overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950/40 via-stone-950 to-stone-950 z-0" />
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block mb-2">Our Directory</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-white leading-tight">
              How This Site Works
            </h1>
            <p className="mt-6 text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
              Welcome to Cotswolds Pages, the definitive local directory connecting residents with exceptional businesses across the Cotswolds. Whether you run a local enterprise or are searching for trusted services in your neighborhood, our platform is designed to bring the community closer together.
            </p>
          </div>
        </section>

        {/* Core Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-16">
          
          {/* For Residents Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="max-w-2xl mb-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">For Residents</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
                Discover Trusted Local Services
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-3 leading-relaxed">
                Finding reliable businesses in the Cotswolds is now completely effortless. From expert tradespeople to unique boutiques and cozy cafés, we list vetted professionals right on your doorstep.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {residentSteps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col items-start text-left">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl mb-6 shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-stone-950 mb-2">{step.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-stone-200" />

          {/* For Businesses Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="max-w-2xl mb-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">For Businesses</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
                Expand Your Local Reach
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-3 leading-relaxed">
                Grow your digital footprint and attract more customers within your direct community. Cotswolds Pages offers a streamlined, hassle-free platform to showcase your services to motivated local buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {businessSteps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col items-start text-left">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl mb-6 shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-stone-950 mb-2">{step.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Call to Action Bar */}
          <section className="bg-stone-950 rounded-3xl text-white p-8 md:p-12 relative overflow-hidden border border-amber-500/10 shadow-lg text-center md:text-left mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-stone-900 z-0" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="text-xl sm:text-2xl font-serif font-black mb-3">List Your Business or Explore Our Directory</h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-normal">
                  Connect with customers in your area and help the local community thrive. Create your listings or search verified services today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
                <Link 
                  href="/search" 
                  className="px-6 py-3 bg-stone-900 border border-stone-700 hover:bg-stone-850 rounded-xl font-bold text-xs text-stone-200 transition text-center flex items-center justify-center gap-1.5"
                >
                  Explore Network
                </Link>
                <Link 
                  href="/listings/submit" 
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md transition text-center flex items-center justify-center gap-1.5"
                >
                  Add Your Listing <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer theme="light" />
    </div>
  );
}
