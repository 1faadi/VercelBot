'use client';

import React from "react";
import { Bot, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface ChatHeaderProps {
  hasStartedChat: boolean;
  isStreaming: boolean;
}

export default function ChatHeader({ hasStartedChat, isStreaming }: ChatHeaderProps) {
  return (
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
              {isStreaming
                ? "Thinking..."
                : hasStartedChat
                  ? "Ready to help"
                  : "AI-powered development assistant"}
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
  );
}
