import axios from "axios";
import { clearAdminSession, getAdminToken } from "../utils/adminAuth";

const API_BASE_STORAGE_KEY = "campusfit_admin_base_url";
const DEFAULT_REMOTE_API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "https://admin.yuhaojie.cn";

let resolvedApiBaseUrl = "";
let resolvingApiBasePromise = null;

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function inBrowser() {
  return typeof window !== "undefined" && !!window.location;
}

function unique(list) {
  return list.filter((item, index) => item && list.indexOf(item) === index);
}

function getStoredApiBaseUrl() {
  if (!inBrowser()) {
    return "";
  }
  return normalizeBaseUrl(window.localStorage.getItem(API_BASE_STORAGE_KEY));
}

function setStoredApiBaseUrl(value) {
  if (!inBrowser()) {
    return;
  }

  if (value) {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, value);
    return;
  }

  window.localStorage.removeItem(API_BASE_STORAGE_KEY);
}

function buildApiBaseCandidates() {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  const storedBase = getStoredApiBaseUrl();
  const candidates = [storedBase, envBase];

  if (!inBrowser()) {
    candidates.push(DEFAULT_REMOTE_API_BASE);
    return unique(candidates);
  }

  const { hostname, origin, protocol } = window.location;
  const localCandidates = ["http://127.0.0.1:8080", "http://localhost:8080"];

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    localCandidates.push(`http://${hostname}:8080`);
  }

  candidates.push(origin);
  candidates.push(...localCandidates);

  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    candidates.push(`${protocol}//${hostname}:8080`);
    candidates.push("https://yuhaojie.cn");
  }

  candidates.push(DEFAULT_REMOTE_API_BASE);
  return unique(candidates.map(normalizeBaseUrl));
}

const probeClient = axios.create({
  timeout: 2200,
  headers: {
    "Content-Type": "application/json"
  }
});

async function probeApiBaseUrl(baseUrl) {
  await probeClient.get("/api/health", {
    baseURL: baseUrl,
    timeout: 1800
  });
  return baseUrl;
}

export function getResolvedApiBaseUrl() {
  return resolvedApiBaseUrl || getStoredApiBaseUrl() || DEFAULT_REMOTE_API_BASE;
}

export async function resolveApiBaseUrl(forceRefresh = false) {
  if (!forceRefresh && resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }

  if (!forceRefresh && resolvingApiBasePromise) {
    return resolvingApiBasePromise;
  }

  const candidates = buildApiBaseCandidates();
  resolvingApiBasePromise = (async () => {
    let lastError = null;

    for (const candidate of candidates) {
      try {
        const resolved = await probeApiBaseUrl(candidate);
        resolvedApiBaseUrl = resolved;
        setStoredApiBaseUrl(resolved);
        return resolved;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("未找到可用的青搭后端服务");
  })();

  try {
    return await resolvingApiBasePromise;
  } finally {
    resolvingApiBasePromise = null;
  }
}

function resetResolvedApiBaseUrl() {
  resolvedApiBaseUrl = "";
  setStoredApiBaseUrl("");
}

export const API_BASE_URL = DEFAULT_REMOTE_API_BASE;

const http = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use(async (config) => {
  config.baseURL = await resolveApiBaseUrl(false);

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
    return Promise.reject(new Error(payload?.message || "接口返回异常"));
  },
  async (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401) {
      clearAdminSession();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("登录状态已过期，请重新登录"));
    }

    if (!error?.response && originalRequest && !originalRequest.__retriedWithFreshBase) {
      originalRequest.__retriedWithFreshBase = true;
      try {
        originalRequest.baseURL = await resolveApiBaseUrl(true);
        return http(originalRequest);
      } catch (refreshError) {
        resetResolvedApiBaseUrl();
      }
    }

    return Promise.reject(new Error(error?.response?.data?.message || error?.message || "网络请求失败"));
  }
);

export default http;

