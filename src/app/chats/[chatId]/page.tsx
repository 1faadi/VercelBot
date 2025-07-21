// src/app/chats/[chatId]/page.tsx
import { getChatById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { ChatMessageBubble } from "@/components/chat-message-bubble";
import { ContinueChatForm } from "@/components/continue-chat-form";

interface ChatPageProps {
  params: Promise<{ chatId: string }>;   // ✅ wrap in Promise
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;        // ✅ await the Promise

  const chat = await getChatById(chatId);
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

      <ContinueChatForm chatId={chatId} />
    </div>
  );
}