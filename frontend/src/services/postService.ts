export const postService = {
  async addLike(postId: number, userId: number) {
    // Simulated API call
    return { success: true };
  },
  async addComment(postId: number, content: string, userId: number) {
    // Simulated API call
    return { id: Date.now(), content, userId, createdAt: new Date() };
  },
};