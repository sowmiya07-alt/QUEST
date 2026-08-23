import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/QUEST": {
        target: "https://nexus-production-7fa0.up.railway.app",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
