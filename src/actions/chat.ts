"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { together } from "@/lib/together"; // Together SDK initialized here
import { createStreamableValue } from "ai/rsc";
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

    if (!chatRecord) throw new Error("Chat not found");
  } else {
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

  const stream = createStreamableValue();

  (async () => {
    try {
      const response = await together.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
      });
      
      

      let fullReply = "";

      for await (const token of response) {
        const chunk = token.choices[0]?.delta?.content ?? "";
        stream.update(chunk);
        fullReply += chunk;
      }

      await prisma.message.create({
        data: {
          chatId: chatRecord.id,
          role: "assistant",
          content: fullReply,
        },
      });

      stream.done();
    } catch (err) {
      stream.done(err);
    }
  })();

  return {
    messages: history,
    newMessage: stream.value,
    chatId: chatRecord.id,
  };
};
