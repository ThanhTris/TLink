import axios from "axios";
export async function getInfoUserById(userId: number) {
  return axios.get(`/api/users/${userId}`);
}