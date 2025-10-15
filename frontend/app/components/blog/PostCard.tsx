"use client";
import React, { useState, useCallback, memo } from "react";
import { Post } from "./types";
import CommentList from "./CommentList";
import { notify } from "@/app/lib/notificationService";
import { useComment } from "../../hooks/usePosts";
import {
  ChatBubbleBottomCenterTextIcon,
  EllipsisHorizontalCircleIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";

export interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  onOpen?: (id: string) => void;
  isMyPost?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onOpen,
  isMyPost,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const commentMutation = useComment();

  const handleAddComment = useCallback(
    async (text: string) => {
      try {
        await commentMutation.mutateAsync({ id: post.id, text });
        notify("✅ Comment added", "success");
        setShowComments(true);
      } catch {
        notify("❌ Failed to add comment", "error");
      }
    },
    [commentMutation, post.id]
  );

  const handleToggleExpand = useCallback(() => setExpanded((p) => !p), []);
  const handleToggleComments = useCallback(
    () => setShowComments((p) => !p),
    []
  );
  const handleLikeClick = useCallback(
    () => onLike?.(post.id),
    [onLike, post.id]
  );
  const handleOpen = useCallback(() => onOpen?.(post.id), [onOpen, post.id]);

  const truncatedContent =
    post.content.length > 200 && !expanded
      ? `${post.content.slice(0, 200)}...`
      : post.content;

  // ✅ Like count (safe)
  const likeCount = post.likeCount ?? 0;

  // ✅ Comment count works for BOTH feed and my blogs
  const commentCount =
    post.commentCount ??
    (Array.isArray(post.comments)
      ? post.comments.filter((c) => c && (c as any).id != null).length
      : 0);

  return (
    <article className="bg-white shadow rounded-xl border border-gray-200 p-4 sm:p-6 transition hover:shadow-md">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            {post.author?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {post.author?.name ?? "Anonymous"}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          aria-label="More options"
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          …
        </button>
      </header>

      {/* Content */}
      <section className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed mb-3">
        {truncatedContent}
        {post.content.length > 200 && (
          <button
            onClick={handleToggleExpand}
            className="text-blue-600 ml-1 hover:underline text-sm"
          >
            {expanded ? "Show less" : "See more"}
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-3 border-t border-gray-200 pt-2 text-sm text-gray-600">
        <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
          <span>
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
          <span>
            {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-around text-gray-600 font-medium border-t border-gray-100 pt-2">
          {isMyPost ? (
            <button
              onClick={handleOpen}
              className="flex items-center gap-1 hover:text-blue-600 transition"
            >
              <EllipsisHorizontalCircleIcon className="size-5" />
              Open
            </button>
          ) : (
            <>
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1 transition ${
                  post.likedByUser
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <HandThumbUpIcon className="size-5" />
                {post.likedByUser ? "Liked" : "Like"}
              </button>

              <button
                onClick={handleToggleComments}
                className="flex items-center gap-1 hover:text-blue-600 transition"
              >
                <ChatBubbleBottomCenterTextIcon className="size-5" />
                Comment
              </button>

              <button
                onClick={handleOpen}
                className="flex items-center gap-1 hover:text-blue-600 transition"
              >
                <EllipsisHorizontalCircleIcon className="size-5" />
                Open
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Comment list (only for feed) */}
      {!isMyPost && showComments && (
        <div className="mt-4">
          <CommentList
            comments={
              Array.isArray(post.comments)
                ? post.comments.filter((c) => c && (c as any).id != null)
                : []
            }
            onAdd={handleAddComment}
          />
        </div>
      )}
    </article>
  );
};

export default memo(PostCard);
