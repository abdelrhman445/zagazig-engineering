import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const TOKEN_COOKIE = "zd_token";

// ─── Axios Instance ───────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: Attach JWT from cookie ─────────────
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 globally ───────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stale token and redirect to home (not admin)
      Cookies.remove(TOKEN_COOKIE);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth Cookie Helpers ──────────────────────────────────────
export const saveToken = (token: string): void => {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: 7,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearToken = (): void => {
  Cookies.remove(TOKEN_COOKIE);
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE);
};

// ─── Types ────────────────────────────────────────────────────
export interface Link {
  _id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinksResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    links: Link[];
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// ─── Helper: Extract error message ───────────────────────────
export const extractError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.errors?.length) return data.errors.join(". ");
    if (data?.message) return data.message;
    if (err.message === "Network Error") return "Cannot reach the server. Is the API running?";
  }
  return "An unexpected error occurred.";
};

// ─── Public API Calls ─────────────────────────────────────────
export const fetchLinks = async (params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<LinksResponse["data"]> => {
  const res = await api.get<LinksResponse>("/links", { params });
  return res.data.data;
};

export const fetchCategories = async (): Promise<string[]> => {
  const res = await api.get<{ success: boolean; data: { categories: string[] } }>(
    "/links/categories"
  );
  return res.data.data.categories;
};

// ─── Admin API Calls ──────────────────────────────────────────
export const adminLogin = async (
  username: string,
  password: string
): Promise<{ token: string; admin: { id: string; username: string } }> => {
  const res = await api.post<{
    success: boolean;
    data: { token: string; admin: { id: string; username: string } };
  }>("/auth/login", { username, password });
  return res.data.data;
};

export const createLink = async (data: {
  title: string;
  url: string;
  category: string;
  description?: string;
}): Promise<Link> => {
  const res = await api.post<{ success: boolean; data: { link: Link } }>("/links", data);
  return res.data.data.link;
};

export const updateLink = async (
  id: string,
  data: Partial<{ title: string; url: string; category: string; description: string; isActive: boolean }>
): Promise<Link> => {
  const res = await api.put<{ success: boolean; data: { link: Link } }>(`/links/${id}`, data);
  return res.data.data.link;
};

export const deleteLink = async (id: string): Promise<void> => {
  await api.delete(`/links/${id}`);
};
