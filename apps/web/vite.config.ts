import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const workspaceRoot = resolve(
    fileURLToPath(new URL(".", import.meta.url)),
    "../.."
  );
  const env = loadEnv(mode, workspaceRoot, "");

  return {
    envDir: workspaceRoot,
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:3001",
          changeOrigin: true
        }
      }
    }
  };
});
