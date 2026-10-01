import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    proxy: {
      "/green-api": {
        target: "https://api.greenapi.com",
        changeOrigin: true,
        timeout: 70_000,
        proxyTimeout: 70_000,
        rewrite: (requestPath) => requestPath.replace(/^\/green-api/, ""),
      },
    },
  },
});
