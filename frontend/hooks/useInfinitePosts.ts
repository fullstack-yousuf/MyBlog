import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PostListResponse } from "../components/blog/types";

type PostsParams = {
  limit?: number;
  sortBy?: "createdAt" | "likes";
  order?: "ASC" | "DESC";
};

export const useInfinitePosts = (params: PostsParams = {}) => {
  const { limit = 10, sortBy = "createdAt", order = "DESC" } = params;

  return useInfiniteQuery<PostListResponse>({
    queryKey: ["posts-infinite", limit, sortBy, order],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<PostListResponse>("/posts", {
        params: { page: pageParam, limit, sortBy, order },
      });
      return res.data;
    },
    // required by @tanstack/query types when using infinite queries
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const next =
        lastPage.pagination.page < lastPage.pagination.pages
          ? lastPage.pagination.page + 1
          : undefined;
      return next;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
  });
};
