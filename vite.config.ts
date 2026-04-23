import { defineConfig } from "vite";

const repoBase = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: repoBase,
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
