// central query key constants to avoid typos

export const queryKeys = {
  all: ["posts"] as const,
  infinite: ["posts-infinite"] as const,
  single: (id: string) => ["post", id] as const,
  mine: ["myPosts"] as const,
};
