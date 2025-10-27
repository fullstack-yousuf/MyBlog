"use client";

import React, { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/header/ProcetedRoute";

import PostCard from "../../../components/blog/PostCard";
import PostForm from "../../../components/blog/PostForm";
import { notify } from "../../../lib/notificationService";
import type { Post } from "../../../components/blog/types";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Banner from "../../../components/ui/Banner";
import { useAuth } from "../../../context/AuthContext";
import { useMyPosts } from "../../../hooks/usePostQuries";
import {
  useDeletePost,
  useLikePost,
  useUpdatePost,
} from "../../../hooks/usePostMutations";

const page: React.FC = () => {
  const userid = useAuth();
  // console.log("the useris ",userid);

  const router = useRouter();
  const { data: posts = [], isLoading } = useMyPosts();
  // console.log("thi sis the ", posts);

  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const likePost = useLikePost();
  // const createPost = useCreatePost();

  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // 🔹 Delete Post
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this post?")) return;
      try {
        await deletePost.mutateAsync(id);
        notify("✅ Post deleted", "success");
      } catch {
        notify("❌ Failed to delete post", "error");
      }
    },
    [deletePost]
  );

  // 🔹 Update Post
  const handleUpdate = useCallback(
    async (payload: { title: string; content: string }) => {
      if (!editingPostId) return;
      try {
        // console.log("payload in update: ", payload);
        await updatePost.mutateAsync({ id: editingPostId, ...payload });
        setEditingPostId(null);
        notify("✅ Post updated", "success");
      } catch {
        notify("❌ Failed to update post", "error");
      }
    },
    [updatePost, editingPostId]
  );

  // 🔹 Like Post (not used here, but kept for reuse)
  const handleLike = useCallback(
    async (id: string) => {
      try {
        await likePost.mutateAsync(id);
      } catch {
        notify("❌ Failed to like post", "error");
      }
    },
    [likePost]
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="p-6 max-w-4xl mx-auto">
          <Banner
            title="My Blogs"
            subtitle="Please wait"
            imageSrc="/img/bg1.jpg" // use your uploaded image in /public/
          />

          {/* <h1 className="text-3xl font-bold mb-6 text-blue-700">My Blogs</h1> */}
          <p className="text-gray-500">Loading your posts...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <Banner
          title="My Blogs"
          description=" Select a post below to edit or delete."
          imageSrc="/img/bg1.jpg" // use your uploaded image in /public/
        />

        {/* Edit Form */}
        {editingPostId ? (
          <div className="mb-6 bg-white shadow rounded-lg p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Edit Post
            </h2>
            <PostForm
              initial={posts.find((p) => p.id === editingPostId)}
              onSubmit={handleUpdate}
              submitLabel="Update"
            />
            <button
              onClick={() => setEditingPostId(null)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="italic text-gray-600">Select a post below...</p>
        )}

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: Post) => (
              <div
                key={post.id}
                className="bg-white shadow-sm rounded-xl border border-gray-100 p-5 hover:shadow-md transition"
              >
                <PostCard
                  key={post.id}
                  post={post}
                  onOpen={(id) => router.push(`/posts/${id}`)}
                  isMyPost // ✅ only show "Open" button inside PostCard
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setEditingPostId(post.id)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
                  >
                    <PencilSquareIcon className="size-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven’t created any posts yet.</p>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default memo(page);
