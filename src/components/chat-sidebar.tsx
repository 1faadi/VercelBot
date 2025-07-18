"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserChats } from "@/actions/get-user-chats";

export default function ChatSidebar() {
  const [chats, setChats] = useState<any[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    fetch("/api/chats")
      .then((res) => res.json())
      .then(setChats);
  }, []);
  

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${open ? "w-64" : "w-0 overflow-hidden"} bg-muted h-screen shadow-lg`}>
        <div className="p-4 font-semibold border-b flex justify-between items-center">
          <span>Conversations</span>
          <button onClick={() => setOpen(false)}>❌</button>
        </div>
        <ul className="divide-y text-sm">
          {chats.map((chat) => (
            <li key={chat.id}>
              <Link href={`/chats/${chat.id}`} className="block p-3 hover:bg-muted-foreground/10">
                <div className="font-medium truncate">
                  {chat.messages[0]?.content.slice(0, 30) || "New Chat"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-muted rounded-full shadow-md"
        >
          📂
        </button>
      )}
    </div>
  );
}
