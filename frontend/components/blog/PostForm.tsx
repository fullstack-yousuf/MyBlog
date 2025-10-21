"use client";
import React, { useState, FormEvent } from "react";

interface Props {
  initial?: { title?: string; content?: string };
  onSubmit: (data: { title: string; content: string }) => Promise<void> | void;
  submitLabel?: string;
}

const PostForm: React.FC<Props> = ({
  initial,
  onSubmit,
  submitLabel = "Create",
}) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [loading, setLoading] = useState(false);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, content });
      setTitle("");
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="bg-white shadow rounded p-4 mb-6">
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border p-2 rounded mb-2"
      />
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        className="w-full border p-2 rounded mb-2"
        rows={5}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default PostForm;
