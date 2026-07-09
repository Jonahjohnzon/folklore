/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// ── Create instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FORUM_API,
  withCredentials: true, // sends the httpOnly auth cookie automatically
});

// ── Request interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use((config: any) => {
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

  if (!isFormData) {
    config.headers["Content-Type"] = config.headers["Content-Type"] ?? "application/json";
  }
  config.headers["accept"] = "application/json";
  return config;
});

const AUTH_ACTION_PATHS = [
  "/api/pages/auth/login",
  "/api/pages/auth/register",
  "/api/pages/auth/google",
  "/api/pages/auth/apple",
];


// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (!error.response) {
      return Promise.reject("Network error. Check your connection.");
    }

    const { status } = error.response;
    const requestUrl: string = error.config?.url ?? "";
    const message: string = error.response.data?.error.message ?? error.message;


    switch (status) {
      case 401: {
        const isAuthAction = AUTH_ACTION_PATHS.some((path) => requestUrl.includes(path));
        if (isAuthAction) {
         
          // Wrong credentials on login/register/social sign-in — let the form show the message
          return Promise.reject(message);
        }
        // Any other 401 = an expired/invalid session on a protected route
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
        return Promise.reject("Session expired. Please log in again.");
      }

      case 403:
        return Promise.reject("You do not have permission to do that.");

      case 404:
        return Promise.reject("Not found.");

      case 422:
        return Promise.reject(error.response.data?.error);

      case 429:
        return Promise.reject("Too many requests. Slow down.");

      case 500:
        return Promise.reject("Server error. Try again later.");

      default:
        return Promise.reject(message);
    }
  }
);
// ── Types ─────────────────────────────────────────────────────────────────────
interface RequestOptions extends AxiosRequestConfig {
  params?: Record<string, unknown>;
}

// ── API core class ────────────────────────────────────────────────────────────
export default class ApiClient {

  // GET /endpoint?params
  async get<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
    const response = await api.get<T>(endpoint, { params, withCredentials: true });
    return response.data;
  }

  // POST /endpoint — create
  async post<T>(endpoint: string, body: unknown = {}, options?: RequestOptions): Promise<T> {
    const response = await api.post<T>(endpoint, body, { ...options, withCredentials: true });
    return response.data;
  }

  // PUT /endpoint — full replace
  async put<T>(endpoint: string, body: unknown = {}): Promise<T> {
    const response = await api.put<T>(endpoint, body, { withCredentials: true });
    return response.data;
  }

  // PATCH /endpoint — partial update
  async patch<T>(endpoint: string, body: unknown = {}): Promise<T> {
    const response = await api.patch<T>(endpoint, body, { withCredentials: true });
    return response.data;
  }

  // DELETE /endpoint
  async delete<T>(endpoint: string): Promise<T> {
    const response = await api.delete<T>(endpoint, { withCredentials: true });
    return response.data;
  }

}