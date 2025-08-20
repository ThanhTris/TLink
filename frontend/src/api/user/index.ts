import axios from "axios";

export async function getInfoUserById(userId: number) {
  return axios.get(`/api/users/${userId}`);
}

export async function getUserPosts(userId: number, limit: number = 10, offset: number = 0) {
  return axios.get(`/api/users/${userId}/posts`, {
    params: { limit, offset }
  });
}

export async function updateUser(userId: number, data: any) {
  return axios.put(`/api/users/${userId}`, data);
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string, confirmPassword: string) {
  return axios.put(`/api/users/${userId}/password`, {
    currentPassword,
    newPassword,
    confirmPassword,
  });
}