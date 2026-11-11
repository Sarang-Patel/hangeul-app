import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `npm run dev` serves the React app on :5173 and forwards /api to the Node server on :3000.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3000" } },
  build: { outDir: "dist" },
});
