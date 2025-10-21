"use client";
import { useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useAuth } from "../../context/AuthContext";

type Chat = {
  id: string;
  participants: { id: string; name: string; email: string }[];
  lastMessage?: string;
  unread?: number;
};

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string>(""); // ✅ store chat object

console.log("the active chat0" ,activeChat);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      {/* Chat Container */}
      <div className="flex w-full max-w-6xl h-[80vh] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white border-r border-gray-300 shadow-lg 
            transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-1/4
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {
           
            <ChatSidebar
              onClose={() => setSidebarOpen(false)}
              onSelectChat={(chat) => {
                setActiveChat(chat);
                setSidebarOpen(false);
              }}
              activeChat={activeChat || null}
            />
          }
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Mobile top bar */}
          <div className="md:hidden p-3 border-b bg-white flex items-center">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h1 className="ml-3 font-semibold">Chat</h1>
          </div>

          {/* Show chat window only if a chat is selected */}
          {activeChat ? (
            <ChatWindow
              // userId={"68d687f15d47cf7f5f5004da"}//asdf
              // userId={"68d691651a5098a0cbce170c"}//yousud
              // userId={user?.id || ""} //active user id
              chatId={activeChat} // ✅ pass full chat object
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
