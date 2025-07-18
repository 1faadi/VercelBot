"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";
import { Message as ChatMessage } from "@/components/ui/chatbot";

export const chat = async (
  history: ChatMessage[],
  chatId?: string
) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Not authenticated");

  let chatRecord;
  if (chatId) {
    // Append user message to existing chat
    await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content: history[history.length - 1].content,
      },
    });

    chatRecord = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chatRecord) {
      throw new Error("Chat not found");
    }
  } else {
    // Create new chat with full history
    chatRecord = await prisma.chat.create({
      data: {
        userId,
        messages: {
          create: history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      },
    });
  }

  // Stream assistant reply
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: gemini("gemini-1.5-flash"),
      messages: history,
    });

    let fullReply = "";

    for await (const chunk of textStream) {
      stream.update(chunk);
      fullReply += chunk;
    }

    // Save assistant's reply to chat
    await prisma.message.create({
      data: {
        chatId: chatRecord.id,
        role: "assistant",
        content: fullReply,
      },
    });

    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
    chatId: chatRecord.id,
  };
};
