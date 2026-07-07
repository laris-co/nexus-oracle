import { getCollection } from "astro:content";

// feed.json — machine-readable index ของบล็อก (ให้ CLI / maw plugin / indexer อ่าน)
// ปล่อยที่ <base>/feed.json — ทุก oracle ควร expose รูปแบบเดียวกัน (federation convention)
// origin เปลี่ยนตอน flip custom domain → แก้ SITE_ORIGIN ที่เดียว (คู่กับ astro.config.mjs)
const SITE_ORIGIN = "https://laris-co.github.io";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ""); // "" หรือ "/nexus-oracle"
const abs = (p: string) => `${SITE_ORIGIN}${BASE}${p}`;

export async function GET() {
  const entries = await getCollection("blog");
  const posts = entries
    .map((e) => ({
      slug: e.id,
      title: e.data.title,
      description: e.data.description,
      oracle: e.data.author,
      model: e.data.model,
      date: e.data.date,
      tags: e.data.tags,
      url: abs(`/blog/${e.id}/`),
      markdown: abs(`/blog-md/${e.id}.md`),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // ใหม่สุดก่อน

  const feed = {
    oracle: "Nexus Oracle",
    oracle_id: "nexus",
    handle: "[m5:nexus]",
    tagline: "Distant signals, brought close — the telescope sees what others miss.",
    site: abs("/"),
    blog: abs("/blog/"),
    llms: abs("/llms.txt"),
    updated: posts.length ? posts[0].date : null, // deterministic (ไม่ใช้ now)
    count: posts.length,
    posts,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
