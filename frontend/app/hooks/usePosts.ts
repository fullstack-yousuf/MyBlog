// src/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Post, PostListResponse } from "../components/blog/types";
import { getSocket } from "../lib/socket";

// --------------------
// 🔹 TYPES
// --------------------
export type SortField = "createdAt" | "likes";
export type SortOrder = "ASC" | "DESC";

export interface PostsParams {
  page?: number;
  limit?: number;
  sortBy?: SortField;
  order?: SortOrder;
}

// --------------------
// 🔹 QUERIES
// --------------------

// interface SomeUpdateType {
//   postId: string;
//   type: 'like' | 'comment' | 'postCreated';
//   likeCount?: number;
//   commentCount?: number;
// }
// export const usePosts = (params: PostsParams = {}) => {
//   const { page = 1, limit = 5, sortBy = "createdAt", order = "DESC" } = params;

//   const socket = getSocket();
//   const queryClient = useQueryClient();
//   const newUpdatesQueue = useRef([]);

//   const queryKey = ["posts", page, limit, sortBy, order];

//   const { data, isFetching, ...queryRest } = useQuery<PostListResponse>({
//     queryKey,
//     queryFn: async () => {
//       const res = await api.get<PostListResponse>("/posts", {
//         params: { page, limit, sortBy, order },
//       });
//       return res.data;
//     },
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     placeholderData: (prev) => prev,
//   });

//   useEffect(() => {
//     if (!socket) return;

//     const handleUpdate = (update) => {
//       if (isFetching) {
//         newUpdatesQueue.current.push(update);
//       } else {
//         queryClient.setQueryData(queryKey, (oldData) => updatePosts(oldData, update));
//       }
//     };

//     socket.on("postLiked", handleUpdate);
//     socket.on("commentAdded", handleUpdate);

//     if (!isFetching && newUpdatesQueue.current.length) {
//       queryClient.setQueryData(queryKey, (oldData) =>
//         newUpdatesQueue.current.reduce((data, update) => updatePosts(data, update), oldData),
//       );
//       newUpdatesQueue.current = [];
//     }

//     return () => {
//       socket.off("postLiked", handleUpdate);
//       socket.off("commentAdded", handleUpdate);
//     };
//   }, [socket, isFetching, queryClient, queryKey]);

//   return { data, isFetching, ...queryRest };
// };

// function updatePosts(
//   oldData: PostListResponse,
//   update: SomeUpdateType
// ): PostListResponse {
//   const updatedPosts = oldData.data.map((post) => {
//     if (post.id === update.postId) {
//       switch (update.type) {
//         case 'like':
//           return { ...post, likeCount: update.likeCount ?? post.likeCount };
//         case 'comment':
//           return { ...post, commentCount: update.commentCount ?? post.commentCount };
//         default:
//           return post;
//       }
//     }
//     return post;
//   });

//   return { ...oldData, data: updatedPosts };
// }

export const usePosts = (params: PostsParams = {}) => {
  const { page = 1, limit = 5, sortBy = "createdAt", order = "DESC" } = params;
  // console.log(params);

  return useQuery<PostListResponse>({
    queryKey: ["posts", page, limit, sortBy, order],
    queryFn: async () => {
      const res = await api.get<PostListResponse>("/posts", {
        params: { page, limit, sortBy, order },
      });
      console.log("log the res", res.data);

      return res.data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    placeholderData: (prev) => prev,
  });
};

export const usePost = (id: string) =>
  useQuery<Post>({
    enabled: !!id, // ✅ don't fetch if id missing
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await api.get<Post>(`/posts/${id}`);
      return res.data;
    },
  });

export const useMyPosts = () =>
  useQuery<Post[]>({
    queryKey: ["myPosts"],
    queryFn: async () => {
      const res = await api.get<Post[]>("/posts/my");
      return res.data;
    },
  });

// --------------------
// 🔹 MUTATIONS
// --------------------
export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; content: string }) =>
      api.post("/posts", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content?: string;
    }) =>
      api.patch(`/posts/${data.id}`, {
        title: data.title,
        content: data.content,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["post", vars.id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
};

export const useLikePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.post(`/posts/${id}/like`),
    onSuccess: (_, id) => {
      // 🎯 Only invalidate affected post + list
      qc.invalidateQueries({ queryKey: ["post", id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; text: string }) =>
      api.post(`/posts/${payload.id}/comment`, { text: payload.text }),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ["post", payload.id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// export const useComment = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: async (payload: { id: string; text: string }) =>
//       api.post(`/posts/${payload.id}/comment`, { text: payload.text }),
//     onSuccess: (_, payload) => {
//       qc.invalidateQueries({ queryKey: ["post", payload.id] });
//       qc.invalidateQueries({ queryKey: ["posts"] });
//       qc.invalidateQueries({ queryKey: ["myPosts"] });
//     },
//   });
// };

// --------------------
// 🔹 FILTER HOOK
// --------------------
export interface FilterState {
  sortBy: SortField;
  order: SortOrder;
}

const DEFAULT_FILTERS: FilterState = {
  sortBy: "createdAt",
  order: "DESC",
};

export function usePostFilters(initial?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const applyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, applyFilters, clearFilters, DEFAULT_FILTERS };
}