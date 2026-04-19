"use client";

import { useState } from "react";
import { Check, Star, Zap, Crown, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: string, amount: number) => {
    if (status !== "authenticated") {
      window.location.href = "/api/auth/signin";
      return;
    }

    setLoadingPlan(plan);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoadingPlan(null);
        return;
      }

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const order = await res.json();
      if (order.error) throw new Error(order.error);

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Visual Search AI",
        description: `Upgrading to ${plan.replace("_", " ")} Plan`,
        image: "https://ui-avatars.com/api/?name=VI&background=9333ea&color=fff",
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            alert("Payment Successful! Your subscription has been updated.");
            window.location.href = "/";
          } else {
            alert("Payment verification failed! Please contact support.");
          }
        },
        prefill: {
          name: session?.user?.name || "User",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#9333ea",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonState = (planId: string) => {
    if (loadingPlan === planId) return { text: "Initializing...", disabled: true, loading: true };
    if (status === "unauthenticated" || status === "loading") return { text: "Login to Purchase", disabled: false };
    return { text: "Choose Plan", disabled: false };
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center py-20 px-6 font-sans">
      <div className="text-center max-w-3xl mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Upgrade Your Intelligence
        </h1>
        <p className="text-lg text-neutral-400">
          Unlock the full potential of global cinema identification with our premium AI quotas. Get exactly what you need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Silver Plan */}
        <div className="relative group bg-neutral-900 border border-white/10 rounded-3xl p-8 flex flex-col transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
          <div className="absolute top-0 right-0 p-4 opacity-50"><Zap className="w-8 h-8 text-blue-400" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Silver Plan</h3>
          <div className="text-4xl font-extrabold text-white mb-6">₹10 <span className="text-lg text-neutral-500 font-medium tracking-normal">/ one-time</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-500" /> 10 Additional Requests</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-500" /> Fast AI Processing</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-500" /> TMDB Insights</li>
          </ul>
          <button
            onClick={() => handlePayment("SILVER", 10)}
            disabled={getButtonState("SILVER").disabled}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {getButtonState("SILVER").loading && <Loader2 className="w-4 h-4 animate-spin"/>}
            {getButtonState("SILVER").text}
          </button>
        </div>

        {/* Gold Plan */}
        <div className="relative group bg-neutral-900 border-2 border-purple-500 rounded-3xl p-8 flex flex-col transform md:-translate-y-4 shadow-2xl shadow-purple-900/20">
          <div className="absolute -top-4 inset-x-0 flex justify-center">
            <span className="bg-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 mt-2">Gold</h3>
          <div className="text-4xl font-extrabold text-white mb-6">₹30 <span className="text-lg text-neutral-500 font-medium tracking-normal">/ month</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-500" /> <span className="font-semibold text-white">Unlimited</span> Requests for 30 Days</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-500" /> Priority AI Queue processing</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-500" /> Complete Metadata Extraction</li>
            <li className="flex items-center gap-3 opacity-60"><Check className="w-5 h-5 text-neutral-600" /> No automatic rebilling</li>
          </ul>
          <button
            onClick={() => handlePayment("GOLD", 30)}
            disabled={getButtonState("GOLD").disabled}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {getButtonState("GOLD").loading && <Loader2 className="w-4 h-4 animate-spin"/>}
            {getButtonState("GOLD").text}
          </button>
        </div>

        {/* Platinum Plan */}
        <div className="relative group bg-neutral-900 border border-white/10 rounded-3xl p-8 flex flex-col transition-all duration-300 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2">
           <div className="absolute top-0 right-0 p-4 opacity-50"><Crown className="w-8 h-8 text-yellow-500" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Platinum</h3>
          <div className="text-4xl font-extrabold text-white mb-6">₹150 <span className="text-lg text-neutral-500 font-medium tracking-normal">/ year</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-yellow-500" /> <span className="font-semibold text-yellow-400">1 Year Unlimited Access</span></li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-yellow-500" /> Highest Priority processing</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-yellow-500" /> VIP Support</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-yellow-500" /> Early access to new features</li>
          </ul>
          <button
            onClick={() => handlePayment("PLATINUM", 150)}
            disabled={getButtonState("PLATINUM").disabled}
            className="w-full py-3.5 bg-white/5 hover:bg-yellow-500/20 text-white hover:text-yellow-400 border border-white/10 hover:border-yellow-500/50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {getButtonState("PLATINUM").loading && <Loader2 className="w-4 h-4 animate-spin"/>}
            {getButtonState("PLATINUM").text}
          </button>
        </div>
      </div>
    </div>
  );
}
