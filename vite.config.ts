import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Ordo marketing site: TanStack Start on Node (Nitro), server-rendered.
// The dashboard is a separate app on its own domain (APP_URL); Django is a
// separate service the server fetches from (API_URL). Server-side env comes
// from the process in production; in dev, .env.development fills it in.
// Dev: http://localhost:3001 (the dashboard runs on :3000).
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""), process.env);
  return {
    plugins: [tailwindcss(), tanstackStart(), nitro(), react()],
    resolve: {
      alias: { "@": new URL("./src", import.meta.url).pathname },
    },
    server: { port: 3001 },
  };
});
