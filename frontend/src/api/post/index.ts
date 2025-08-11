import axios from "axios";

export function getCurrentUserIdFromLocalStorage(): number | undefined {
  const tryRead = (raw: string | null): any | undefined => {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  };
  // Direct numeric keys
  const numericKeys = ["userId", "currentUserId"];
  for (const k of numericKeys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  // Common object keys
  const objectKeys = ["user", "auth", "currentUser", "account", "profile", "me"];
  for (const k of objectKeys) {
    const obj = tryRead(localStorage.getItem(k));
    const id =
      obj?.id ??
      obj?.user?.id ??
      obj?.data?.user?.id ??
      obj?.userId ??
      obj?.data?.userId;
    if (id !== undefined && !Number.isNaN(Number(id))) return Number(id);
  }
  // Fallback scan
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const obj = tryRead(localStorage.getItem(key));
    if (!obj || typeof obj !== "object") continue;
    const id =
      obj?.id ??
      obj?.user?.id ??
      obj?.data?.user?.id ??
      obj?.userId ??
      obj?.data?.userId;
    if (id !== undefined && !Number.isNaN(Number(id))) return Number(id);
  }
  return undefined;
}

export async function getPostsByCategory(categoryPath: string, limit: number = 10, offset: number = 0, userId?: number) {
  return axios.get("/api/posts/category", {
    params: {
      categoryPath,
      limit,
      offset,
      ...(userId ? { userId } : {}),
    },
  });
}

export async function likePost(postId: number, userId: number) {
  return axios.post(`/api/posts/${postId}/like`, null, { params: { userId } });
}

export async function unlikePost(postId: number, userId: number) {
  return axios.post(`/api/posts/${postId}/unlike`, null, { params: { userId } });
}

export async function getCommentCount(postId: number) {
  return axios.get(`/api/posts/${postId}/comment-count`);
}
