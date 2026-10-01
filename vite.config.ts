import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import { isAllowedGreenBase } from "./api/allowed-host";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const greenApiDevProxy = (): Plugin => ({
  name: "green-api-dev-proxy",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const requestUrl = req.url ?? "";
      if (!requestUrl.startsWith("/api/green/")) {
        next();
        return;
      }

      const baseHeader = req.headers["x-green-base"];
      const base = (Array.isArray(baseHeader) ? baseHeader[0] : baseHeader)?.replace(
        /\/+$/,
        "",
      );

      if (!base || !isAllowedGreenBase(base)) {
        res.statusCode = 400;
        res.end("Недопустимый адрес GREEN-API");
        return;
      }

      const incoming = new URL(requestUrl, "http://localhost");
      const target = new URL(
        `${base}${incoming.pathname.replace(/^\/api\/green/, "")}${incoming.search}`,
      );
      const chunks: Buffer[] = [];

      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const body = Buffer.concat(chunks);
      const hasBody = req.method !== "GET" && req.method !== "HEAD" && body.length > 0;
      const upstream = await fetch(target, {
        method: req.method,
        headers: {
          Accept: "application/json",
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
        },
        body: hasBody ? body : undefined,
      });
      const text = await upstream.text();
      const contentType = upstream.headers.get("content-type");

      res.statusCode = upstream.status;
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.end(text);
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), greenApiDevProxy()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
