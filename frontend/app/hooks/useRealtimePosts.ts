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
// useRealtimePosts.ts
export const useRealtimePosts = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // ✅ Like event
    const handleLikeUpdated = (data: LikeUpdatedEvent) => {
      qc.setQueryData(["posts"], (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map((p: any) =>
            p.id === data.postId
              ? {
                  ...p,
                  likeCount: data.likeCount,
                  likedByUser:
                    p.likedByUser !== undefined ? data.liked : p.likedByUser,
                }
              : p
          ),
        };
      });

      qc.setQueryData(["post", data.postId], (old: any) =>
        old
          ? {
              ...old,
              likeCount: data.likeCount,
              likedByUser: data.liked,
            }
          : old
      );
    };

    // ✅ Comment event
    const handleCommentAdded = (data: CommentAddedEvent) => {
      qc.setQueryData(["posts"], (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map((p: any) =>
            p.id === data.postId
              ? {
                  ...p,
                  commentCount: (p.commentCount ?? 0) + 1,
                }
              : p
          ),
        };
      });

      qc.setQueryData(["post", data.postId], (old: any) =>
        old
          ? {
              ...old,
              commentCount: (old.commentCount ?? 0) + 1,
              comments: old.comments?.some((c: any) => c.id === data.comment.id)
                ? old.comments
                : [...(old.comments ?? []), data.comment],
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
