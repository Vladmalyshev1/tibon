import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { TLSSocket } from "node:tls";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const { INTERNAL_API_URL } = loadEnv(mode, root, "INTERNAL_API_URL");
  return {
    plugins: [tailwindcss(), reactRouter()],
    server: {
      proxy: {
        "/api/": {
          target: process.env.INTERNAL_API_URL || INTERNAL_API_URL || "http://127.0.0.1:8000",
          configure(proxy) {
            proxy.on("proxyReq", (outgoing, incoming) => {
              outgoing.setHeader("X-Forwarded-For", incoming.socket.remoteAddress ?? "");
              outgoing.setHeader("X-Forwarded-Proto", incoming.socket instanceof TLSSocket ? "https" : "http");
            });
          },
        },
      },
    },
  };
});
