'use client';

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                "max-w-xl px-4 py-3 rounded-xl shadow-sm whitespace-pre-wrap",
                message.role === "user"
                  ? "ml-auto bg-blue-100 text-blue-900"
                  : "mr-auto bg-gray-100 text-gray-800"
              )}
            >
              {message.content}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mr-auto bg-gray-100 text-gray-500 px-4 py-3 rounded-xl shadow-sm max-w-xl"
          >
            Typing...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
