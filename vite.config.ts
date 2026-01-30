import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

  build: {
    sourcemap: false, // client build
  },

  ssr: {
    sourcemap: false, // server build ← THIS is what you were missing
  },

  esbuild: {
    sourcemap: false, // extra safety (React Router uses esbuild internally)
  },
});
