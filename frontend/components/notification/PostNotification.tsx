"use client";
import { useEffect } from "react";
import { getSocket } from "../../lib/socket";
import { notify } from "../../lib/notificationService";

const PostNotification = () => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    // Generic notification
    const handleNotification = (msg: string) => {
      notify(msg, "info");
    };

    // Blog events
    const handlePostCreated = (data: any) => {
      notify(`New post: ${data?.title || "Untitled"}`, "success");
    };

    const handlePostLiked = (data: any) => {
      console.log("coming data for like", data);

      notify(` ${data?.user?.name || "Someone"} liked a post`, "default");
    };

    const handlePostCommented = (data: any) => {
      console.log("coming data for commnet", data);

      notify(
        `💬 ${data?.user?.name || "Someone"} commented: ${data?.comment}`,
        "warning"
      );
    };

    socket.on("newNotification", handleNotification);
    socket.on("post_created", handlePostCreated);
    socket.on("post_liked", handlePostLiked);
    socket.on("post_commented", handlePostCommented);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("post_created", handlePostCreated);
      socket.off("post_liked", handlePostLiked);
      socket.off("post_commented", handlePostCommented);
    };
  }, []);

  return null; // no UI, just background listener
};

export default PostNotification;
