'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpIcon,
  BarChart3Icon,
  FileTextIcon,
  LineChartIcon,
  CalculatorIcon,
  Bot,
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  History,
  Sparkles,
  Code,
  Rocket,
  Zap,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import { chat } from "@/actions/chat";
import { signOut } from "next-auth/react";
import { MessageParser } from './message-parser';

export type Message = {
  role: "user" | "assistant";
  content: string;
};

const prompts = [
  {
    icon: <Code className="size-5" strokeWidth={1.5} />,
    text: "Help me debug this React component",
    gradient: "from-blue-500 to-cyan-500",
    description: "Get AI assistance with code issues"
  },
  {
    icon: <Rocket className="size-5" strokeWidth={1.5} />,
    text: "Deploy my Next.js app to Vercel",
    gradient: "from-purple-500 to-pink-500",
    description: "Step-by-step deployment guide"
  },
  {
    icon: <Zap className="size-5" strokeWidth={1.5} />,
    text: "Optimize my app performance",
    gradient: "from-orange-500 to-red-500",
    description: "Performance tips and tricks"
  },
  {
    icon: <Sparkles className="size-5" strokeWidth={1.5} />,
    text: "Generate API documentation",
    gradient: "from-green-500 to-emerald-500",
    description: "Auto-generate docs from code"
  },
];

export default function Chatbot() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allChats, setAllChats] = useState<any[]>([]);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [chatOffset, setChatOffset] = useState(0);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<Message[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [myChatId, setMyChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ADD THIS NEW STATE
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // MODIFY THIS useEffect
  useEffect(() => {
    fetchChats(0);
    setChatOffset(20);
    const id = searchParams.get("chat");
    if (id) {
      // Check if this is the same chat we just created
      if (isNewlyCreated && id === activeChatId) {
        // Don't reload the chat we just created, just update the URL state
        setMyChatId(id);
        setIsNewlyCreated(false); // Reset the flag
      } else if (id !== activeChatId) {
        // Only load chat if it's a different chat than the current one
        loadChat(id);
        setMyChatId(id);
      }
    } else {
      setHasStartedChat(false);
      setConversation([]);
      setActiveChatId(null);
    }
  }, [searchParams]); // Remove isNewlyCreated from dependencies

  console.log("vhat", myChatId)

  // Scroll down when conversation grows
  useEffect(() => {
    if (conversation.length) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // Fetch first 20 chats (you can later paginate)
  async function fetchChats(offset = 0) {
    const res = await fetch(`/api/chats?limit=20&offset=${offset}`);
    if (!res.ok) return;

    const newChats = await res.json();
    if (newChats.length < 20) setHasMoreChats(false); // no more chats to fetch

    if (offset === 0) {
      setAllChats(newChats); // first load
    } else {
      setAllChats((prev) => [...prev, ...newChats]); // append on scroll
    }
  }

  // Load a single chat from sidebar or URL
  async function loadChat(chatId: string) {
    setActiveChatId(chatId);
    setHasStartedChat(true);
    setIsChatLoading(true);
    setConversation([]);

    const res = await fetch(`/api/chats/${chatId}`);
    if (!res.ok) {
      router.replace("/");
      return;
    }
    const data = await res.json();
    if (!data.messages) {
      router.replace("/");
      return;
    }
    setConversation(data.messages);
    setIsChatLoading(false);
  }

  // Handle clicking a prompt: prefill + send immediately
  function handlePromptClick(text: string) {
    setInput(text);
    if (inputRef.current) inputRef.current.textContent = text;
    handleSend(text);
  }
  const chatId = searchParams.get("chat");

  // MODIFY THIS handleSend function
  async function handleSend(custom?: string) {
    const content = custom ?? input.trim();
    if (!content || isSending) return;

    // clear the input both in state and in the DOM
    setInput("");
    if (inputRef.current) inputRef.current.textContent = "";

    setIsSending(true);
    setConversation((prev) => [...prev, { role: "user", content }]);
    setHasStartedChat(true);

    try {
      const { newMessage, chatId: returnedChatId } = await chat(
        [
          ...conversation,
          { role: "user", content },
        ],
        activeChatId || ""
      );

      // If it's a brand-new chat, reload sidebar
      const createdNew = returnedChatId !== activeChatId;
      setActiveChatId(returnedChatId);

      if (createdNew) {
        // MODIFY THIS PART - Set the flag for newly created chats
        setIsNewlyCreated(true);
        router.replace(`?chat=${returnedChatId}`);
        await fetchChats();
      } else {
        router.replace(`?chat=${returnedChatId}`);
      }

      // Begin streaming assistant reply
      setIsStreaming(true);
      setConversation((prev) => [...prev, { role: "assistant", content: "" }]);
      let buffer = "";
      for await (const chunk of readStreamableValue(newMessage)) {
        buffer += chunk;
        setConversation((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: buffer };
          return copy;
        });
      }
      setIsStreaming(false);
    } catch (err) {
      console.error(err);
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error occurred. Please try again." },
      ]);
      setIsStreaming(false);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* ─── Enhanced Sidebar ───────────────────────── */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="border-r bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b bg-gradient-to-r from-slate-600 to-blue-600">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-slate-600" />
                  </div>
                  <h1 className="text-lg font-bold text-white">VercelBot</h1>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={() => {
                router.replace("/");
                setHasStartedChat(false);
                setConversation([]);
                setActiveChatId(null);
              }}
              className="w-full bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size={sidebarCollapsed ? "icon" : "default"}
            >
              <Plus className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-2">New Chat</span>}
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-hidden">
            {!sidebarCollapsed && (
              <div className="px-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <History className="w-4 h-4" />
                  <span>Recent Chats</span>
                </div>
              </div>
            )}

            <div
              className="h-full overflow-y-auto px-4 pb-4"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollTop + clientHeight >= scrollHeight - 10 && hasMoreChats) {
                  fetchChats(chatOffset);
                  setChatOffset((prev) => prev + 20);
                }
              }}
            >
              <div className="space-y-2">
                {allChats.map((c, index) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group relative p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:shadow-md",
                      c.id === activeChatId && "bg-gradient-to-r from-slate-100 to-blue-100 border border-blue-200 shadow-md"
                    )}
                    onClick={() => c.id !== activeChatId && loadChat(c.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {c.messages[0]?.content || "Untitled chat"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {c.messages.length} messages
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Hover Actions */}
                    {!sidebarCollapsed && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add delete functionality here
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-200"
                onClick={() => {/* Add settings */ }}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-200"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Enhanced Chat Area ──────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {hasStartedChat ? "VercelBot Assistant" : "Welcome to VercelBot"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isStreaming ? "Thinking..." : hasStartedChat ? "Ready to help" : "AI-powered development assistant"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 py-6">
            {hasStartedChat ? (
              isChatLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Bot className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <p className="text-sm text-gray-500">Loading your conversation...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {conversation.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn("flex items-start space-x-4", {
                        "flex-row-reverse space-x-reverse": msg.role === "user",
                      })}
                    >
                      {/* Avatar */}
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", {
                        "bg-gradient-to-r from-slate-600 to-blue-600": msg.role === "user",
                        "bg-gradient-to-r from-purple-500 to-pink-500": msg.role === "assistant",
                      })}>
                        {msg.role === "user" ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={cn("max-w-[80%] group", {
                        "flex flex-col items-end": msg.role === "user",
                        "flex flex-col items-start": msg.role === "assistant",
                      })}>
                        <div
                          className={cn("rounded-2xl px-4 py-3 shadow-sm", {
                            "bg-gradient-to-r from-slate-600 to-blue-600 text-white": msg.role === "user",
                            "bg-white border border-gray-200": msg.role === "assistant",
                          })}
                        >
                          <MessageParser content={msg.content} role={msg.role} />
                        </div>

                        {/* Message Actions */}
                        {msg.role === "assistant" && (
                          <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-gray-100"
                              onClick={() => {/* Copy functionality */ }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-green-100 hover:text-green-600"
                              onClick={() => {/* Thumbs up */ }}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                              onClick={() => {/* Thumbs down */ }}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center space-y-8 py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
                      Welcome to VercelBot! 🚀
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Your AI-powered development companion. Ask me anything about coding, deployment, or building modern web applications.
                    </p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  <AnimatePresence>
                    {prompts.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2, delay: i * 0.1 }}
                        onClick={() => handlePromptClick(prompt.text)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl",
                          "bg-white border border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="relative z-10">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r", prompt.gradient)}>
                              <div className="text-white">
                                {prompt.icon}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                {prompt.text}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {prompt.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Hover gradient effect */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                          prompt.gradient
                        )} />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-4">
            <div className="relative">
              <div className="flex items-end space-x-3 bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg hover:border-gray-300 focus-within:border-blue-500 transition-all duration-200">
                <div
                  contentEditable
                  role="textbox"
                  ref={inputRef}
                  data-placeholder="Ask me anything about development, deployment, or coding..."
                  onInput={(e) => setInput(e.currentTarget.textContent || "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 min-h-[24px] max-h-32 px-3 py-2 outline-none text-sm whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 overflow-y-auto resize-none"
                />
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={isSending || isChatLoading || !input.trim()}
                  className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUpIcon strokeWidth={2.5} className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Input hint */}
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}