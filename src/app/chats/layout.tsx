import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserChats } from "@/lib/db/chats";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createNewChat } from "@/actions/create-chat";


export default async function ChatsLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await auth();
    const userId = session?.user?.id;
    const chats = userId ? await getUserChats(userId) : [];

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-muted p-4 hidden md:block overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Your Chats</h2>
                <form action={createNewChat}>
                    <Button type="submit" className="w-full mb-4">
                        + New Chat
                    </Button>
                </form>

                <div className="space-y-2">
                    {chats.map((chat) => (
                        <Link
                            key={chat.id}
                            href={`/chats/${chat.id}`}
                            className="block p-2 rounded hover:bg-muted-foreground/10 text-sm"
                        >
                            <div className="font-medium truncate">
                                {chat.messages[0]?.content.slice(0, 30) || "New chat"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(chat.createdAt).toLocaleDateString()}
                            </div>
                        </Link>
                    ))}
                </div>
            </aside>

            {/* Mobile Toggle */}
            <div className="md:hidden p-2 fixed top-2 left-2 z-10">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="sm" variant="outline">Chats</Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <div className="space-y-2 mt-4">
                            {chats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/chats/${chat.id}`}
                                    className="block p-2 rounded hover:bg-muted-foreground/10 text-sm"
                                >
                                    <div className="font-medium truncate">
                                        {chat.messages[0]?.content.slice(0, 30) || "New chat"}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
