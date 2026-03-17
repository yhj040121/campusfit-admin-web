import axios from "axios";
import { clearAdminSession, getAdminToken } from "../utils/adminAuth";

const inferredHost = typeof window !== "undefined" && window.location && window.location.hostname
  ? window.location.hostname
  : "127.0.0.1";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${inferredHost}:8080`;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && payload.code === 0) {
      return payload.data;
    }
    return Promise.reject(new Error(payload?.message || "API returned an unexpected result"));
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearAdminSession();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired, please login again"));
    }
    return Promise.reject(new Error(error?.response?.data?.message || error?.message || "Network request failed"));
  }
);

export default http;