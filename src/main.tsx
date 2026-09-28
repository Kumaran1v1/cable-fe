import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeContextProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Backend API URL - sanitize to prevent duplicate /api
const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;

// Global fetch interceptor: resolve /api/ against backend URL, append JWT & handle 401 Session Expiration
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem("token");
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.href
      : input.url;

  const isApi = urlStr.startsWith("/api/") || urlStr.includes("/api/");

  let targetInput = input;
  if (isApi) {
    if (typeof input === "string" && input.startsWith("/api/")) {
      targetInput = `${API_BASE_URL}${input}`;
    }
    if (token) {
      init = init || {};
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await originalFetch(targetInput, init);

  // If response is 401 Unauthorized (and not login attempt), session has expired
  if (response.status === 401 && !urlStr.includes("/api/auth/login")) {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("auth-session-expired"));
    }
  }

  return response;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
