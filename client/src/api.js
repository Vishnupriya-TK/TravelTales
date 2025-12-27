import axios from "axios";
//Axiox instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // change if deployed
});

// Add a request interceptor to include token in headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

//API calls
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getUser = () => API.get("/auth/me");

export const fetchStories = (params = {}) =>
  API.get("/stories", { params });

export const fetchStory = (id) =>
  API.get(`/stories/${id}`);

export const createStory = (data) =>
  API.post("/stories", data);

export const updateStory = (id, data) =>
  API.put(`/stories/${id}`, data);

export const deleteStory = (id) =>
  API.delete(`/stories/${id}`);

export const toggleLike = (id) =>
  API.put(`/stories/like/${id}`);

export const removeLikeByOwner = (storyId, userId) =>
  API.put(`/stories/${storyId}/remove-like/${userId}`);

export const addComment = (storyId, text) =>
  API.post(`/stories/comment/${storyId}`, { text });

export const deleteComment = (storyId, commentId) =>
  API.delete(`/stories/comment/${storyId}/${commentId}`);

// Utility function to decode JWT and get user ID

export function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded?.id || null;
  } catch (error) {
    console.error("Token decode failed", error);
    return null;
  }
}

export default API;
