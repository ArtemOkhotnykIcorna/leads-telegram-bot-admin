import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React и связанные библиотеки
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // UI библиотеки
          "ui-vendor": ["react-hot-toast", "react-hook-form"],
          // Данные и запросы
          "data-vendor": ["@tanstack/react-query", "axios"],
          // Графики и аналитика
          "charts-vendor": ["recharts"],
          // Утилиты
          "utils-vendor": ["zustand", "clsx", "date-fns"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
