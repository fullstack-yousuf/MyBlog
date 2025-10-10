// src/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PostListResponse } from "../components/blog/types";
import { Post } from "../components/blog/types";
import { useCallback, useState } from "react";

export type PostsParams = {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "likes";
  order?: "asc" | "desc";
};
export const usePosts = (params: PostsParams = {}) => {
  const { page = 1, limit = 5, sortBy = "createdAt", order = "desc" } = params;

 return useQuery<PostListResponse>({
    queryKey: ["posts", page, limit, sortBy, order],
    queryFn: async (): Promise<PostListResponse> => {
      const res = await api.get<PostListResponse>("/posts", {
        params: { page, limit, sortBy, order },
      });
      return res.data; // ✅ TS now knows this is PostListResponse
    },
    placeholderData: (prev) => prev,
  });
};

export const usePost = (id: string) => {
  console.log("hook id: ",id);
  
  return useQuery<Post>({
    queryKey: ["post", id],
    queryFn: async () => {

      const res = await api.get(`/posts/${id}`);
      console.log(res);
      
      return res.data as Post;

    },
  });
};

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
    mutationFn: async (data: { id: string; title?: string; content?: string }) => {
      return api.put(`/posts/${data.id}`, {
        title: data.title,
        content: data.content,
      });
    },
    onSuccess: (_, vars) => {
      // ✅ v5 invalidate syntax
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", vars.id] });
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

// 🔥 Like / Unlike Post
export const useLikePost = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => api.post(`/posts/${id}/like`),
      onSuccess: (_, id) => {
qc.invalidateQueries({ queryKey: ["posts"] });
        qc.invalidateQueries({ queryKey: ["post", id] });
        qc.invalidateQueries({ queryKey: ["myPosts"] });
      },
    });
  };

// 🔥 Comment on Post
export const useComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; text: string }) =>
      api.post(`/posts/${payload.id}/comment`, { text: payload.text }),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ["post", payload.id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
};

// my posts
export const useMyPosts = () => {
  return useQuery<Post[]>({
    queryKey: ["myPosts"],
    queryFn: async () => {
      const res = await api.get("/posts/my");
      console.log(res.data);
      
      return res.data as Post[];  
    },
  });
};



export type FilterState = Pick<PostsParams, "sortBy" | "order">;

const DEFAULT_FILTERS: FilterState = {
  sortBy: "createdAt",
  order: "desc",
};


export function usePostFilters(initial?: FilterState) {
  const [filters, setFilters] = useState<FilterState>(initial || DEFAULT_FILTERS);

  const applyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, applyFilters, clearFilters, DEFAULT_FILTERS };
}