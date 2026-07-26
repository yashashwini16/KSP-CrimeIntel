import axios, { type AxiosInstance } from "axios";
import { clearToken, getToken } from "./auth";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers["X-KSP-Authorization"] = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      // DO NOT REDIRECT! Let the component handle the error gracefully.
    }
    return Promise.reject(err);
  },
);

export default api;
