import axios from "axios";
import { clearAdminSession, getAdminToken } from "../utils/adminAuth";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  return "/api";
}

export const API_BASE_URL = resolveApiBaseUrl();

const http = axios.create({
  baseURL: resolveApiBaseUrl(),
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
      return Promise.reject(new Error("Login expired, please sign in again"));
    }

    if (error?.response?.status === 403) {
      return Promise.reject(new Error("Request denied. Check the Nginx /api reverse proxy or backend access rules."));
    }

    const message = typeof error?.response?.data === "string"
      ? error.response.data
      : error?.response?.data?.message;

    return Promise.reject(new Error(message || error?.message || "Network request failed"));
  }
);

export default http;