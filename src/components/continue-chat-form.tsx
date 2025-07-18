"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContinueChatForm({ chatId }: { chatId: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/chat/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    setMessage("");
    setLoading(false);
    router.refresh(); // Refresh page to see new message
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border rounded"
        placeholder="Type a reply..."
      />
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "..." : "Send"}
      </button>
    </form>
  );
}
