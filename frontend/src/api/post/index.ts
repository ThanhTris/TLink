import axios from "axios";

export const getCurrentUserIdFromLocalStorage = (): number | null => {
  try {
    // 1) First try to get from "user" key (main login storage)
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const userData = JSON.parse(userRaw);
        if (userData?.id != null) {
          const id = Number(userData.id);
          return Number.isFinite(id) ? id : null;
        }
      } catch {
        // ignore JSON parse errors
      }
    }

    // 2) Fallback: Try other direct ID keys
    const directKeys = ["user_id", "currentUserId", "uid", "id"];
    for (const key of directKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed != null) {
          const id = Number(parsed);
          if (Number.isFinite(id)) return id;
        }
      } catch {
        // If not JSON, treat as direct string/number
        const id = Number(raw);
        if (Number.isFinite(id)) return id;
      }
    }

    // 3) Fallback: Try other user object keys
    const objectKeys = ["currentUser", "auth", "profile", "account", "me"];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        const candidateId = obj?.id ?? obj?.user?.id ?? obj?.data?.id;
        if (candidateId != null) {
          const id = Number(candidateId);
          if (Number.isFinite(id)) return id;
        }
      } catch {
        // ignore JSON parse errors
      }
    }

    return null;
  } catch (error) {
    console.warn("Error getting user ID from localStorage:", error);
    return null;
  }
};

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
