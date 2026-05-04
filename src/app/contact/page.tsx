"use client";

import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to Node.js backend
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-white px-6 py-6 pb-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Contact Us</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        We'd love to hear from you. Send us a message and we'll get back as soon as possible.
      </p>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 mb-10">
        <div className="flex items-center p-4 bg-purple-50 rounded-2xl">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Email</p>
            <p className="text-xs text-gray-500">support@neighbourhood.app</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-purple-50 rounded-2xl">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
            <Phone size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Phone</p>
            <p className="text-xs text-gray-500">+1 (555) 123-4567</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] border border-purple-50 p-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition resize-none"
              placeholder="How can we help?"
            ></textarea>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-4 mt-2 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="animate-pulse">Sending...</span>
            ) : success ? (
              <span className="text-purple-400">Message Sent!</span>
            ) : (
              <>
                <span>Send Message</span>
                <Send size={18} />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
