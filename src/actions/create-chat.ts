'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createNewChat() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const chat = await prisma.chat.create({
    data: {
      userId,
      messages: {
        create: [
          {
            role: "user",
            content: "New chat started...",
          },
        ],
      },
    },
  });

  redirect(`/chats/${chat.id}`);
}
