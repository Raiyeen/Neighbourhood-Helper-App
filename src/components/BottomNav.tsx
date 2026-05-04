"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Mail, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide Bottom Navigation entirely when inside a Chat Room
  if (pathname.startsWith('/chat/')) return null;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Help Post", href: "/post", icon: MessageCircle },
    { name: "Profile", href: "/profile", icon: User },
    { name: "About", href: "/about", icon: Info },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full max-w-md mx-auto">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-purple-600" : "text-gray-500 hover:text-purple-500"
              }`}
            >
              <Icon size={24} className={isActive ? "fill-purple-50" : ""} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
