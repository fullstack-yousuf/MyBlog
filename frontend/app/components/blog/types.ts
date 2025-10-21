
export interface Author {
  id: string;
  name: string;
  email?: string;
}

export interface Comment {
  id: string;
  author: Author;
  text: string;
  createdAt: string;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  comments:{
    id: string; // ✅ Add this
    author: { id: string; name: string };
    text: string;
    createdAt: string;
  }[];
  likedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PostListResponse {
  data: Post[];
  pagination: Pagination;
}
