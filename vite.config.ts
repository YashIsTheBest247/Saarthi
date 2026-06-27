import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Express API runs on :8787. We proxy /api there during dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5179,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
