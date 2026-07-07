import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import { Mail, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact Us | Cotswolds Pages Directory",
  description: "Get in touch with the Cotswolds Pages directory administration. Send messages regarding claim reviews, new listings, or business support.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12 animate-fade-in-up">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Get in Touch</span>
          <h1 className="text-3xl font-serif font-black text-stone-950">Contact Us</h1>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Have questions about listing your business or feedback about our directory? Send us a message, and our local team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          {/* Contact Details Panel */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs flex flex-col gap-6">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Our Channels</h3>
            
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Email Inquiries</h4>
                <p className="text-sm font-semibold text-stone-900 mt-1">info@cotswoldspages.com</p>
                <p className="text-[10px] text-stone-400 mt-0.5">We reply within 1 business day.</p>
              </div>
            </div>

            
            <div className="flex items-start gap-4 border-t border-stone-100 pt-6">
              <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Form Submissions</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Submissions are routed directly to our admin team's inbox for prompt response.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer theme="light" />
    </div>
  );
}
