"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [postData, setPostData] = useState<any>(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(res => res.json()),
      fetch(`/api/posts/${id}`).then(res => res.json())
    ])
    .then(([meData, postData]) => {
      if (!meData.user) {
        router.push("/login");
        return;
      }
      if (postData.authorId !== meData.user.id) {
        alert("You are not authorized to edit this post!");
        router.push("/post");
        return;
      }
      setUser(meData.user);
      setPostData(postData);
      if (postData.imageUrl) setUploadedUrl(postData.imageUrl);
    })
    .catch(() => router.push("/post"))
    .finally(() => setFetching(false));
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setUploadedUrl(data.url);
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.imageUrl = uploadedUrl || ""; // Allow clearing image by setting empty string if removed

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        window.location.href = "/post"; // Redirect to wall
      } else {
        alert("Failed to update post.");
        setLoading(false);
      }
    } catch (err) {
      alert("Network error");
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen pt-20 text-center text-purple-600 font-bold flex justify-center"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#fdfcff] px-4 py-6 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 text-gray-500 hover:text-gray-900 transition bg-white p-2 rounded-full shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Post</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-purple-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <input name="title" required defaultValue={postData?.title} placeholder="Post Title" className="w-full bg-purple-50/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition font-bold text-gray-900" />
          </div>
          
          <div>
            <textarea name="description" required defaultValue={postData?.description} rows={4} placeholder="Description..." className="w-full bg-purple-50/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition resize-none text-gray-900"></textarea>
          </div>

          <div className="flex gap-3">
             <div className="flex-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Urgency</label>
               <select name="urgency" required defaultValue={postData?.urgency} className="w-full bg-gray-50 border-r-8 border-transparent rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-700 font-medium">
                  <option value="flexible">Flexible</option>
                  <option value="emergency">Emergency</option>
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Accessories</label>
               <input name="accessories" defaultValue={postData?.accessories || ""} placeholder="e.g. Shovel" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" />
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Post Image attachment</label>
             <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             
             {!uploadedUrl ? (
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-8 border-2 border-dashed border-purple-200 rounded-2xl flex flex-col items-center justify-center text-purple-600 bg-purple-50/30 hover:bg-purple-50 transition">
                  {uploadingImage ? <Loader2 className="animate-spin mb-2" size={24}/> : <UploadCloud className="mb-2" size={28}/>}
                  <span className="text-sm font-bold">{uploadingImage ? "Uploading..." : "Tap to upload new image"}</span>
                </button>
             ) : (
                <div className="w-full h-32 rounded-2xl overflow-hidden relative border border-gray-100">
                  <img src={uploadedUrl} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setUploadedUrl("")} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full backdrop-blur text-red-500 shadow-sm text-xs font-bold">Remove</button>
                </div>
             )}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || uploadingImage}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 disabled:opacity-70 mt-6"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Update Post</span>}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
