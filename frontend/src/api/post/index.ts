import axios from "axios";

export const getCurrentUserIdFromLocalStorage = (): number | null => {
  // Chỉ lấy id từ localStorage key "user"
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return null;
    const userData = JSON.parse(userRaw);
    if (userData?.id != null) {
      const id = Number(userData.id);
      return Number.isFinite(id) ? id : null;
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

export async function createPost(data: {
  title: string;
  content: string;
  authorId: number;
  tagParent: string;
  childTags?: string[];
}) {
  return axios.post("/api/posts", {
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    parentTag: data.tagParent,
    // Đảm bảo childTags luôn là mảng hoặc undefined (không null)
    ...(Array.isArray(data.childTags) && data.childTags.length > 0 ? { childTags: data.childTags } : {}),
  });
}

export async function uploadPostImage(postId: number, file: File, caption?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  return axios.post(`/api/posts/${postId}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function uploadPostFile(postId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`/api/posts/${postId}/upload-file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function savePost(postId: number, userId: number) {
  return axios.post(`/api/posts/${postId}/save`, null, { params: { userId } });
}

export async function unsavePost(postId: number, userId: number) {
  return axios.post(`/api/posts/${postId}/unsave`, null, { params: { userId } });
}
