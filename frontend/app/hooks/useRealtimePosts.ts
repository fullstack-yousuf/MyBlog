import { useEffect } from "react";
import { getSocket } from "@/app/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

interface LikeUpdatedEvent {
  postId: string;
  userId: string;
  liked: boolean;
  likeCount: number;
}

interface CommentAddedEvent {
  postId: string;
  comment: {
    id: string;
    text: string;
    author: { id: string; name: string };
    createdAt: string;
  };
}

/**
 * React Query cache-aware real-time updates for posts.
 */
export const useRealtimePosts = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // ✅ Handle real-time like updates
    const handleLikeUpdated = (data: LikeUpdatedEvent) => {
      qc.setQueryData(["posts"], (old: any) => {
        if (!old || !old.posts) return old;

        return {
          ...old,
          posts: old.posts.map((p: any) =>
            p.id === data.postId
              ? { ...p, likeCount: data.likeCount }
              : p
          ),
        };
      });

      // Update a single post query if open
      qc.setQueryData(["post", data.postId], (old: any) =>
        old ? { ...old, likeCount: data.likeCount } : old
      );
    };

    // ✅ Handle real-time comment updates
    const handleCommentAdded = (data: CommentAddedEvent) => {
      qc.setQueryData(["posts"], (old: any) => {
        if (!old || !old.posts) return old;

        return {
          ...old,
          posts: old.posts.map((p: any) =>
            p.id === data.postId
              ? {
                  ...p,
                  commentCount: (p.commentCount ?? 0) + 1,
                  comments: [...(p.comments ?? []), data.comment],
                }
              : p
          ),
        };
      });

      // Update single post query
      qc.setQueryData(["post", data.postId], (old: any) =>
        old
          ? {
              ...old,
              commentCount: (old.commentCount ?? 0) + 1,
              comments: [...(old.comments ?? []), data.comment],
            }
          : old
      );
    };

    socket.on("post:likeUpdated", handleLikeUpdated);
    socket.on("post:commentAdded", handleCommentAdded);

    return () => {
      socket.off("post:likeUpdated", handleLikeUpdated);
      socket.off("post:commentAdded", handleCommentAdded);
    };
  }, [qc]);
};
