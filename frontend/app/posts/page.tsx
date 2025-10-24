"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/header/ProcetedRoute";
import Modal from "../../components/ui/Modal";
import PostCard from "../../components/blog/PostCard";
import PostForm from "../../components/blog/PostForm";
import { FilterBar } from "../../components/ui/FilterBar";
import { useInfinitePosts } from "../../hooks/useInfinitePosts";
import { useRealtimePosts } from "../../hooks/useRealtimePosts";
import { usePostFilters } from "../../hooks/usePostFilters";
import { useCreatePost, useLikePost } from "../../hooks/usePostMutations";
import { notify } from "../../lib/notificationService";

// ✅ Offline banner component
// const ConnectionBanner: React.FC = () => {
  // const [online, setOnline] = useState<boolean>(navigator.onLine);

  // useEffect(() => {
  //   const handleOnline = () => setOnline(true);
  //   const handleOffline = () => setOnline(false);
  //   window.addEventListener("online", handleOnline);
  //   window.addEventListener("offline", handleOffline);
  //   return () => {
  //     window.removeEventListener("online", handleOnline);
  //     window.removeEventListener("offline", handleOffline);
  //   };
  // }, []);

//   if (online) {
//     return (
//       <div className="fixed top-0 left-0 w-full bg-green-500 text-white text-center py-1 text-sm z-50 animate-fade-out">
//         ✅ Connected
//       </div>
//     );
//   } else {
//     return (
//       <div className="fixed top-0 left-0 w-full bg-yellow-600 text-white text-center py-1 text-sm z-50">
//         ⚠️ You’re offline — showing cached posts
//       </div>
//     );
//   }
// };

const PostsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useRealtimePosts(); // 👈 realtime updates
  const { filters, applyFilters, clearFilters } = usePostFilters();
  const create = useCreatePost();
  const like = useLikePost();

  // ✅ Use Infinite Query with offline-first mode
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfinitePosts({
    limit: 10,
    ...filters,
    // networkMode: "offlineFirst", // 👈 critical for PWA cache
  });

  // ✅ Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // ✅ Create Post Handler
  const handleCreate = async (payload: { title: string; content: string }) => {
    if (!navigator.onLine) {
      notify("⚠️ Cannot create posts while offline", "error");
      return;
    }

    try {
      await create.mutateAsync(payload);
      notify("✅ Post created successfully", "success");
      setIsModalOpen(false);
    } catch {
      notify("❌ Create failed", "error");
    }
  };

  // ✅ Like Post Handler
  const handleLike = async (id: string) => {
    if (!navigator.onLine) {
      notify("⚠️ Likes unavailable offline", "warning");
      return;
    }

    try {
      await like.mutateAsync(id);
    } catch {
      notify("❌ Like failed", "error");
    }
  };

  // ✅ Merge and deduplicate paginated posts
  const allPosts =
    data?.pages
      ?.flatMap((page) => page.data)
      ?.filter(
        (post, i, arr) => i === arr.findIndex((p) => p.id === post.id)
      ) ?? [];

  return (
    <ProtectedRoute>
      {/* <ConnectionBanner /> */}

      <div className="min-h-screen bg-gray-50 pt-6">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + New Post
            </button>
          </div>

          {/* Filters */}
          <FilterBar
            initialFilters={filters}
            onApply={(f) => applyFilters(f)}
            onClear={clearFilters}
          />

          {/* Posts list */}
          <div className="mt-6 space-y-4">
            {isLoading && (
              <p className="text-gray-500 text-center">Loading posts...</p>
            )}

            {!isLoading && allPosts.length === 0 && (
              <p className="text-gray-400 italic text-center">
                No posts available
              </p>
            )}

            {allPosts.map((post, index) => (
              <PostCard
                key={post.id ?? `post-${index}`}
                post={post}
                onLike={handleLike}
                onOpen={(id) => router.push(`/posts/${id}`)}
              />
            ))}
          </div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="h-12 flex items-center justify-center">
            {isFetchingNextPage && (
              <p className="text-gray-500 text-sm">Loading more...</p>
            )}
            {!hasNextPage && !isLoading && (
              <p className="text-gray-400 text-sm">No more posts</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Post"
      >
        <PostForm onSubmit={handleCreate} />
      </Modal>
    </ProtectedRoute>
  );
};

export default PostsPage;
// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";

// import { notify } from "../../lib/notificationService";
// import ProtectedRoute from "../../components/header/ProcetedRoute";
// import Modal from "../../components/ui/Modal";
// import PostCard from "../../components/blog/PostCard";
// import PostForm from "../../components/blog/PostForm";
// import { FilterBar } from "../../components/ui/FilterBar";
// import { useInfinitePosts } from "../../hooks/useInfinitePosts";
// import { useRealtimePosts } from "../../hooks/useRealtimePosts";
// import { usePostFilters } from "../../hooks/usePostFilters";
// import { useCreatePost, useLikePost } from "../../hooks/usePostMutations";

// const PostsPage: React.FC = () => {
//   const [page, setPage] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const router = useRouter();
//   useRealtimePosts(); // 👈 enables live updates

//   // ✅ Clean filter logic
//   const { filters, applyFilters, clearFilters, DEFAULT_FILTERS } =
//     usePostFilters();

//   const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
//     useInfinitePosts({ limit: 10, ...filters });

//   const create = useCreatePost();
//   const like = useLikePost();
//   console.log("page log data", data);

//   const loaderRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         const first = entries[0];
//         if (first.isIntersecting && hasNextPage) {
//           fetchNextPage();
//         }
//       },
//       { threshold: 1 }
//     );

//     const current = loaderRef.current;
//     if (current) observer.observe(current);
//     return () => {
//       if (current) observer.unobserve(current);
//     };
//   }, [hasNextPage, fetchNextPage]);

//   const handleCreate = async (payload: { title: string; content: string }) => {
//     try {
//       console.log("paylog: ", payload);

//       await create.mutateAsync(payload);
//       notify("✅ Post created successfully", "success");
//       setIsModalOpen(false);
//       setPage(1);
//     } catch {
//       notify("❌ Create failed", "error");
//     }
//   };

//   const handleLike = async (id: string) => {
//     try {
//       await like.mutateAsync(id);
//       // notify("✅ Post created successfully", "success");
//     } catch {
//       notify("❌ Like failed", "error");
//     }
//   };

//   const allPosts = data?.pages
//     ?.flatMap((page) => page.data)
//     ?.filter(
//       (post, index, self) => index === self.findIndex((p) => p.id === post.id)
//     );

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gray-50">
//         <div className="p-4 sm:p-6 max-w-3xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
//             <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 + New Post
//               </button>
//             </div>
//           </div>

//           {/* Filters */}
//           <FilterBar
//             initialFilters={filters}
//             onApply={(f) => {
//               applyFilters(f);
//               setPage(1);
//             }}
//             onClear={() => {
//               clearFilters();
//               setPage(1);
//             }}
//           />
//           <div className="mt-6 space-y-4">
//             {isLoading ? (
//               <p className="text-gray-500 text-center">Loading posts...</p>
//             ) : data?.pages?.length ? (
//               allPosts?.map((p, index) => (
//                 <PostCard
//                   key={p.id ?? `post-${index}`}
//                   // key={p.id}
//                   post={p}
//                   onLike={handleLike}
//                   onOpen={(id) => router.push(`/posts/${id}`)}
//                 />
//               ))
//             ) : (
//               <p className="text-gray-400 italic text-center">No posts yet.</p>
//             )}
//           </div>

//           {/* Infinite scroll loader */}
//           <div
//             ref={loaderRef}
//             className="h-12 flex items-center justify-center"
//           >
//             {isFetchingNextPage && (
//               <p className="text-gray-500 text-sm">Loading more...</p>
//             )}
//             {!hasNextPage && !isLoading && (
//               <p className="text-gray-400 text-sm">No more posts</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Create New Post"
//       >
//         <PostForm onSubmit={handleCreate} />
//       </Modal>
//     </ProtectedRoute>
//   );
// };

// export default PostsPage;
