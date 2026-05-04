"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Star, MessageSquare, Send } from "lucide-react";

interface InteractionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  initialTab?: "comments" | "likes" | "ratings";
  currentUser: any;
}

export default function InteractionBottomSheet({ isOpen, onClose, postId, initialTab = "comments", currentUser }: InteractionBottomSheetProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState<{ comments: any[], likes: any[], ratings: any[] }>({ comments: [], likes: [], ratings: [] });
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (isOpen && postId) {
      setActiveTab(initialTab);
      fetchInteractions();
    }
  }, [isOpen, postId, initialTab]);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/interactions`);
      const payload = await res.json();
      setData(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, parentId: replyingTo?.id || null })
      });
      if (res.ok) {
        setNewComment("");
        setReplyingTo(null);
        fetchInteractions(); // Refetch to show new comment
      }
    } catch (error) {
      console.error("Failed to post comment");
    }
  };

  const renderComments = (comments: any[], depth = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`${depth > 0 ? "ml-8 mt-2 border-l-2 border-purple-100/50 pl-3" : "mt-4"}`}>
        <div className="flex gap-3">
          <img src={comment.author?.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
          <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 relative">
            <h5 className="font-bold text-sm text-gray-900">{comment.author?.name}</h5>
            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-11 mt-1 text-xs font-bold text-gray-500">
          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          <button onClick={() => setReplyingTo({ id: comment.id, name: comment.author?.name })} className="hover:text-purple-600 transition">Reply</button>
        </div>
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };

  const renderUsers = (users: any[], label: string) => {
    if (users.length === 0) return <div className="text-center text-gray-400 mt-10">No {label} yet.</div>;
    return users.map((item, idx) => (
      <div key={idx} className="flex items-center gap-3 mt-4">
        <img src={item.author?.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
        <h5 className="font-bold text-sm text-gray-900">{item.author?.name}</h5>
      </div>
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto h-[80vh] bg-white rounded-t-3xl shadow-2xl z-[70] flex flex-col"
          >
            {/* Drag Handle & Header */}
            <div className="pt-3 pb-2 flex flex-col items-center border-b border-gray-100 relative">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-3" />
              <div className="flex w-full px-4 justify-between items-center">
                <div className="flex bg-gray-100 rounded-full p-1">
                  <button onClick={() => setActiveTab("comments")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${activeTab === 'comments' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-900'}`}><MessageSquare size={14}/> Comments</button>
                  <button onClick={() => setActiveTab("likes")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${activeTab === 'likes' ? 'bg-white shadow-sm text-red-500' : 'text-gray-500 hover:text-gray-900'}`}><Heart size={14}/> Likes</button>
                  <button onClick={() => setActiveTab("ratings")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${activeTab === 'ratings' ? 'bg-white shadow-sm text-yellow-500' : 'text-gray-500 hover:text-gray-900'}`}><Star size={14}/> Ratings</button>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-200 transition"><X size={18}/></button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
              {loading ? (
                <div className="text-center text-purple-600 font-bold mt-10">Loading...</div>
              ) : (
                <>
                  {activeTab === "comments" && (
                     data.comments.length === 0 ? <div className="text-center text-gray-400 mt-10">No comments yet. Be the first!</div> : renderComments(data.comments)
                  )}
                  {activeTab === "likes" && renderUsers(data.likes, "likes")}
                  {activeTab === "ratings" && renderUsers(data.ratings, "ratings")}
                </>
              )}
            </div>

            {/* Comment Input */}
            {activeTab === "comments" && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 pt-2">
                {replyingTo && (
                  <div className="flex justify-between items-center text-xs font-bold text-purple-600 mb-2 px-2 bg-purple-50 py-1.5 rounded-lg">
                    <span>Replying to {replyingTo.name}</span>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                  </div>
                )}
                <form onSubmit={handlePostComment} className="flex items-center gap-2">
                  <img src={currentUser?.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-9 h-9 rounded-full object-cover bg-gray-100" />
                  <input 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)} 
                    placeholder="Write a comment..." 
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-purple-200 focus:bg-white transition"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition">
                    <Send size={16} className="-ml-0.5" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
