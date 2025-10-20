"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreatePost,
  useLikePost,
  usePosts,
  usePostFilters,
} from "../hooks/usePosts";
import { notify } from "../lib/notificationService";
import ProtectedRoute from "../components/header/ProcetedRoute";
import Modal from "../components/ui/Modal";
import PostCard from "../components/blog/PostCard";
import PostForm from "../components/blog/PostForm";
import { FilterBar } from "../components/ui/FilterBar";
import { useRealtimePosts } from "../hooks/useRealtimePosts";

const PostsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  useRealtimePosts(); // 👈 enables live updates

  // ✅ Clean filter logic
  const { filters, applyFilters, clearFilters, DEFAULT_FILTERS } =
    usePostFilters();

  const { data, isLoading } = usePosts({ page, limit: 5, ...filters });
  const create = useCreatePost();
  const like = useLikePost();
  console.log("page log data", data);

  const handleCreate = async (payload: { title: string; content: string }) => {
    try {
      console.log("paylog: ", payload);

      await create.mutateAsync(payload);
      notify("✅ Post created successfully", "success");
      setIsModalOpen(false);
      setPage(1);
    } catch {
      notify("❌ Create failed", "error");
    }
  };

  const handleLike = async (id: string) => {
    try {
      await like.mutateAsync(id);
      // notify("✅ Post created successfully", "success");
    } catch {
      notify("❌ Like failed", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
            <div className="flex gap-2">
              {/* <button
                onClick={() => setPage(1)}
                className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-100"
              >
                Refresh
              </button> */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + New Post
              </button>
            </div>
          </div>

          {/* Filters */}
          <FilterBar
            initialFilters={filters}
            onApply={(f) => {
              applyFilters(f);
              setPage(1);
            }}
            onClear={() => {
              clearFilters();
              setPage(1);
            }}
          />

          {/* Posts */}
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <p className="text-gray-500 text-center">Loading posts...</p>
            ) : data?.data?.length ? (
              data.data.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onLike={handleLike}
                  onOpen={(id) => router.push(`/posts/${id}`)}
                />
              ))
            ) : (
              <p className="text-gray-400 italic text-center">No posts yet.</p>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Prev
              </button>
              <div className="px-4 py-2 text-blue-700 font-medium">
                Page {data.pagination.page} / {data.pagination.pages}
              </div>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
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
