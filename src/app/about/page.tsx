"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Image Area */}
      <div className="relative w-full h-64 bg-purple-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 p-1 shadow-2xl rotate-3">
             <div className="w-full h-full relative rounded-xl overflow-hidden">
               <Image src="/logo.png" alt="Logo" fill sizes="80px" className="object-cover" />
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Our Mission</h1>
        </motion.div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-gray-50" preserveAspectRatio="none">
            <path d="M0,120 L1440,120 L1440,30 C1200,-30 600,100 0,20 Z"></path>
          </svg>
        </div>
      </div>

      <div className="px-6 pb-24 -mt-4 relative z-10">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3">Rebuilding the Village</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            We believe that communities thrive when neighbours know and support each other. 
            In the modern world, it's easy to feel disconnected. Neighbourhood Helper changes that by 
            giving you a direct line to the people living right next door.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] mb-6 border-l-4 border-purple-500"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3">Trust & Safety</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            Every user goes through an address verification process. This ensures that when you open 
            your door to a neighbour, you know exactly who is standing there.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mt-10"
        >
          <p className="text-xs text-purple-400 font-medium tracking-wide font-mono">
            v1.0.0 • Made with ❤️ in Node.js
          </p>
        </motion.div>
      </div>
    </div>
  );
}
