import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { MessageSquare, Clock, BookOpen, Users, Activity, ArrowRight, Share2 } from "lucide-react";

export const metadata = {
  title: "Social Media Services | Cotswolds Pages",
  description: "Maximize your impact with professional social media management. Save time and tell your story with Cotswolds Pages.",
};

export default function SocialMediaServices() {
  const benefits = [
    {
      title: "Save Valuable Time",
      description: "We handle the scheduling, curation, and strategy for you so you can focus entirely on running your business.",
      icon: Clock,
    },
    {
      title: "Tell Your Story",
      description: "We highlight exactly what makes your services special, creating authentic connections with your target audience.",
      icon: BookOpen,
    },
    {
      title: "Engage Your Audience",
      description: "Turn local casual scrollers into loyal customers with highly engaging, platform-specific content.",
      icon: Users,
    },
    {
      title: "Consistent Presence",
      description: "Keep your brand visible and top-of-mind every single day with structured content calendars.",
      icon: Activity,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-stone-100 py-3 border-b border-stone-250/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <Link href="/" className="hover:text-stone-900 transition">Home</Link>
              <span>/</span>
              <span className="text-stone-400">Services</span>
              <span>/</span>
              <span className="text-amber-600">Social Media</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-stone-950 text-white py-20 px-4 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-955/40 via-stone-955 to-stone-955 z-0" />
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block mb-2">Service 01</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-white leading-tight">
              Maximize Your Impact: Professional Social Media Management
            </h1>
          </div>
        </section>

        {/* Introduction */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="p-8 md:p-12 bg-white rounded-3xl border border-stone-205/60 shadow-xs">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-full">
                <Share2 className="h-8 w-8" />
              </div>
            </div>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
              Your customers are already on social media scrolling, engaging, and buying. If your business isn't actively communicating on platforms like Facebook, Instagram, X (Twitter), and Pinterest, you are missing out on valuable leads.
            </p>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mt-4 max-w-3xl mx-auto">
              Great social media marketing does more than post updates. It tells your unique story, builds trust, and drives real business success. With Cotswolds Pages, you will have access to an army of Social Media content creators for less than the price that it would take you to hire a single internal specialist.
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Our Partnership</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
              Why Partner with Cotswold Pages?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs hover:shadow-md transition duration-300 flex items-start gap-5">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-950 mb-2">{benefit.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-stone-950 rounded-3xl text-white p-8 md:p-12 relative overflow-hidden border border-amber-500/10 shadow-lg text-center md:text-left">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-stone-900 z-0" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="text-xl sm:text-2xl font-serif font-black mb-3">Let us manage your social media so you can manage your growth</h3>
                <p className="text-stone-300 text-xs leading-relaxed font-normal">
                  Contact our strategy team today for a tailored proposal to elevate your digital presence.
                </p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <Link 
                  href="/contact" 
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer theme="light" />
    </div>
  );
}
