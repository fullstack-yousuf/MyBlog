import React from "react";
import ChatLayout from "../components/chat/ChatLayout";
import ProtectedRoute from "../components/header/ProcetedRoute";

const page = () => {
  return (
    <>
    <ProtectedRoute>

      <ChatLayout />
    </ProtectedRoute>
    </>
  );
};

export default page;
