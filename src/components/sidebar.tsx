'use client';

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot, History, LogOut, MessageSquare, MoreHorizontal, Plus, Settings, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type Chat = {
  id: string;
  messages: { content: string }[];
};

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  allChats: Chat[];
  activeChatId: string | null;
  setActiveChatId: (id: string) => void;
  setConversation: (msgs: any[]) => void;
  setHasStartedChat: (val: boolean) => void;
  fetchChats: (offset?: number) => void;
  hasMoreChats: boolean;
  chatOffset: number;
  setChatOffset: (val: number) => void;
  loadChat: (id: string) => void;
}

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  allChats,
  activeChatId,
  setActiveChatId,
  setConversation,
  setHasStartedChat,
  fetchChats,
  hasMoreChats,
  chatOffset,
  setChatOffset,
  loadChat,
}: SidebarProps) {
  const router = useRouter();

  return (
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
              setActiveChatId('');
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
                setChatOffset(chatOffset + 20);
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
                    c.id === activeChatId &&
                      "bg-gradient-to-r from-slate-100 to-blue-100 border border-blue-200 shadow-md"
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

                  {!sidebarCollapsed && (
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Delete chat
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
              onClick={() => {}}
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
  );
}
