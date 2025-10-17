// app/posts/[id]/page.tsx

"use client";

import React from "react";
import { usePost, useComment, useLikePost } from "../../hooks/usePosts";
import CommentList from "../../components/blog/CommentList";
import { notify } from "../../lib/notificationService";
import ProtectedRoute from "@/app/components/header/ProcetedRoute";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import Banner from "@/app/components/ui/Banner";


const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } =React.use(params);

  const { data: post, isLoading } = usePost(id);
  const comment = useComment();
  const like = useLikePost();
console.log("asdfwerwe",post);

  const handleAddComment = async (text: string) => {
    try {
      await comment.mutateAsync({ id, text });
      // notify("✅ Comment added", "success");
    } catch {
      notify("❌ Failed to add comment", "error");
    }
  };

  const handleLike = async () => {
    try {
      await like.mutateAsync(id);
      // notify("👍 Post liked", "success");
    } catch {
      notify("❌ Like failed", "error");
    }
  };

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!post) return <p className="text-red-500">Post not found</p>;

  return (
          <ProtectedRoute>
      <div className="p-6 max-w-3xl mx-auto">
        {/* ✅ Modern Reusable Banner */}
        <Banner
          title={post.title}
          subtitle={`By ${post.author.name || "Anonymous"}`}
          description={new Date(post.createdAt).toLocaleString()}
          imageSrc="/img/bg2.jpg"
        />

        {/* ✅ Post Content */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </p>

          {/* ✅ Like Section */}
          <div className="mt-6 flex justify-between items-center rounded-lg p-3 bg-blue-50">
            <span className="text-gray-700 font-medium">
              {post.likeCount || 0}{" "}
              {post.likeCount === 1 ? "Like" : "Likes"}
            </span>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition font-medium ${
                post.likedByUser
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <HandThumbUpIcon className="size-5" />
              {post.likedByUser ? "Liked" : "Like"}
            </button>
          </div>
        </div>

        {/* ✅ Comments */}
        <div className="mt-8">
          <CommentList
            comments={post.comments || []}
            onAdd={handleAddComment}
          />
        </div>
      </div>
    </ProtectedRoute>
    
  );
};

export default page;
