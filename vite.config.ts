import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@emotion"],
      },
    }),
  ],
  base: "/qieyun-autoderiver/",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    chunkSizeWarningLimit: 10240,
    outDir: "build",
  },
});
