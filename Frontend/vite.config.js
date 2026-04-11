import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("firebase")) {
            return "firebase";
          }

          if (id.includes("@monaco-editor") || id.includes("monaco-editor")) {
            return "monaco";
          }

          if (
            id.includes("react-markdown") ||
            id.includes("@uiw/react-markdown-preview") ||
            id.includes("/remark-") ||
            id.includes("/rehype-") ||
            id.includes("/micromark") ||
            id.includes("/mdast-") ||
            id.includes("/unified/")
          ) {
            return "markdown";
          }

          if (id.includes("react-webcam") || id.includes("react-hook-speech-to-text")) {
            return "media";
          }

          if (
            id.includes("@radix-ui") ||
            id.includes("@heroui") ||
            id.includes("@heroicons") ||
            id.includes("lucide-react") ||
            id.includes("motion")
          ) {
            return "ui-vendor";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react-core";
          }
        },
      },
    },
  },
});
