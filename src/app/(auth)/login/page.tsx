"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        window.location.href = "/profile";
      } else {
        const err = await res.json();
        setError(err.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcff] flex items-center justify-center p-6 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-purple-50"
      >
        {/* Toggle Tabs */}
        <div className="flex w-full bg-gray-50 border-b border-gray-100">
           <div className="flex-1 text-center py-4 text-sm font-bold bg-white text-purple-600 border-b-2 border-purple-600">
             Log In
           </div>
           <Link href="/signup" className="flex-1 text-center py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition">
             Sign Up
           </Link>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <LogIn size={32} className="ml-1" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-center text-sm text-gray-500 mb-6">Log in to your neighbourhood account.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="emailOrPhone" required placeholder="Email or Phone Number" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            <input name="password" type="password" required placeholder="Password" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 disabled:opacity-70 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Log In</span>}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
