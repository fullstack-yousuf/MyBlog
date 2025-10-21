import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Post, PostListResponse } from "../components/blog/types";
import { queryKeys } from "./queryKeys";
// import { PostsParams } from "./type";


// --------------------
// 🔹 API HELPERS
// --------------------
// const fetchPosts = async (params: PostsParams): Promise<PostListResponse> => {
//   const res = await api.get<PostListResponse>("/posts", { params });
//   return res.data;
// };

const fetchPost = async (id: string): Promise<Post> => {
  const res = await api.get<Post>(`/posts/${id}`);
  return res.data;
};

// --------------------
// 🔹 QUERIES
// --------------------

export const usePost = (id: string) =>
  useQuery<Post>({
    enabled: !!id,
    queryKey: queryKeys.single(id),
    queryFn: () => fetchPost(id),
  });

export const useMyPosts = () =>
  useQuery<Post[]>({
    queryKey: queryKeys.mine,
    queryFn: async () => (await api.get<Post[]>("/posts/my")).data,
  });
