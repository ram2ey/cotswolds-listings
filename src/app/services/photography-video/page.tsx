import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Camera, Play, Image, Video, Compass, Users, Sparkles, Star, Heart, TrendingUp, Layers, ShoppingBag, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Photography & Video Services | Cotswolds Pages",
  description: "Tell your story with high-impact video & photography. Access premium, affordable production services with Cotswolds Pages.",
};

export default function PhotographyVideo() {
  const services = [
    {
      title: "Commercial Product Photography",
      description: "High-resolution studio and lifestyle shots that make your stock look absolutely irresistible.",
      icon: ShoppingBag,
    },
    {
      title: "On-Site Team & Portraits",
      description: "Authentic, friendly photos of your staff and workspace that beautifully humanize your brand.",
      icon: Users,
    },
    {
      title: "Cinematic Promotional Videos",
      description: "Engaging short-form video profiles perfect for website headers, hero backgrounds, and landing pages.",
      icon: Video,
    },
    {
      title: "Social-First Reels & Shorts",
      description: "Dynamic, fast-paced vertical video content optimized to trend on Instagram, TikTok, and YouTube Shorts.",
      icon: Play,
    },
  ];

  const benefits = [
    {
      title: "Skyrocket Engagement Rates",
      description: "Posts with professional photos and videos earn significantly higher clicks, likes, and shares.",
      icon: TrendingUp,
    },
    {
      title: "Drastically Lower Bounce Rates",
      description: "Eye-catching visual layouts keep website visitors browsing your pages for much longer.",
      icon: Layers,
    },
    {
      title: "Build Unshakeable Trust",
      description: "High-end media proves that you run a professional, established, and reliable operation.",
      icon: Star,
    },
    {
      title: "Create a Versatile Content Bank",
      description: "Build a massive library of custom digital assets you can reuse for years across all platforms.",
      icon: Compass,
    },
    {
      title: "Maximize E-Commerce Conversions",
      description: "Crystal-clear product media answers buyer questions instantly, directly increasing online sales.",
      icon: Heart,
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
              <span className="text-amber-600">Photography & Video</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-stone-950 text-white py-20 px-4 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-955/40 via-stone-955 to-stone-955 z-0" />
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block mb-2">Service 06</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-white leading-tight">
              Tell Your Story: High-Impact Video & Photography
            </h1>
          </div>
        </section>

        {/* Introduction */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-xs flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-2">Visual Storytelling</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 mb-4">The Power of Visual Media in the Cotswolds</h2>
              <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                We believe that professional photography and video are the most powerful tools for telling your business's unique story. That is why at Cotswold PAGES, we are genuinely passionate about capturing premium visual media and making it fully accessible and affordable for every single member of our local business directory.
              </p>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                In a digital marketplace, text alone is no longer enough to grab attention. High-quality imagery lets you show potential customers the exact faces, dedication, and craftsmanship behind your business before they ever step through your door. Authentic visual content builds instant trust and makes your services completely unforgettable.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-white border-t border-b border-stone-200 py-16 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Production</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
                Our Comprehensive Media Production Services
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((svc, idx) => {
                const Icon = svc.icon;
                return (
                  <div key={idx} className="bg-stone-50 rounded-2xl border border-stone-200 p-8 shadow-xs hover:shadow-md hover:scale-[1.01] transition duration-300 flex flex-col items-start text-left">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl mb-6 shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-stone-950 mb-2">{svc.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{svc.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Value</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
              The Major Benefits of Investing in Professional Media
            </h2>
            <p className="text-stone-500 text-xs mt-2 font-normal">
              Upgrading your brand imagery delivers massive long-term value across your entire marketing framework.
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

        {/* Process & Platform Details */}
        <section className="bg-white border-t border-b border-stone-200 py-16 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              
              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-4">Our Friction-Free On-Site Process</h3>
                  <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                    You do not need to worry about staging studio spaces or buying expensive equipment.
                  </p>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                    Our experienced, friendly mobile media crew comes straight to your location—whether you run a busy kitchen in Bourton-on-the-Water or a workshop in Cirencester. We work quickly and cleanly around your schedule, ensuring zero disruption to your daily business.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-4">Tailored for All Digital Platforms</h3>
                  <p className="text-stone-605 text-xs sm:text-sm leading-relaxed mb-4">
                    Capturing great footage is only half the battle; it also needs to fit the technical specifications of modern websites.
                  </p>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                    Our creative team handles all the editing, color grading, and formatting. We deliver perfectly cropped, optimized files ready to plug straight into your website design, social feeds, and local directory listings.
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
                <h3 className="text-xl sm:text-2xl font-serif font-black mb-3">Work with Cotswolds Pages to Capture Your Brand</h3>
                <p className="text-stone-300 text-xs leading-relaxed font-normal">
                  Whether you want to showcase a stunning new menu, highlight a completed construction project, or introduce your team to the community, we have you covered. Let us handle the cameras and storytelling while you keep focusing on what you do best.
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
