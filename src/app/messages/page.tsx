"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  User,
  Bell,
  Search,
  Send,
  MoreHorizontal,
  Image as ImageIcon,
} from "lucide-react";

// Types
interface ChatPreview {
  id: string;
  planTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  isOwn: boolean;
}

// Mock data — will be replaced with API calls
const mockChats: ChatPreview[] = [
  {
    id: "1",
    planTitle: "Kayaking at Brooklyn Bridge",
    lastMessage: "Daniel Wang: I'll be wearing a red hat. Can't wait for...",
    lastMessageTime: "9:51",
    avatar: "🛶",
    unread: 1,
  },
  {
    id: "2",
    planTitle: "Cultural Cooking Class",
    lastMessage: "You've been added to the group",
    lastMessageTime: "8:45",
    avatar: "🍳",
    unread: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "u1",
    senderName: "Vik Sokolov",
    senderAvatar: "V",
    content: "Hey everyone, don't forget to bring water and wear shoes you don't mind getting wet!",
    time: "9:31 AM",
    isOwn: false,
  },
  {
    id: "2",
    senderId: "u2",
    senderName: "Jessica",
    senderAvatar: "J",
    content: "Got it! Let's meet by the Brooklyn Bridge Park Boathouse around 4:45 PM.",
    time: "9:33 AM",
    isOwn: false,
  },
  {
    id: "3",
    senderId: "biz",
    senderName: "You",
    senderAvatar: "B",
    content: "Thanks for the heads-up! I'll be there at 4:30 PM, wearing a blue jacket and white cap.",
    time: "9:41 AM",
    isOwn: true,
  },
  {
    id: "4",
    senderId: "u1",
    senderName: "Vik Sokolov",
    senderAvatar: "V",
    content: "Got it, Jessica. I'll be wearing a white t-shirt, a black legging and a red hat!",
    time: "9:50 AM",
    isOwn: false,
  },
  {
    id: "5",
    senderId: "u3",
    senderName: "Simon Lee",
    senderAvatar: "S",
    content: "I'll be wearing a red hat as well. Can't wait to for the kayaking and check out the bridge views! See you there!",
    time: "9:51 AM",
    isOwn: false,
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [tab, setTab] = useState<"active" | "pending">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentChat = mockChats.find((c) => c.id === selectedChat);

  function sendMessage() {
    if (!messageInput.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: "biz",
      senderName: "You",
      senderAvatar: "B",
      content: messageInput.trim(),
      time: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", hour12: true }),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");
    // TODO: POST to backend
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
          {/* Sidebar header */}
          <div className="p-4 border-b border-charcoal-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-charcoal-900">Mensajes</h2>
              <button className="text-charcoal-400 hover:text-charcoal-700">
                <Bell size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setTab("active")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === "active"
                    ? "bg-primary-light text-primary"
                    : "text-charcoal-500 hover:bg-charcoal-50"
                }`}
              >
                Activos
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                  tab === "active" ? "bg-primary text-white" : "bg-charcoal-200 text-charcoal-500"
                }`}>
                  {mockChats.filter((c) => c.unread > 0).length || mockChats.length}
                </span>
              </button>
              <button
                onClick={() => setTab("pending")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === "pending"
                    ? "bg-primary-light text-primary"
                    : "text-charcoal-500 hover:bg-charcoal-50"
                }`}
              >
                Pendientes
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center bg-charcoal-200 text-charcoal-500">
                  0
                </span>
              </button>
            </div>

            {/* Search */}
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

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => { setSelectedChat(chat.id); setSidebarOpen(false); }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-charcoal-50 ${
                  selectedChat === chat.id ? "bg-charcoal-50" : "hover:bg-charcoal-50/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center text-lg shrink-0">
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">{chat.planTitle}</p>
                    <span className="text-xs text-charcoal-400 shrink-0 ml-2">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 truncate mt-0.5">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center shrink-0 mt-1">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-charcoal-100 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden w-8 h-8 rounded-full bg-charcoal-50 flex items-center justify-center text-sm"
                  >
                    {currentChat.avatar}
                  </button>
                  <div>
                    <h3 className="font-semibold text-sm text-charcoal-900">{currentChat.planTitle}</h3>
                    <p className="text-xs text-charcoal-500">Vik, Simon, Jessica y 5 más</p>
                  </div>
                </div>
                <button className="text-charcoal-400 hover:text-charcoal-700">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                {/* Date separator */}
                <div className="text-center">
                  <span className="text-xs text-primary font-medium">Hoy</span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${msg.isOwn ? "items-end" : "items-start"}`}>
                      {!msg.isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-charcoal-100 flex items-center justify-center text-xs text-charcoal-500 font-medium">
                            {msg.senderAvatar}
                          </div>
                          <span className="text-xs font-medium text-charcoal-700">{msg.senderName}</span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.isOwn
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-charcoal-50 text-charcoal-900 rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-charcoal-400 mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
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
                    onClick={sendMessage}
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
              Selecciona un chat para empezar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
