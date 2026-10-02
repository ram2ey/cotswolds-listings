import Link from "next/link";
import { Check, Mail, PackageCheck } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ClearCartOnMount from "../../components/ClearCartOnMount";
import { hasStripeSecretKey, stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const query = await searchParams;
  let receipt: { orderId: string; email?: string | null; amount?: string; items?: string[] } | null = null;

  if (query.session_id && hasStripeSecretKey()) {
    try {
      const session = await stripe.checkout.sessions.retrieve(query.session_id, { expand: ["line_items"] });
      if (session.payment_status === "paid" && session.metadata?.shopOrder === "true") {
        receipt = {
          orderId: session.metadata.orderId || session.id,
          email: session.customer_details?.email,
          amount: session.amount_total == null ? undefined : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(session.amount_total / 100),
          items: session.line_items?.data.map((item) => `${item.quantity || 1} × ${item.description}`),
        };
      }
    } catch (error) {
      console.error("[shop-order-success] Unable to retrieve session", error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#faf8f3]">
      <Navbar />
      {receipt ? <ClearCartOnMount /> : null}
      <section className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white text-center shadow-xl shadow-stone-900/5">
          {receipt ? (
            <>
              <div className="bg-[#123525] px-8 py-12 text-white">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-amber-800"><Check className="h-7 w-7" strokeWidth={2.5} /></span>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-300">Order confirmed</p>
                <h1 className="mt-2 font-serif text-4xl font-bold">Thank you for your order</h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-300">Your candles are reserved and will soon be prepared for dispatch.</p>
              </div>
              <div className="px-6 py-9 sm:px-10">
                {receipt.items?.length ? <ul className="mx-auto mb-7 max-w-md space-y-2 border-b border-stone-200 pb-7 text-left text-sm text-stone-600">{receipt.items.map((item) => <li key={item} className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-amber-700" />{item}</li>)}</ul> : null}
                <div className="grid gap-5 text-left sm:grid-cols-2">
                  <div className="rounded-2xl bg-stone-50 p-5"><p className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Order reference</p><p className="mt-2 truncate text-xs font-bold text-stone-900">{receipt.orderId}</p></div>
                  <div className="rounded-2xl bg-stone-50 p-5"><p className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Order total</p><p className="mt-2 text-sm font-bold text-stone-900">{receipt.amount || "Paid"}</p></div>
                </div>
                <p className="mt-7 flex items-center justify-center gap-2 text-xs text-stone-500"><Mail className="h-4 w-4" /> A receipt will be sent to {receipt.email || "your email address"}.</p>
                <Link href="/shop" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-500 px-7 text-sm font-bold text-white transition hover:bg-amber-600">Return to the candle shop</Link>
              </div>
            </>
          ) : (
            <div className="px-8 py-16"><h1 className="font-serif text-3xl font-bold text-stone-950">We could not verify this order</h1><p className="mt-4 text-sm leading-6 text-stone-500">If you completed payment, check your email for the Stripe receipt or contact us for help.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-white">Return to the shop</Link></div>
          )}
        </div>
      </section>
      <Footer theme="dark" />
    </main>
  );
}
