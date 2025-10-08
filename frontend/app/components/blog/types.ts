export interface UserRef {
  id?: string;
  name?: string;
  email?: string;
}

export interface Comment {
  id?: string;
  user: UserRef | string;
  text: string;
  createdAt?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: { id: string; name: string; email: string };
  authorName?: string;
  likeCount: number;
  likedByUser: boolean;
  likes: string[];
  commentCount?: number;
  comments?: {
    id: string; // ✅ Add this
    user: { id: string; name: string };
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}

// export interface Comment {
//   text: string;
//   user: { name: string };
// }

// export interface Post {
//   _id: string;
//   title: string;
//   content: string;
//   author: { name: string };
//   likes: string[];
//   comments: Comment[];
// }
