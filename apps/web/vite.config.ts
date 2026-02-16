import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
    }),
  ],
  server: {
    fs: {
      // allows serving files from monorepo root
      allow: ["../.."],
    },
  },
  optimizeDeps: {
    // tells vite to process as source code, not dep
    exclude: ["@transc/ui"],
  },
});
