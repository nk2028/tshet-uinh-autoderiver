import react from "@vitejs/plugin-react";

import type { UserConfig } from "vite";

const base = "/tshet-uinh-autoderiver/";

export function makeConfig(assetLocation = base) {
  if (!assetLocation.endsWith("/")) {
    assetLocation += "/";
  }
  return {
    plugins: [
      react({
        babel: {
          plugins: ["@emotion"],
        },
      }),
    ],
    base,
    define: {
      // For showing the version number on the page
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    build: {
      target: "esnext",
      chunkSizeWarningLimit: 8192,
      outDir: "build",
    },
    experimental: {
      renderBuiltUrl(filename, type) {
        //console.log("#[", filename, type, "]#");
        if (type.hostId === "index.html") {
          // Rewrite asset URL in index.html
          return assetLocation + filename;
        } else {
          // Use relative paths in other assets
          return { relative: true };
        }
      },
    },
  } satisfies UserConfig;
}

export default makeConfig();
