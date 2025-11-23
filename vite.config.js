import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // alles wat begint met /ladyscan -> gaat door naar ladyscan.us
      "/ladyscan": {
        target: "https://ladyscan.us",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ladyscan/, ""),
      },
    },
  },
});
