import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type ViteDevServer } from "vite";

function socketIOPlugin() {
  let started = false;
  return {
    name: "socket-io-dev",
    async configureServer(server: ViteDevServer) {
      if (started) return;
      started = true;

      const { createServer } = await import("node:http");
      const mod = await server.ssrLoadModule("$lib/server/socket/index");
      const httpServer = createServer();
      mod.initSocketServer(httpServer);
      httpServer.listen(3001, () => {
        console.log("[Vite] Socket.IO server listening on port 3001");
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
    }),
    socketIOPlugin(),
  ],
});
