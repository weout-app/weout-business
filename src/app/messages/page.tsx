"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  getBusinessChats,
  getChatMessages,
  sendChatMessage,
  type ChatPreview,
  type ChatMessage,
} from "@/lib/api";
import {
  Globe,
  User,
  Bell,
  Search,
  Send,
  MoreHorizontal,
} from "lucide-react";

export default function MessagesPage() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tab, setTab] = useState<"active" | "pending">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats
  useEffect(() => {
    getBusinessChats()
      .then((data) => {
        setChats(data);
        if (data.length > 0) {
          setSelectedChatId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    if (!selectedChatId) return;
    setLoadingMessages(true);
    getChatMessages(selectedChatId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentChat = chats.find((c) => c.id === selectedChatId);

  const filteredChats = searchQuery
    ? chats.filter((c) => c.planTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  async function handleSend() {
    if (!messageInput.trim() || !selectedChatId) return;
    const content = messageInput.trim();
    setMessageInput("");
    try {
      const msg = await sendChatMessage(selectedChatId, content);
      setMessages((prev) => [...prev, msg]);
    } catch {}
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(time: string) {
    return new Date(time).toLocaleTimeString("es", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  function formatChatTime(time: string) {
    const d = new Date(time);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return formatTime(time);
    }
    return d.toLocaleDateString("es", { month: "short", day: "numeric" });
  }

  // Group messages by date
  function getDateLabel(time: string) {
    const d = new Date(time);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Hoy";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Ayer";
    return d.toLocaleDateString("es", { weekday: "long", month: "long", day: "numeric" });
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-charcoal-100 shrink-0">
        <Link href="/dashboard">
          <img src="/logo.png" alt="WeOut" className="h-7 sm:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700">
            <Globe size={16} /> Español
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700">
            <User size={16} /> <span className="hidden sm:inline">Mi cuenta</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 border-r border-charcoal-100 shrink-0 absolute md:relative z-20 bg-white h-[calc(100vh-65px)] md:h-auto`}>
          <div className="p-4 border-b border-charcoal-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-charcoal-900">Mensajes</h2>
              <button className="text-charcoal-400 hover:text-charcoal-700">
                <Bell size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setTab("active")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === "active" ? "bg-primary-light text-primary" : "text-charcoal-500 hover:bg-charcoal-50"
                }`}
              >
                Activos
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                  tab === "active" ? "bg-primary text-white" : "bg-charcoal-200 text-charcoal-500"
                }`}>{chats.length}</span>
              </button>
              <button
                onClick={() => setTab("pending")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === "pending" ? "bg-primary-light text-primary" : "text-charcoal-500 hover:bg-charcoal-50"
                }`}
              >
                Pendientes
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center bg-charcoal-200 text-charcoal-500">0</span>
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar chat"
                className="w-full rounded-lg border border-charcoal-100 bg-charcoal-50 pl-9 pr-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-10 text-sm text-charcoal-300">
                No hay chats aún
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => { setSelectedChatId(chat.id); setSidebarOpen(false); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-charcoal-50 ${
                    selectedChatId === chat.id ? "bg-charcoal-50" : "hover:bg-charcoal-50/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center text-sm font-medium text-charcoal-500 shrink-0">
                    {chat.planTitle.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-charcoal-900 truncate">{chat.planTitle}</p>
                      {chat.lastMessage && (
                        <span className="text-xs text-charcoal-400 shrink-0 ml-2">
                          {formatChatTime(chat.lastMessage.time)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-500 truncate mt-0.5">
                      {chat.lastMessage
                        ? `${chat.lastMessage.senderName}: ${chat.lastMessage.content}`
                        : "Chat creado"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-charcoal-100 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden w-8 h-8 rounded-full bg-charcoal-50 flex items-center justify-center text-sm font-medium text-charcoal-500"
                  >
                    {currentChat.planTitle.charAt(0)}
                  </button>
                  <div>
                    <h3 className="font-semibold text-sm text-charcoal-900">{currentChat.planTitle}</h3>
                    <p className="text-xs text-charcoal-500">
                      {currentChat.memberNames.join(", ")}
                      {currentChat.memberCount > 3 ? ` y ${currentChat.memberCount - 3} más` : ""}
                    </p>
                  </div>
                </div>
                <button className="text-charcoal-400 hover:text-charcoal-700">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-sm text-charcoal-300">
                    No hay mensajes aún. ¡Envía el primero!
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const showDate = i === 0 || getDateLabel(msg.time) !== getDateLabel(messages[i - 1].time);
                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="text-center py-2">
                              <span className="text-xs text-primary font-medium">{getDateLabel(msg.time)}</span>
                            </div>
                          )}
                          <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[75%]">
                              {!msg.isOwn && (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-full bg-charcoal-100 flex items-center justify-center text-xs text-charcoal-500 font-medium overflow-hidden">
                                    {msg.senderAvatar ? (
                                      <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      msg.senderName.charAt(0)
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-charcoal-700">{msg.senderName}</span>
                                </div>
                              )}
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                msg.isOwn
                                  ? "bg-primary text-white rounded-br-md"
                                  : "bg-charcoal-50 text-charcoal-900 rounded-bl-md"
                              }`}>
                                {msg.content}
                              </div>
                              <p className={`text-[10px] text-charcoal-400 mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}>
                                {formatTime(msg.time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 sm:px-6 py-3 border-t border-charcoal-100 shrink-0">
                <div className="flex items-center gap-2 rounded-full border border-charcoal-100 bg-charcoal-50 px-4 py-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Aa"
                    className="flex-1 bg-transparent text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                    className="text-primary hover:text-primary-hover disabled:text-charcoal-200 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-charcoal-300 text-sm">
              {loading ? "" : chats.length === 0 ? "Crea una experiencia para empezar a chatear" : "Selecciona un chat"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
