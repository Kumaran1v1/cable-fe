import axios from "axios";
import type { DashboardSummaryData } from "../types/dashboard.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cable_auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardService = {
  getSummary: async (year?: string, month?: string): Promise<{ success: boolean; data: DashboardSummaryData }> => {
    const params: Record<string, string> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const res = await api.get("/dashboard/summary", { params });
    return res.data;
  },
};

export default dashboardService;
