// components/chat/MessageBubble.tsx
"use client";

type Props = {
  text: string;
  sender: "me" | "other";
};

export default function MessageBubble({ text, sender }: Props) {
  const isMe = sender === "me";
  return (
    <div
      className={`max-w-sm px-4 py-2 rounded-lg whitespace-pre-wrap break-all ${
        isMe
          ? "ml-auto bg-blue-500 text-white"
          : "mr-auto bg-gray-200 text-black"
      }`}
    >
      {text}
    </div>
  );
}
