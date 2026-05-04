"use client";

import { motion } from "framer-motion";
import { HeartHandshake, ShieldCheck, CalendarClock, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Community First",
      description: "Connect safely with vetted neighbours in your immediate area.",
      icon: Users,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Request Help",
      description: "Post your needs—from borrowing a ladder to finding a pet sitter.",
      icon: HeartHandshake,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Real-time Support",
      description: "Filter posts by date, area, or accessories required instantly.",
      icon: CalendarClock,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Safe & Verified",
      description: "Every member is a verified resident of your neighbourhood.",
      icon: ShieldCheck,
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-transparent pb-10">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full px-6 pt-10 pb-14 text-center z-10"
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-purple-700 bg-purple-100/50 rounded-full">
          #1 Neighbourhood App
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          Better Together.<br />
          <span className="text-purple-600">Close to Home.</span>
        </h1>
        <p className="text-gray-600 mb-8 max-w-[280px] mx-auto text-sm leading-relaxed">
          Neighbourhood Helper App connects you with people nearby. Lend a hand, borrow a tool, or just say hello.
        </p>

        <Link href="/post">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-600/30 text-lg"
          >
            See Help Posts
          </motion.button>
        </Link>
      </motion.div>

      {/* Features Section with Slowing Effect */}
      <div className="w-full px-6 mt-4 relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why use the app?</h2>
        
        <div className="flex flex-col space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-purple-50/50"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
