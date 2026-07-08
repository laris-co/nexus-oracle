import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";

import mdx from "@astrojs/mdx";

const sha = execSync("git rev-parse --short HEAD").toString().trim();
const ts = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ");

// custom domain → served at root /
// เดิม: base "/nexus-oracle" สำหรับ GitHub project site
// flip: base "/" + site = custom domain (CNAME ชี้มาจาก Cloudflare DNS)
export default defineConfig({
  site: "https://nexus.buildwithoracle.com",
  base: "/",
  integrations: [react(), sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __BUILD_VERSION__: JSON.stringify(`${sha} · ${ts}`),
    },
  },
});
