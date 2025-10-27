import { useEffect } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../lib/socket";
import { Comment, Post } from "@/components/blog/types";

// ---  Hook ---
export const useRealtimePosts = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    // if (typeof window === "undefined" || !socket?.connected) return;
if(!socket)return;
   
    const updateInfinitePosts = (updateFn: (post: Post) => Post) => {
      qc.getQueryCache()
        .getAll()
        .forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "posts-infinite") {
            qc.setQueryData(
              queryKey,
              (old: InfiniteData<{ data: Post[] }> | undefined) => {
                if (!old?.pages) return old;

                const updatedPages = old.pages.map((page) => {
                  const newData = page.data.map((post) => updateFn(post));
                  // ensure new array reference even if no changes
                  return { ...page, data: [...newData] };
                });

                return { ...old, pages: [...updatedPages] };
              }
            );
          }
        });
    };

    // ---  Like event ---
    const handleLikeUpdated = (data: {
      postId: string;
      likeCount: number;
      liked: boolean;
    }) => {
      updateInfinitePosts((post) =>
        post.id === data.postId
          ? { ...post, likeCount: data.likeCount, likedByUser: data.liked }
          : post
      );

      qc.setQueryData(["post", data.postId], (old: Post | undefined) =>
        old
          ? { ...old, likeCount: data.likeCount, likedByUser: data.liked }
          : old
      );
    };

    // ---  Comment event ---
    const handleCommentAdded = (data: { postId: string; comment: Comment }) => {
      updateInfinitePosts((post) =>
        post.id === data.postId
          ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
          : post
      );

      qc.setQueryData(["post", data.postId], (old: Post | undefined) => {
        if (!old) return old;
        const alreadyExists = old.comments?.some(
          (c) => c.id === data.comment.id
        );
        return {
          ...old,
          commentCount: (old.commentCount ?? 0) + 1,
          comments: alreadyExists
            ? old.comments
            : [...(old.comments ?? []), data.comment],
        };
      });
    };

    // ---  Post created event ---
    const handlePostCreated = (newPost: Post) => {
      qc.setQueriesData(
        { queryKey: ["posts-infinite"] },
        (old: InfiniteData<{ data: Post[] }> | undefined) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: [
              { ...old.pages[0], data: [newPost, ...old.pages[0].data] },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      qc.setQueryData(["myPosts"], (old: Post[] | undefined) =>
        Array.isArray(old) ? [newPost, ...old] : old
      );
    };

    // ---  Listen for socket events ---
    socket.on("post:likeUpdated", handleLikeUpdated);
    socket.on("post:commentAdded", handleCommentAdded);
    socket.on("post:created", handlePostCreated);

    // ---  Cleanup ---
    return () => {
      socket.off("post:likeUpdated", handleLikeUpdated);
      socket.off("post:commentAdded", handleCommentAdded);
      socket.off("post:created", handlePostCreated);
    };
  }, [qc]);
};