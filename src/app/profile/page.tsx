"use client";
import { useEffect, useState, useRef } from "react";
import { User, LogOut, Camera, Settings, Trash2, CheckCircle2, X, MapPin, Heart, Star, MessageSquare, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InteractionBottomSheet from "@/components/InteractionBottomSheet";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", profession: "", address: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bottomSheet, setBottomSheet] = useState({ isOpen: false, postId: null as number | null, initialTab: "comments" as "comments"|"likes"|"ratings" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [meRes, postsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/posts/me")
        ]);
        if (!meRes.ok) throw new Error("Unauthorized");
        const meData = await meRes.json();
        const postsData = await postsRes.json();
        setUser(meData.user);
        setEditForm({ name: meData.user.name, profession: meData.user.profession || "", address: meData.user.address || "" });
        setPosts(postsData);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleLike = async (id: number) => {
    const isLiked = posts.find(p => p.id === id)?.likes?.length > 0;
    setPosts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      likes: isLiked ? [] : [{ id: -1 }], 
      _count: { ...p._count, likes: p._count.likes + (isLiked ? -1 : 1) } 
    } : p));
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
  };

  const handleRate = async (id: number) => {
    const isRated = posts.find(p => p.id === id)?.ratings?.length > 0;
    setPosts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      ratings: isRated ? [] : [{ id: -1 }], 
      _count: { ...p._count, ratings: p._count.ratings + (isRated ? -1 : 1) } 
    } : p));
    await fetch(`/api/posts/${id}/rate`, { method: "POST" });
  };

  const openInteractions = (id: number, tab: "comments" | "likes" | "ratings") => {
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

  const handleUpdatePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        // Now update profile
        const updateRes = await fetch("/api/user/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePicture: uploadData.url })
        });
        if (updateRes.ok) {
           setUser({ ...user, profilePicture: uploadData.url });
        }
      }
    } catch {
       alert("Upload failed.");
    } finally {
       setUploadingAvatar(false);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setUser({ ...user, ...editForm });
        setIsEditing(false);
      }
    } catch (error) {
      alert("Failed to save.");
    }
  };

  if (loading) return <div className="min-h-screen pt-20 text-center text-purple-600 font-bold">Loading Profile...</div>;
  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#fdfcff] px-4 py-6 pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 flex flex-col items-center mb-6 mt-12 relative overflow-visible">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-purple-100 flex items-center justify-center relative">
             {uploadingAvatar ? <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div> : 
             <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />}
          </div>
          <button 
            onClick={handleUpdatePictureClick}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition"
          >
            <Camera size={14} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        
        {isEditing ? (
          <div className="w-full mt-[50px] space-y-3 text-left">
             <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block">Name:</label>
               <input value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-purple-100" placeholder="Name" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block">Profession:</label>
               <input value={editForm.profession} onChange={e=>setEditForm({...editForm, profession: e.target.value})} className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-purple-100" placeholder="Profession" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block">Address:</label>
               <input value={editForm.address} onChange={e=>setEditForm({...editForm, address: e.target.value})} className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-purple-100" placeholder="Address" />
             </div>
             <div className="flex gap-2 pt-2">
                <button onClick={handleSaveInfo} className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 hover:bg-purple-100"><CheckCircle2 size={16}/> Save</button>
                <button onClick={()=>setIsEditing(false)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 hover:bg-red-100"><X size={16}/> Cancel</button>
             </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-[50px]">{user.name}</h1>
            <p className="text-gray-500 font-medium text-sm">{user.profession}</p>
            <div className="flex gap-2 mt-4 w-full">
              <button onClick={()=>setIsEditing(true)} className="flex-1 bg-purple-50 text-purple-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-100 transition">
                <Settings size={16} /> Edit Info
              </button>
              <button onClick={handleLogout} className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Posts</h2>
      </div>
      
      {/* Own Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm">
            You haven't posted anything yet.
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-3xl shadow-sm border border-purple-50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{post.title}</h3>
                  <span className={`text-[10px] mt-1 inline-block uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${post.urgency === 'emergency' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {post.urgency}
                  </span>
                </div>
                <div className="flex gap-1.5 ml-1">
                  <button onClick={() => window.location.href=`/post/${post.id}/edit`} aria-label="Edit" className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"><Edit size={14}/></button>
                  <button onClick={() => handleDelete(post.id)} aria-label="Delete" className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={14}/></button>
                </div>
              </div>
              {post.imageUrl && <img src={post.imageUrl} className="w-full h-32 object-cover rounded-xl mt-2" />}
              <p className="text-sm text-gray-600 line-clamp-2 mt-2">{post.description}</p>
              
              <div className="flex gap-2 mb-4 mt-4">
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
          ))
        )}
      </div>

      <a href="/post/new" className="absolute bottom-24 right-4 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(147,51,234,0.4)] hover:scale-105 transition-transform z-40">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </a>

      <InteractionBottomSheet 
        isOpen={bottomSheet.isOpen} 
        onClose={() => setBottomSheet({ ...bottomSheet, isOpen: false })} 
        postId={bottomSheet.postId}
        initialTab={bottomSheet.initialTab}
        currentUser={user}
      />
    </div>
  );
}
