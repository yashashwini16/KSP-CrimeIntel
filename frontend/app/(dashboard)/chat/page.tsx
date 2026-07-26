"use client";

import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col p-4 lg:p-6">
      <ChatWindow />
    </div>
  );
}
