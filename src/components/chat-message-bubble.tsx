export function ChatMessageBubble({
    role,
    content,
  }: {
    role: "user" | "assistant";
    content: string;
  }) {
    return (
      <div
        className={`p-3 rounded-lg max-w-[80%] ${
          role === "user"
            ? "ml-auto bg-blue-600 text-white"
            : "mr-auto bg-gray-200 text-black"
        }`}
      >
        {content}
      </div>
    );
  }
  