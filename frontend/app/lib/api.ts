import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // we use Authorization header (localStorage JWT)
});

// request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});
