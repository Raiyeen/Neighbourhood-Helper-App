"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Bell, MessageCircle } from "lucide-react";
import { useSocket } from "./providers/socket-provider";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (socket && user) {
       const handler = (payload: any) => {
         setUser((prev: any) => ({
           ...prev,
           _count: { ...prev._count, notifications: (prev._count?.notifications || 0) + 1 }
         }));
       };
       socket.on('receive-notification', handler);
       socket.on('receive-message', handler);
       return () => {
         socket.off('receive-notification', handler);
         socket.off('receive-message', handler);
       };
    }
  }, [socket, user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifications = async () => {
    const newState = !isNotifOpen;
    setIsNotifOpen(newState);
    
    if (newState) {
      // Clear badge visually
      setUser((prev: any) => ({ ...prev, _count: { ...prev._count, notifications: 0 } }));
      
      // Fetch UI data
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);

      // Hit POST to mark all as read
      fetch("/api/notifications", { method: "POST" });
    }
  };

  const handleNotificationClick = (notif: any) => {
    setIsNotifOpen(false);
    if (notif.type === 'MESSAGE') {
      router.push(`/chat/${notif.sourceId}`);
    } else {
      router.push(`/post`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm w-full max-w-md mx-auto">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg text-gray-900 leading-tight">
            Neighbourhood<br/><span className="text-purple-600">Helper</span>
          </span>
        </Link>

        <div className="flex items-center space-x-3 text-sm font-medium">
          {user ? (
            <>
              <Link href="/chat" className="relative text-gray-600 hover:text-purple-600 transition-colors">
                <MessageCircle size={22} className="text-gray-600 hover:text-purple-600 transition" />
              </Link>
              <div className="relative" ref={notifRef}>
                <div onClick={toggleNotifications} className="relative cursor-pointer">
                  <Bell size={22} className={`${isNotifOpen ? "text-purple-600" : "text-gray-600"} hover:text-purple-600 transition`} />
                  {user._count?.notifications > 0 && typeof user._count?.notifications === 'number' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                      {user._count.notifications}
                    </div>
                  )}
                </div>
                
                {isNotifOpen && (
                  <div className="absolute top-10 right-0 w-[300px] bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[400px]">
                    <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <span className="font-bold text-sm text-gray-900">Notifications</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                         <div className="p-6 text-center text-xs text-gray-400">No notifications yet.</div>
                      ) : (
                         notifications.map((n, i) => (
                           <div key={i} onClick={() => handleNotificationClick(n)} className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${!n.isRead ? 'bg-purple-50/30' : ''}`}>
                             <img src={n.sender?.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                             <div>
                               <p className="text-xs text-gray-800 leading-snug">
                                  <span className="font-bold text-gray-900">{n.sender?.name}</span>
                                  {n.type === 'LIKE' ? ' liked your post' : n.type === 'COMMENT' ? ' commented on your post' : n.type === 'RATE' ? ' rated your post' : n.type === 'REPLY' ? ' replied to your comment' : ' sent you a message'}
                               </p>
                               <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</span>
                             </div>
                           </div>
                         ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 ml-1">
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-purple-600 active:text-purple-800 transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-md shadow-purple-500/20 hover:bg-purple-700 active:bg-purple-800 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
