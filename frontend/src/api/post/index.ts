import axios from "axios";


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

export async function getCommentCount(postId: number, userId?: number) {
  return axios.get(`/api/posts/${postId}/comment-count`, {
    params: userId ? { userId } : {},
  });
}

export async function createPost(data: {
  title: string;
  content: string;
  authorId: number;
  parentTagName: string; // Updated to match backend parameter
  childTags?: string[];
}) {
  return axios.post("/api/posts", {
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    parentTag: data.parentTagName, // Updated to match backend parameter
    // Always send childTags as an array (can be empty) to avoid backend null handling issues
    childTags: Array.isArray(data.childTags) ? data.childTags : [],
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

export async function updatePost(
  postId: number,
  data: {
    title: string;
    content: string;
    authorId?: number;
    parentTagName?: string; // Updated to match backend parameter
    childTags?: string[];
  }
) {
  return axios.put(`/api/posts/${postId}`, {
    title: data.title,
    content: data.content,
    ...(data.authorId ? { authorId: data.authorId } : {}),
    ...(data.parentTagName ? { parentTag: data.parentTagName } : {}), // Updated to match backend parameter
    // Always include childTags (possibly empty array)
    childTags: Array.isArray(data.childTags) ? data.childTags : [],
  });
}

export async function deletePost(postId: number) {
  return axios.delete(`/api/posts/${postId}`);
}

export async function searchPosts(keyword: string, limit: number = 10, offset: number = 0, userId?: number) {
  return axios.get("/api/posts/search", {
    params: {
      keyword,
      limit,
      offset,
      ...(userId ? { userId } : {}),
    },
  });
}

// API lấy tổng số bài viết cho home/popular
export async function countPostsHomePopular() {
  return axios.get("/api/posts/count/home-popular");
}

// API lấy tổng số bài viết đã lưu của user
export async function countPostsSaved(userId: number) {
  return axios.get("/api/posts/count/saved", { params: { userId } });
}

// API lấy tổng số bài viết theo tag cha
export async function countPostsByParentTag(parentTag: string) {
  return axios.get("/api/posts/count/parent-tag", { params: { parentTag } });
}

// API lấy tổng số bài viết theo tag con
export async function countPostsByChildTag(childTag: string) {
  return axios.get("/api/posts/count/child-tag", { params: { childTag } });
}

// API lấy tổng số bài viết theo từ khóa tìm kiếm
export async function countPostsBySearch(keyword: string) {
  return axios.get("/api/posts/count/search", { params: { keyword } });
}

// API lấy bài viết đề xuất cho user (recommend)
export async function getRecommendedPosts(userId?: number, limit: number = 5, offset: number = 0) {
  return axios.get("/api/posts/recommend", {
    params: {
      userId,
      limit,
      offset,
    },
  });
}

// Không cần sửa gì ở đây
