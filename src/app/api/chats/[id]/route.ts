import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define the shape of context.params explicitly
interface Context {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: Context) {
  const chatId = context.params.id;

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("GET /api/chats/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
