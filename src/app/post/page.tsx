"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Wrench, Loader2, Heart, Star, MessageSquare, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import InteractionBottomSheet from "@/components/InteractionBottomSheet";

export default function HelpPostPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [areaFilter, setAreaFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [bottomSheet, setBottomSheet] = useState({ isOpen: false, postId: null as number | null, initialTab: "comments" as "comments"|"likes"|"ratings" });

  useEffect(() => {
    fetchPosts();
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    if (!currentUser) return alert("Please Login or Signup to react, rate, or comment.");
    const isLiked = posts.find(p => p.id === id)?.likes?.length > 0;
    setPosts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      likes: isLiked ? [] : [{ id: -1 }], 
      _count: { ...p._count, likes: p._count.likes + (isLiked ? -1 : 1) } 
    } : p));
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
  };

  const handleRate = async (id: number) => {
    if (!currentUser) return alert("Please Login or Signup to react, rate, or comment.");
    const isRated = posts.find(p => p.id === id)?.ratings?.length > 0;
    setPosts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      ratings: isRated ? [] : [{ id: -1 }], 
      _count: { ...p._count, ratings: p._count.ratings + (isRated ? -1 : 1) } 
    } : p));
    await fetch(`/api/posts/${id}/rate`, { method: "POST" });
  };

  const openInteractions = (id: number, tab: "comments" | "likes" | "ratings") => {
    if (!currentUser) return alert("Please Login or Signup to react, rate, or comment.");
    setBottomSheet({ isOpen: true, postId: id, initialTab: tab });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Failed to delete post.");
      }
    } catch (e) {
      alert("Error deleting post.");
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchArea = post.areaName.toLowerCase().includes(areaFilter.toLowerCase());
    const matchDate = dateFilter ? post.createdAt.startsWith(dateFilter) : true;
    return matchArea && matchDate;
  });

  return (
    <div className="w-full min-h-screen bg-[#fdfcff] px-4 py-6 pb-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Help Posts</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-purple-50 mb-6 space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Search & Filter</h2>
        <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-purple-100">
          <MapPin size={18} className="text-purple-600 mr-2" />
          <input type="text" placeholder="Filter by Area..." className="bg-transparent border-none outline-none text-sm w-full" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} />
        </div>
        <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-purple-100">
          <Calendar size={18} className="text-purple-600 mr-2" />
          <input type="date" className="bg-transparent border-none outline-none text-sm w-full text-gray-600" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6 flex flex-col items-center">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-600" size={32} /></div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-2xl shadow-sm w-full">No posts found.</div>
        ) : (
          filteredPosts.map((post, idx) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="w-full bg-white rounded-[1.75rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-purple-50 overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <img src={post.author?.profilePicture || "https://ui-avatars.com/api/?name=User"} alt="Author" className="w-10 h-10 rounded-full border border-purple-100 bg-gray-100 object-cover" />
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">{post.author?.name || "Anonymous"}</h4>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${post.urgency === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {post.urgency}
                  </div>
                  {currentUser && currentUser.id === post.authorId && (
                    <div className="flex gap-1.5 ml-1">
                      <button onClick={() => window.location.href=`/post/${post.id}/edit`} aria-label="Edit" className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"><Edit size={14}/></button>
                      <button onClick={() => handleDelete(post.id)} aria-label="Delete" className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
              </div>

              {post.imageUrl && (
                <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">{post.description}</p>
                
                <div className="flex gap-2 mb-4">
                  <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1">
                    <MapPin size={14}/> {post.areaName}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition font-bold text-xs p-2 bg-gray-50 rounded-xl hover:bg-red-50">
                      <Heart size={18} className={post.likes?.length > 0 ? "fill-red-500 text-red-500" : ""} /> {post._count?.likes || 0}
                    </button>
                    <button onClick={() => handleRate(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-yellow-500 transition font-bold text-xs p-2 bg-gray-50 rounded-xl hover:bg-yellow-50">
                      <Star size={18} className={post.ratings?.length > 0 ? "fill-yellow-400 text-yellow-500" : ""} /> {post._count?.ratings || 0}
                    </button>
                    <button onClick={() => openInteractions(post.id, 'comments')} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 transition font-bold text-xs p-2 bg-gray-50 rounded-xl hover:bg-purple-50">
                      <MessageSquare size={18} /> {post._count?.comments || 0}
                    </button>
                  </div>
                  <button onClick={() => openInteractions(post.id, 'comments')} className="flex items-center gap-1 text-purple-600 font-bold text-xs p-2 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                    <Eye size={16} /> Show
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="fixed bottom-24 w-full max-w-md mx-auto pointer-events-none z-40 px-4 left-0 right-0 flex justify-end">
         <a href="/post/new" className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(147,51,234,0.4)] hover:scale-105 transition-transform pointer-events-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </a>
      </div>

      <InteractionBottomSheet 
        isOpen={bottomSheet.isOpen} 
        onClose={() => setBottomSheet({ ...bottomSheet, isOpen: false })} 
        postId={bottomSheet.postId}
        initialTab={bottomSheet.initialTab}
        currentUser={currentUser}
      />
    </div>
  );
}
