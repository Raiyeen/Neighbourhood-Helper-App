"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";

export default function SignupPage() {
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const err = await res.json();
        setError(err.error || "Signup failed");
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
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-purple-50 mt-10"
      >
        {/* Toggle Tabs */}
        <div className="flex w-full bg-gray-50 border-b border-gray-100">
           <Link href="/login" className="flex-1 text-center py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition">
             Log In
           </Link>
           <div className="flex-1 text-center py-4 text-sm font-bold bg-white text-purple-600 border-b-2 border-purple-600">
             Sign Up
           </div>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <UserPlus size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-2">Create Account</h1>
          <p className="text-center text-sm text-gray-500 mb-6">Join your neighbourhood today.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <input name="name" required placeholder="Full Name" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
               <input name="phone" required placeholder="Phone" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
            <input name="email" type="email" required placeholder="Email Address" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            
            <div className="grid grid-cols-2 gap-3">
              <select name="gender" required className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-700">
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input name="profession" required placeholder="Profession" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
            
            <input name="address" required placeholder="Full Address" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            <input name="password" type="password" required placeholder="Strong Password" minLength={8} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 disabled:opacity-70 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Sign Up</span>}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
