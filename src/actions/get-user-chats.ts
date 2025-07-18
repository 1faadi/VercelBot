"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getUserChats = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    // include: {
    //   messages: {
    //     take: 1, // Only show last message
    //     orderBy: { createdAt: "desc" },
    //   },
    // },
  });

  return chats;
};
