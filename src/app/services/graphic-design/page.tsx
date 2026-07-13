import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Palette, PenTool, Layout, Layers, Heart, MessageSquare, Award, BookOpen, Star, RefreshCw, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Graphic Design & Branding | Cotswolds Pages",
  description: "Result-driven branding that moves the needle. Build a complete brand identity with Cotswolds Pages.",
};

export default function GraphicDesign() {
  const elements = [
    {
      title: "Strategic Logo Design",
      description: "Creating a versatile, memorable mark that looks great on business cards, signage, and screen interfaces.",
      icon: PenTool,
    },
    {
      title: "Curated Typography & Colors",
      description: "Selecting deliberate typography and color palettes that evoke the right emotions from your target audience.",
      icon: Palette,
    },
    {
      title: "Cohesive Brand Voice",
      description: "Developing a consistent tone of voice for your website, social platforms, and customer care channels.",
      icon: MessageSquare,
    },
    {
      title: "Unified Marketing Assets",
      description: "Designing matching stationery, social templates, and digital graphics that protect your professional image.",
      icon: Layout,
    },
  ];

  const benefits = [
    {
      title: "Immediate Market Distinction",
      description: "Carve out a totally unique, memorable space in the crowded Cotswolds marketplace.",
      icon: Award,
    },
    {
      title: "Command Premium Pricing",
      description: "A highly polished, professional image allows you to confidently charge what your services are truly worth.",
      icon: Star,
    },
    {
      title: "Cultivate Customer Loyalty",
      description: "Build deep emotional connections that turn one-time buyers into lifelong brand advocates.",
      icon: Heart,
    },
    {
      title: "Streamline Future Marketing",
      description: "A clearly defined brand asset framework makes creating new ads and content fast and effortless.",
      icon: Layers,
    },
    {
      title: "Inspire Total Internal Pride",
      description: "Give your staff a clear, inspiring mission and identity they are genuinely proud to represent.",
      icon: BookOpen,
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
              <span className="text-amber-600">Graphic Design</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-stone-950 text-white py-20 px-4 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-955/40 via-stone-955 to-stone-955 z-0" />
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block mb-2">Service 05</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-white leading-tight">
              Result-Driven Branding That Moves the Needle
            </h1>
          </div>
        </section>

        {/* Introduction */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-xs flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-2">Our Stance</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 mb-4">More Than Just a Pretty Logo</h2>
              <p className="text-stone-705 text-xs sm:text-sm leading-relaxed mb-4">
                True branding is much more than just a pretty logo. At COTSWOLDS PAGES, we build complete brand identities that capture the exact essence of what makes your business special, helping you stand out from the competition and connect with local customers.
              </p>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-xs flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-2">Growth Partner</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 mb-4">Why Branding Matters for Local Growth</h2>
              <p className="text-stone-705 text-xs sm:text-sm leading-relaxed mb-4">
                Your brand identity is the first impression you make on your community. It tells your audience who you are, what you stand for, and why they should choose you over anyone else.
              </p>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                By aligning your visuals with your core business values, you create an instant bond of trust before a customer even picks up the phone.
              </p>
            </div>
          </div>
        </section>

        {/* Elements Grid */}
        <section className="bg-white border-t border-b border-stone-200 py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Elements</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
                Elements of a Complete Brand Identity
              </h2>
              <p className="text-stone-500 text-xs mt-2 font-normal">
                A strong, recognizable brand requires a cohesive look and feel across every single customer touchpoint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {elements.map((el, idx) => {
                const Icon = el.icon;
                return (
                  <div key={idx} className="bg-stone-50 rounded-2xl border border-stone-200 p-8 shadow-xs hover:shadow-md hover:scale-[1.01] transition duration-300 flex flex-col items-start text-left">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl mb-6 shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-stone-950 mb-2">{el.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{el.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Benefits</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
              The Clear Benefits of Professional Brand Strategy
            </h2>
            <p className="text-stone-500 text-xs mt-2 font-normal">
              Investing in your business's identity delivers tangible long-term rewards that actively drive your business forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition duration-300 flex flex-col items-start text-left justify-between">
                  <div>
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl mb-4 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-950 mb-2">{benefit.title}</h3>
                    <p className="text-[11px] text-stone-500 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Process and Integration details */}
        <section className="bg-white border-t border-b border-stone-200 py-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              
              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-4">Our Collaborative Creative Process</h3>
                  <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                    To build a brand that truly fits, we work right alongside you to unpack your business goals and study your local target market.
                  </p>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                    Our in-house design team combines deep local insights with modern design principles to build a comprehensive brand guideline. This clear blueprint ensures your business looks consistently professional across every platform.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-4">Seamless Digital Integration</h3>
                  <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                    A beautiful brand identity only works if it is executed perfectly across your digital footprint.
                  </p>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                    Because we handle web design, social media management, and content creation under one roof, we ensure your new branding flows seamlessly into your entire online presence. This creates a friction-free experience for your website visitors.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-stone-950 rounded-3xl text-white p-8 md:p-12 relative overflow-hidden border border-amber-500/10 shadow-lg text-center md:text-left">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-stone-900 z-0" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="text-xl sm:text-2xl font-serif font-black mb-3">Partner with Cotswold PAGES to Define Your Identity</h3>
                <p className="text-stone-300 text-xs leading-relaxed font-normal">
                  Whether you are launching a brand-new startup in Chipping Norton or revitalizing a multi-generation family business in Cirencester, our hands-on creative team is here to help.
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
