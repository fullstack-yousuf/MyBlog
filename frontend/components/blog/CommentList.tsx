"use client";
import React, { useState } from "react";
import { Comment } from "./types";

interface Props {
  comments: Comment[];
  onAdd: (text: string) => Promise<void>;
}

const CommentList: React.FC<Props> = ({ comments = [], onAdd }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(2);
  // console.log("asdf", comments);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onAdd(text);
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="space-y-4">
        {comments.slice(0, limit).map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl shadow-sm"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600   font-medium">
                {c.author?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>

            {/* Comment Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {(c.author as any)?.name || "Unknown User"}
                  </span>
                  {/* <small className="text-gray-500">
                        {(c.author as any)?.email || "No email"}
                      </small> */}
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(c.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-600 mt-1">{c.text}</p>
            </div>
          </div>
        ))}

        {/* See More Button */}
        {comments.length > limit && (
          <div className="flex justify-center">
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={() => setLimit((l) => l + 3)}
            >
              See more comments
            </button>
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div className="mt-4 flex gap-2 items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default CommentList;
