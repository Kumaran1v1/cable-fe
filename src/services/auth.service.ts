import api from "./api";

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authService = {
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await api.post<LogoutResponse>("/auth/logout");
      return response.data;
    } catch {
      // Fallback to fetch if axios baseUrl or interceptor is configured differently
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        return await res.json();
      } catch {
        return { success: true, message: "Logged out locally" };
      }
    }
  },
};

export default authService;
