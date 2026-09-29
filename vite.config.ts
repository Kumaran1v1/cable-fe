import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl =
    env.VITE_API_BASE_URL ||
    env.VITE_LOCAL_API_URL ||
    env.VITE_API_URL ||
    "http://localhost:5000";

  const port = Number(process.env.PORT) || 5173;

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port,
      allowedHosts: true,
    },
  };
});
