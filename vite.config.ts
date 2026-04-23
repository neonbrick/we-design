import { defineConfig } from "vite";

const rawBase = process.env.VITE_BASE_PATH ?? "/";
const repoBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export default defineConfig({
  base: repoBase,
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
