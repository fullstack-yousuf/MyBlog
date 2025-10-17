
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
// export interface Post {
//   id: string;
//   title: string;
//   content: string;
//   author: Author;
//   likeCount: number;
//   likedByUser: boolean;
//   likes: { id: number; userId: number }[];
//   commentCount: number;
//   comments: Comment[];
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Post {
//   id: string;
//   title: string;
//   content: string;
//   author: { id: string; name: string; email: string };
//   authorName?: string;
//   likeCount: number;
//   likedByUser: boolean;
//   likes: string[];
//   commentCount?: number;
//   comments?: {
//     id: string; // ✅ Add this
//     author: { id: string; name: string };
//     text: string;
//     createdAt: string;
//   }[];
//   createdAt: string;
//   updatedAt: string;
// }

//
// export interface PostListResponse {
//   posts: Post[];
//   total: number;
//   page: number;
//   pages: number;
// }
// export interface PostListResponse  {
//   data: Post[];
//   meta: {
//     total: number;
//     page: number;
//     limit: number;
//     pages: number;
//   };
// };

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
