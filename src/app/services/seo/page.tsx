import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Search, Settings, HelpCircle, AlertCircle, CheckCircle, Shield, Smartphone, Globe, Landmark, TrendingUp, Zap, ShieldCheck, Heart, LineChart, Layers, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Search Engine Optimization (SEO) | Cotswolds Pages",
  description: "Dominate Google and unlock the power of Technical SEO for your Cotswolds business. Climb search engine rankings with Cotswolds Pages.",
};

export default function SearchEngineOptimization() {
  const coreComponents = [
    {
      title: "Flawless Crawling & Indexing",
      description: "Submitting clear XML sitemaps so Google always reads your newest content.",
      icon: Globe,
    },
    {
      title: "Smart Website Architecture",
      description: "Structuring clean URL formats that make site navigation simple and intuitive.",
      icon: Settings,
    },
    {
      title: "Ironclad Security",
      description: "Implementing modern SSL certificates (HTTPS) to keep sensitive user data protected.",
      icon: Shield,
    },
    {
      title: "Mobile-First Optimization",
      description: "Crafting fully responsive layouts that perform perfectly on smartphones and tablets.",
      icon: Smartphone,
    },
  ];

  const benefits = [
    {
      title: "Higher Search Rankings",
      description: "Seamless indexing makes it much easier to rank for profitable, high-intent local keywords.",
      icon: TrendingUp,
    },
    {
      title: "Better User Experiences",
      description: "Faster loading speeds and clean layouts encourage visitors to stay on your site longer.",
      icon: Zap,
    },
    {
      title: "Built-In Trust & Credibility",
      description: "A fast, secure website free of broken links presents a highly professional image.",
      icon: ShieldCheck,
    },
    {
      title: "Proactive Problem Solving",
      description: "Regular site health checks catch performance bugs before they can harm your traffic.",
      icon: Heart,
    },
    {
      title: "Maximized Conversion Rates",
      description: "Removing technical friction points makes it easy for visitors to become paying customers.",
      icon: LineChart,
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
              <span className="text-amber-600">SEO</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-stone-950 text-white py-20 px-4 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-955/40 via-stone-955 to-stone-955 z-0" />
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block mb-2">Service 04</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-white leading-tight">
              Dominate Google: Unlock the Power of SEO for Your Business
            </h1>
          </div>
        </section>

        {/* Introduction */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="p-8 md:p-12 bg-white rounded-3xl border border-stone-205/60 shadow-xs">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-full">
                <Search className="h-8 w-8" />
              </div>
            </div>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
              Search Engine Optimisation (SEO) is a game-changing digital marketing strategy that puts your Cotswolds business directly in front of motivated, high-intent local customers.
            </p>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mt-4 max-w-3xl mx-auto">
              By mastering the core pillars of SEO—including content strategy, local authority building, and the crucial behind-the-scenes magic of Technical SEO—you can dramatically boost your website's search visibility, drive massive waves of free organic traffic, and consistently turn casual clicks into paying customers. Discover exactly how our Technical SEO services fix hidden backend errors, supercharge your loading speeds, and build a flawless foundation that forces Google to rank your website above the competition!
            </p>
          </div>
        </section>

        {/* Technical SEO Section */}
        <section className="bg-white border-t border-b border-stone-200 py-16 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              
              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">What is Technical SEO?</h3>
                  </div>
                  <p className="text-stone-605 text-xs sm:text-sm leading-relaxed">
                    Technical SEO is the process of optimizing your website's backend infrastructure so search engines can easily find, explore, and index your pages. While on-page SEO focuses on your visible words and images, technical SEO works behind the scenes to fine-tune your site structure. The ultimate goal is to build a flawless foundation that helps your business climb search engine result pages (SERPs).
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">Why Technical SEO Matters</h3>
                  </div>
                  <p className="text-stone-605 text-xs sm:text-sm leading-relaxed">
                    Think of technical SEO as the finely tuned engine that powers a high-performance car. Without it, even the most beautiful website will struggle to get noticed. By resolving underlying backend issues, you ensure that search engines like Google can crawl your site seamlessly, which directly improves your visibility and local search rankings.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Core Components Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Checklist</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
              Core Components of a Healthy Website
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreComponents.map((component, idx) => {
              const Icon = component.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs hover:shadow-md transition duration-300 flex flex-col items-start text-left">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl mb-6 shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-950 mb-2">{component.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{component.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="bg-white border-t border-b border-stone-200 py-16 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Impact</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
                The Powerful Benefits for Local Businesses
              </h2>
              <p className="text-stone-500 text-xs mt-2">
                Investing in regular technical maintenance delivers major long-term advantages that keep your business competitive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="bg-stone-50 rounded-2xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition duration-300 flex flex-col items-start text-left justify-between">
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
          </div>
        </section>

        {/* Tools and Strategy Sections */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-xs flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-2">Our Toolset</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 mb-4">How We Use Industry-Leading Tools</h2>
              <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                To keep your platform in top shape, professional agencies utilize advanced data platforms like Ahrefs and SEMrush.
              </p>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                These industry tools conduct comprehensive technical audits, generating deep data reports on your site health and search visibility. These deep insights ensure your digital strategy is always guided by accurate, real-time performance metrics.
              </p>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-xs flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-2">Cohesive Marketing</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 mb-4">Comprehensive Digital Strategies</h2>
              <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                Technical SEO and content creation are truly two sides of the same coin.
              </p>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                While technical optimization builds a reliable, accessible framework, your content strategy provides the value that engages real human readers. Combining a strong technical setup with great local content gives your brand the ultimate competitive edge.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-stone-950 rounded-3xl text-white p-8 md:p-12 relative overflow-hidden border border-amber-500/10 shadow-lg text-center md:text-left">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-stone-900 z-0" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="text-xl sm:text-2xl font-serif font-black mb-3">Choose Cotswold PAGES to Power Your Growth</h3>
                <p className="text-stone-300 text-xs leading-relaxed font-normal">
                  Whether you run an e-commerce shop, a local trade, or a boutique brand right here in the Cotswolds, technical SEO is critical to your online success. Our dedicated, hands-on team handles the technical complexities for you.
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
