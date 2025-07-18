import { prisma } from "@/lib/prisma";

export async function getUserChats(userId: string) {
  return await prisma.chat.findMany({
    where: { userId },
    include: {
      messages: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}