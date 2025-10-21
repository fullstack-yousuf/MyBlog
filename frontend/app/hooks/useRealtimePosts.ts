import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/app/lib/socket";

export const useRealtimePosts = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const updateInfinitePosts = (updateFn: (post: any) => any) => {
      qc.getQueryCache()
        .getAll()
        .forEach(({ queryKey }) => {
          // Only update post lists
          if (queryKey[0] === "posts-infinite") {
            qc.setQueryData(queryKey, (old: any) => {
              if (!old?.pages) return old;

              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  data: page.data.map((post: any) =>
                    updateFn(post)
                  ),
                })),
              };
            });
          }
        });
    };

    // 🔥 Like event
    const handleLikeUpdated = (data: any) => {
      updateInfinitePosts((post) =>
        post.id === data.postId
          ? {
              ...post,
              likeCount: data.likeCount,
              likedByUser: data.liked,
            }
          : post
      );

      // Also update single post query if open
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

    // 💬 Comment event
    const handleCommentAdded = (data: any) => {
      updateInfinitePosts((post) =>
        post.id === data.postId
          ? {
              ...post,
              commentCount: (post.commentCount ?? 0) + 1,
            }
          : post
      );

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
// import { useEffect } from "react";
// import { getSocket } from "@/app/lib/socket";
// import { useQueryClient } from "@tanstack/react-query";

// export const useRealtimePosts = () => {
//   const qc = useQueryClient();

//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     const updateAllPostCaches = (updater: (page: any) => any) => {
//       qc.getQueryCache()
//         .getAll()
//         .forEach(({ queryKey }) => {
//           if (String(queryKey[0]).startsWith("posts")) {
//             qc.setQueryData(queryKey, (old: any) => {
//               if (!old) return old;
//               if (old.pages) {
//                 // handle infinite queries
//                 return {
//                   ...old,
//                   pages: old.pages.map((p: any) => updater(p)),
//                 };
//               }
//               // handle normal queries
//               return updater(old);
//             });
//           }
//         });
//     };

//     // ✅ Like event
//     const handleLikeUpdated = (data: any) => {
//       updateAllPostCaches((old: any) => {
//         if (!old?.data) return old;
//         return {
//           ...old,
//           data: old.data.map((p: any) =>
//             p.id === data.postId
//               ? { ...p, likeCount: data.likeCount, likedByUser: data.liked }
//               : p
//           ),
//         };
//       });

//       qc.setQueryData(["post", data.postId], (old: any) =>
//         old ? { ...old, likeCount: data.likeCount, likedByUser: data.liked } : old
//       );
//     };

//     // ✅ Comment event
//     const handleCommentAdded = (data: any) => {
//       updateAllPostCaches((old: any) => {
//         if (!old?.data) return old;
//         return {
//           ...old,
//           data: old.data.map((p: any) =>
//             p.id === data.postId
//               ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
//               : p
//           ),
//         };
//       });

//       qc.setQueryData(["post", data.postId], (old: any) =>
//         old
//           ? {
//               ...old,
//               commentCount: (old.commentCount ?? 0) + 1,
//               comments: old.comments?.some((c: any) => c.id === data.comment.id)
//                 ? old.comments
//                 : [...(old.comments ?? []), data.comment],
//             }
//           : old
//       );
//     };

//     socket.on("post:likeUpdated", handleLikeUpdated);
//     socket.on("post:commentAdded", handleCommentAdded);

//     return () => {
//       socket.off("post:likeUpdated", handleLikeUpdated);
//       socket.off("post:commentAdded", handleCommentAdded);
//     };
//   }, [qc]);
// };
