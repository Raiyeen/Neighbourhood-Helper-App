"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

function formatDistanceToNow(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(res => res.json()),
      fetch("/api/chat").then(res => res.json())
    ]).then(([meData, chatData]) => {
      if (meData.user) setCurrentUser(meData.user);
      if (Array.isArray(chatData)) setConversations(chatData);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      fetch(`/api/users/search?q=${searchQuery}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleStartNewChat = async (targetId: number) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId })
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/chat/${data.id}`;
      } else {
        alert(data.error || "Failed to start chat.");
      }
    } catch {
      alert("An error occurred");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fdfcff] px-4 py-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Messages</h1>
        <button onClick={() => document.getElementById('chat-search-input')?.focus()} className="p-2.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 mb-6 relative z-10">
        <Search size={18} className="text-gray-400 mr-2" />
        <input 
          id="chat-search-input"
          placeholder="Search by name to chat..." 
          className="bg-transparent border-none outline-none text-sm w-full" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && searchQuery && (
          <div className="absolute top-14 left-0 right-0 bg-white shadow-xl border border-gray-100 rounded-xl p-2 max-h-48 overflow-y-auto">
            {searchResults.map((u: any) => (
              <button 
                key={u.id} 
                onClick={() => handleStartNewChat(u.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
              >
                <img src={u.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
                <span className="font-bold text-sm text-gray-900">{u.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-purple-600 font-bold mt-10">Loading Messages...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center mt-20 flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={32} className="text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 text-sm max-w-[200px]">Start chatting with your neighbors!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv, idx) => {
            const partner = conv.user1Id === currentUser?.id ? conv.user2 : conv.user1;
            const lastMessage = conv.messages[0];
            
            return (
              <Link href={`/chat/${conv.id}`} key={conv.id}>
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition border border-gray-50 mt-3"
                >
                  <img src={partner.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-14 h-14 rounded-full bg-gray-100 object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-extrabold text-gray-900 truncate">{partner.name}</h4>
                      {lastMessage && (
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    {lastMessage ? (
                      <p className={`text-sm truncate ${lastMessage.senderId !== currentUser?.id && !lastMessage.isRead ? "font-bold text-gray-900" : "text-gray-500"}`}>
                        {lastMessage.senderId === currentUser?.id && "You: "}
                        {lastMessage.content || "📸 Image"}
                      </p>
                    ) : (
                      <p className="text-sm text-purple-400 italic">Say hi!</p>
                    )}
                  </div>
                  {lastMessage && lastMessage.senderId !== currentUser?.id && !lastMessage.isRead && (
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
