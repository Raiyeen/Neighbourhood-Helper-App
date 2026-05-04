"use client";

import { useState, useEffect, useRef, use } from "react";
import { ArrowLeft, Send, Image as ImageIcon, Loader2, Smile } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/components/providers/socket-provider";

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const conversationId = parseInt(unwrappedParams.id);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [partner, setPartner] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // Initial fetch
    Promise.all([
      fetch("/api/auth/me").then(res => res.json()),
      fetch(`/api/chat/${conversationId}`).then(res => res.json())
    ]).then(([meData, convData]) => {
      if (meData.user) setCurrentUser(meData.user);
      if (convData && convData.messages) {
        setMessages(convData.messages.reverse()); // Show oldest first to youngest at bottom
        const p = convData.user1Id === meData.user?.id ? convData.user2 : convData.user1;
        setPartner(p);
      }
    }).finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (payload: any) => {
        if (payload.conversationId === conversationId) {
          setMessages(prev => [...prev, payload.message]);
        }
      };
      socket.on("receive-message", handleNewMessage);
      return () => { socket.off("receive-message", handleNewMessage); };
    }
  }, [socket, conversationId]);

  const sendMessage = async (content?: string, imageUrl?: string) => {
    if (!content?.trim() && !imageUrl) return;
    try {
      const res = await fetch(`/api/chat/${conversationId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setInputText("");
        
        // Notify socket
        if (socket && partner) {
           socket.emit("send-message", {
              receiverId: partner.id,
              conversationId,
              message: data.message
           });
        }
      }
    } catch {
      console.error("Failed to send");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) await sendMessage("", data.url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-purple-600 font-bold">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-[#fdfcff] w-full min-h-[100dvh]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm w-full max-w-md mx-auto pt-6">
        <div className="flex items-center px-4 h-16">
          <Link href="/chat" className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition mr-2">
            <ArrowLeft size={20} />
          </Link>
          <img src={partner?.profilePicture || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full object-cover bg-purple-50 mr-3" />
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">{partner?.name}</h2>
            <p className="text-[10px] text-gray-500">{isConnected ? <span className="text-green-500">Online via Server</span> : "Checking status..."}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-28 pb-20 no-scrollbar">
        <div className="space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? "bg-purple-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="attachment" className="rounded-xl mb-2 w-full max-h-48 object-cover cursor-pointer hover:opacity-90" onClick={()=>window.open(msg.imageUrl, "_blank")} />
                  )}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  <p className={`text-[9px] mt-1 text-right ${isMe ? "text-purple-200" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 p-3 z-50">
        <form onSubmit={e=>{e.preventDefault(); sendMessage(inputText);}} className="flex items-center gap-2 relative">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          
          {isEmojiOpen && (
             <div className="absolute bottom-14 left-0 bg-white border border-gray-100 shadow-xl rounded-xl p-2 grid grid-cols-6 gap-2 z-50">
                {['😊','😂','🥰','😎','👍','❤️','🔥','🙌','👏','🎉','💯','🤔'].map(emoji => (
                   <button type="button" key={emoji} onClick={() => { setInputText(p => p + emoji); setIsEmojiOpen(false); }} className="text-xl hover:bg-gray-50 p-1 rounded transition">
                     {emoji}
                   </button>
                ))}
             </div>
          )}

          <button type="button" onClick={()=>setIsEmojiOpen(!isEmojiOpen)} className="p-2.5 text-yellow-500 bg-yellow-50 rounded-full hover:bg-yellow-100 transition">
             <Smile size={18} />
          </button>
          
          <button type="button" onClick={()=>fileInputRef.current?.click()} className="p-2.5 text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition disabled:opacity-50" disabled={uploading}>
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
          </button>
          
          <input 
            value={inputText} 
            onChange={e => setInputText(e.target.value)} 
            placeholder="Message..." 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none border border-transparent focus:border-purple-200 focus:bg-white transition"
          />
          <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition">
            <Send size={16} className="-ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
