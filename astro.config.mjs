import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";

import mdx from "@astrojs/mdx";

const sha = execSync("git rev-parse --short HEAD").toString().trim();
const ts = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ");

// GitHub Pages project site → served under /nexus-oracle/
// base ต้องตั้ง ไม่งั้น asset 404 ทั้งหน้า (กับดักคลาสสิก — ยืนยันจาก kru32)
export default defineConfig({
  site: "https://laris-co.github.io",
  base: "/nexus-oracle",
  integrations: [react(), sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __BUILD_VERSION__: JSON.stringify(`${sha} · ${ts}`),
    },
  },
});
