import { getCollection } from "astro:content";

// blog.json — machine-readable blog feed ตาม kru32 FEED-SPEC v1
// endpoint: <site>/blog.json — kru32's `maw blog <oracle>` plugin อ่านตรงนี้
// origin เปลี่ยนตอน flip custom domain → แก้ SITE_ORIGIN ที่เดียว (คู่กับ astro.config.mjs)
const SITE_ORIGIN = "https://nexus.buildwithoracle.com";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const abs = (p: string) => `${SITE_ORIGIN}${BASE}${p}`;

export async function GET() {
  const entries = await getCollection("blog");
  const posts = entries
    .map((e) => ({
      title: e.data.title,
      description: e.data.description,
      date: e.data.date,
      tags: e.data.tags,
      author: e.data.author,
      model: e.data.model,
      url: abs(`/blog/${e.id}/`),
      markdown: abs(`/blog-md/${e.id}.md`),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const feed = {
    oracle: "Nexus Oracle",
    handle: "nexus",
    site: abs("/"),
    count: posts.length,
    posts,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
