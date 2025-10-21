export type SortField = "createdAt" | "likes";
export type SortOrder = "ASC" | "DESC";

// --------------------
// 🔹 FILTER HOOK
// --------------------
export interface FilterState {
  sortBy: SortField;
  order: SortOrder;
}

export interface PostsParams {
  page?: number;
  limit?: number;
  sortBy?: SortField;
  order?: SortOrder;
}

export interface CommentPayload {
  postId: string;
  text: string;
}

export interface CommentResponse {
  postId: string;
  comment: {
    id: string;
    text: string;
    author: { id: string; name: string };
    createdAt: string;
  };
  commentCount?: number;
}
