"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSubmitting(true);

    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitting(false);
    setSuccess(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  if (success) {
    return (
      <div className="text-center py-12 px-4 flex flex-col items-center">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-serif font-black text-stone-950 mb-2">Message Sent Successfully</h3>
        <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out! Our local administration team has received your message and will email you back shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Subject</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Premium Listing Details"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">Message</label>
        <textarea
          id="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your inquiry details..."
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition resize-none leading-relaxed"
        />
      </div>

      {error && (
        <span className="text-[11px] text-rose-500 font-bold ml-1 animate-pulse">
          ⚠️ {error}
        </span>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-fit self-end px-6 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition shrink-0 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
