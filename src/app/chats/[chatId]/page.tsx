// ❌ Do NOT use 'use client' here

import { getChatById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { ChatMessageBubble } from "@/components/chat-message-bubble";
import { ContinueChatForm } from "@/components/continue-chat-form";

interface ChatPageProps {
  params: { chatId: string };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const chat = await getChatById(params.chatId); // ✅ This is safe in server component

  if (!chat) return notFound();

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {chat.messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            role={msg.role as "user" | "assistant"}
            content={msg.content}
          />
        ))}
      </div>

      <ContinueChatForm chatId={params.chatId} />
    </div>
  );
}
