import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "./queryKeys";
import { CommentPayload, CommentResponse } from "./type";
// --------------------
// 🔹 MUTATION HELPERS
// --------------------
const rollbackQueries = (qc: any, ctx: any, id?: string) => {
  ctx?.prevInfinite?.forEach(([key, data]: [string[], any]) =>
    qc.setQueryData(key, data)
  );
  if (ctx?.prevSingle && id) qc.setQueryData(queryKeys.single(id), ctx.prevSingle);
};
// --------------------
// 🔹 CREATE / UPDATE / DELETE POST
// --------------------
export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn:async (payload: { title: string; content: string }) =>
      api.post("/posts", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.all });
      qc.invalidateQueries({ queryKey: queryKeys.infinite });
      qc.invalidateQueries({ queryKey: queryKeys.mine });
    },
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async({ id, ...data }: { id: string; title?: string; content?: string }) =>
      api.patch(`/posts/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.single(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.all });
      qc.invalidateQueries({ queryKey: queryKeys.mine });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn:async (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.all });
      qc.invalidateQueries({ queryKey: queryKeys.mine });
    },
  });
};

// --------------------
// 🔹 LIKE POST
// --------------------
export const useLikePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{liked:boolean}>(`/posts/${id}/like`);
      // console.log("this is a like opost",res);
      
      return {
        postId: id,
        liked: res.data?.liked ?? true,
        // likeCount: res.data?.likeCount ?? null,
      };
    },

    // ⚡ Optimistic update
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.infinite });
      await qc.cancelQueries({ queryKey: queryKeys.single(id) });

      const prevInfinite = qc.getQueriesData({ queryKey: queryKeys.infinite });
      const prevSingle = qc.getQueryData(queryKeys.single(id));

      const toggleLike = (post: any) => ({
        ...post,
        likedByUser: !post.likedByUser,
        likeCount: (post.likeCount ?? 0) + (post.likedByUser ? -1 : 1),
      });

      qc.setQueriesData({ queryKey: queryKeys.infinite }, (old: any) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((p: any) => ({
                ...p,
                data: p.data.map((post: any) =>
                  post.id === id ? toggleLike(post) : post
                ),
              })),
            }
          : old
      );

      qc.setQueryData(queryKeys.single(id), (old: any) =>
        old ? toggleLike(old) : old
      );

      return { prevInfinite, prevSingle };
    },

    onError: (err, id, ctx) => {
      console.error("❌ Like failed:", err);
      rollbackQueries(qc, ctx, id);
    },

    onSuccess: (data, id) => {
      const { liked } = data;
      const applyServerUpdate = (post: any) => ({
        ...post,
        likedByUser: liked,
        // likeCount: likeCount ?? post.likeCount ?? 0,
      });

      qc.setQueriesData({ queryKey: queryKeys.infinite }, (old: any) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((p: any) => ({
                ...p,
                data: p.data.map((post: any) =>
                  post.id === id ? applyServerUpdate(post) : post
                ),
              })),
            }
          : old
      );

      qc.setQueryData(queryKeys.single(id), (old: any) =>
        old ? applyServerUpdate(old) : old
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mine });
      qc.invalidateQueries({ queryKey: queryKeys.infinite });
    },
  });
};

// --------------------
// 🔹 COMMENT POST
// --------------------
export const useComment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: CommentPayload) => {
      const res = await api.post<CommentResponse>(`/posts/${postId}/comment`, { text });
      return res.data;
    },

    onMutate: async ({ postId, text }) => {
      await qc.cancelQueries({ queryKey: queryKeys.infinite });
      await qc.cancelQueries({ queryKey: queryKeys.single(postId) });

      const prevInfinite = qc.getQueriesData({ queryKey: queryKeys.infinite });
      const prevSingle = qc.getQueryData(queryKeys.single(postId));

      const tempComment = {
        id: `temp-${Date.now()}`,
        text,
        author: { id: "me", name: "You" },
        createdAt: new Date().toISOString(),
      };

      const appendComment = (post: any) => ({
        ...post,
        commentCount: (post.commentCount ?? 0) + 1,
        comments: [...(post.comments ?? []), tempComment],
      });

      qc.setQueriesData({ queryKey: queryKeys.infinite }, (old: any) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((p: any) => ({
                ...p,
                data: p.data.map((post: any) =>
                  post.id === postId ? appendComment(post) : post
                ),
              })),
            }
          : old
      );

      qc.setQueryData(queryKeys.single(postId), (old: any) =>
        old ? appendComment(old) : old
      );

      return { prevInfinite, prevSingle };
    },

    onError: (err, { postId }, ctx) => {
      console.error("❌ Comment failed:", err);
      rollbackQueries(qc, ctx, postId);
    },

    onSuccess: ({ postId, comment, commentCount }) => {
      const applyServerComment = (post: any) => ({
        ...post,
        commentCount: commentCount ?? post.commentCount ?? 0,
        comments: [
          ...(post.comments ?? []).filter((c: any) => !c.id.startsWith("temp-")),
          comment,
        ],
      });

      qc.setQueriesData({ queryKey: queryKeys.infinite }, (old: any) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((p: any) => ({
                ...p,
                data: p.data.map((post: any) =>
                  post.id === postId ? applyServerComment(post) : post
                ),
              })),
            }
          : old
      );

      qc.setQueryData(queryKeys.single(postId), (old: any) =>
        old ? applyServerComment(old) : old
      );
    },

    onSettled: (_, __, { postId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.single(postId) });
    },
  });
};