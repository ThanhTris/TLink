import axios from "axios";

export async function getCommentsTree(postId: number) {
  return axios.get("/api/comments/tree", {
    params: { postId },
  });
}

export async function addComment(payload: {
  postId: number;
  userId: number;
  parentId?: number;
  content: string;
}) {
  return axios.post("/api/comments", payload);
}

export async function likeComment(commentId: number, userId: number) {
  return axios.post(`/api/comments/${commentId}/like`, null, { params: { userId } });
}

export async function unlikeComment(commentId: number, userId: number) {
  return axios.post(`/api/comments/${commentId}/unlike`, null, { params: { userId } });
}
