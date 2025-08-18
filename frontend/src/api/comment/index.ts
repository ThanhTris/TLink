import axios from "axios";

// Lấy danh sách comment dạng cây, truyền userId để backend trả về is_liked
export async function getCommentsTree(postId: number, userId?: number) {
  return axios.get("/api/comments/tree", {
    params: { postId, ...(userId ? { userId } : {}) },
  });
}

export async function addComment(
  postId: number,
  content: string,
  authorId: number,
  parentId?: number | null,
  mentionUserId?: number | null
) {
  return axios.post("/api/comments", {
    postId,
    authorId,
    parentId: parentId ?? null,
    content,
    mentionUserId: mentionUserId ?? null,
  });
}

export async function likeComment(commentId: number, likerId: number) {
  return axios.post(`/api/comments/${commentId}/like`, null, { params: { likerId } });
}

export async function unlikeComment(commentId: number, likerId: number) {
  return axios.post(`/api/comments/${commentId}/unlike`, null, { params: { likerId } });
}

export async function updateComment(
  commentId: number,
  authorId: number,
  content: string,
  mentionUserId?: number | null
) {
  return axios.put(
    `/api/comments/${commentId}`,
    {
      content,
      mentionUserId: mentionUserId ?? null,
    },
    { params: { authorId } }
  );
}

export async function deleteComment(commentId: number, authorId: number) {
  return axios.delete(`/api/comments/${commentId}`, { params: { authorId } });
}
