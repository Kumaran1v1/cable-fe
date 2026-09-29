import axios from "axios";
import type { User } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("cable_auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  mobile?: string;
  companyName?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "";
  profileImage?: string;
  password?: string;
}

export const userService = {
  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<{ success: boolean; message: string; data: User }> => {
    const res = await api.put("/auth/profile", payload);
    return res.data;
  },
};

export default userService;
