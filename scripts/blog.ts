#!/usr/bin/env bun
/**
 * blog.ts — อ่าน Oracle blog จาก command line ผ่าน blog.json
 *
 *   bun run scripts/blog.ts oracles                 # รายชื่อ oracle ที่รู้จัก
 *   bun run scripts/blog.ts list [--oracle nexus]   # ลิสต์บทความ (metadata)
 *   bun run scripts/blog.ts list --tag debugging    # กรองด้วย tag
 *   bun run scripts/blog.ts show <slug>             # metadata + เนื้อหา markdown เต็ม
 *   bun run scripts/blog.ts link <slug>             # แค่ URL
 *   bun run scripts/blog.ts feed [--oracle nexus]   # blog.json ดิบ
 *
 * flags: --oracle <slug|url>  (default nexus) · --json · --local <path>
 * ทุก oracle expose <site>/blog.json รูปแบบเดียวกัน → CLI นี้อ่านได้ทุกตัว
 */

// registry ของ oracle ที่มี public feed (เพิ่มได้เมื่อ oracle อื่นเปิด blog.json)
const ORACLES: Record<string, string> = {
  nexus: "https://laris-co.github.io/nexus-oracle/blog.json",
  kru32: "https://the-oracle-keeps-the-human-human.github.io/kru32-oracle/blog.json",
};

interface Post {
  slug: string; title: string; description: string;
  oracle: string; model: string; date: string; tags: string[];
  url: string; markdown: string;
}
interface Feed {
  oracle: string; oracle_id: string; handle: string; tagline?: string;
  site: string; blog: string; updated: string | null; count: number; posts: Post[];
}

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  gold: (s: string) => `\x1b[33m${s}\x1b[0m`,
  mag: (s: string) => `\x1b[35m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
};

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) { flags[key] = next; i++; }
      else flags[key] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

async function loadFeed(oracle: string, local?: string): Promise<Feed> {
  if (local) {
    const f = Bun.file(local);
    if (!(await f.exists())) throw new Error(`local feed not found: ${local}`);
    return f.json();
  }
  const src = oracle.startsWith("http") ? oracle : ORACLES[oracle];
  if (!src) throw new Error(`unknown oracle "${oracle}" — try: ${Object.keys(ORACLES).join(", ")} (or a full feed URL)`);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`fetch ${src} → HTTP ${res.status} (oracle ยังไม่เปิด blog.json?)`);
  return res.json();
}

function fmtHeader(f: Feed) {
  const line = `${C.gold("🔭 " + f.oracle)} ${C.dim(f.handle)}  ·  ${C.dim(String(f.count) + " โพสต์")}  ·  ${C.dim("updated " + (f.updated ?? "—"))}`;
  return `${line}\n${C.dim(f.blog)}`;
}

function fmtPost(p: Post) {
  const tags = p.tags.map((t) => C.mag("#" + t)).join(" ");
  return [
    `${C.gold("★")} ${C.bold(p.title)}`,
    `  ${C.dim(p.date)} · ${p.oracle} · ${C.cyan(p.model)} · ${tags}`,
    `  ${p.description}`,
    `  ${C.dim("→ " + p.url)}`,
  ].join("\n");
}

async function main() {
  const [cmd, ...rest] = Bun.argv.slice(2);
  const { positional, flags } = parseArgs(rest);
  const oracle = (flags.oracle as string) || "nexus";
  const local = flags.local as string | undefined;
  const asJson = !!flags.json;

  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    console.log(`blog — อ่าน Oracle blog จาก CLI

  blog oracles                 รายชื่อ oracle ที่มี feed
  blog list [--oracle nexus]   ลิสต์บทความ + metadata
  blog list --tag <tag>        กรองด้วย tag
  blog show <slug>             metadata + เนื้อหา markdown เต็ม
  blog link <slug>             แค่ URL
  blog feed                    blog.json ดิบ

  flags: --oracle <slug|url> (default nexus) · --json · --tag <t> · --local <path>`);
    return;
  }

  if (cmd === "oracles") {
    if (asJson) { console.log(JSON.stringify(ORACLES, null, 2)); return; }
    console.log(C.gold("Oracle ที่มี blog.json:"));
    for (const [k, v] of Object.entries(ORACLES)) console.log(`  ${C.bold(k.padEnd(8))} ${C.dim(v)}`);
    return;
  }

  const feed = await loadFeed(oracle, local);

  if (cmd === "feed") { console.log(JSON.stringify(feed, null, 2)); return; }

  if (cmd === "list") {
    let posts = feed.posts;
    if (flags.tag) posts = posts.filter((p) => p.tags.includes(flags.tag as string));
    if (asJson) { console.log(JSON.stringify(posts, null, 2)); return; }
    console.log(fmtHeader(feed) + "\n");
    if (!posts.length) { console.log(C.dim("  (ไม่มีบทความตรงเงื่อนไข)")); return; }
    console.log(posts.map(fmtPost).join("\n\n"));
    return;
  }

  if (cmd === "show" || cmd === "link") {
    const slug = positional[0];
    if (!slug) throw new Error(`usage: blog ${cmd} <slug>  (ดู slug จาก 'blog list')`);
    const p = feed.posts.find((x) => x.slug === slug || x.url.includes(slug));
    if (!p) throw new Error(`ไม่พบ slug "${slug}" ใน ${feed.oracle} — ลอง 'blog list'`);

    if (cmd === "link") { console.log(p.url); return; }

    if (asJson) { console.log(JSON.stringify(p, null, 2)); return; }
    // metadata block + เนื้อหา markdown เต็ม (Nat: ส่งเนื้อหามี metadata)
    console.log(C.gold("─".repeat(60)));
    console.log(`${C.bold(p.title)}`);
    console.log(`${C.dim("oracle:")} ${p.oracle}   ${C.dim("model:")} ${C.cyan(p.model)}`);
    console.log(`${C.dim("date:  ")} ${p.date}   ${C.dim("tags:")} ${p.tags.map((t) => "#" + t).join(" ")}`);
    console.log(`${C.dim("url:   ")} ${p.url}`);
    console.log(`${C.dim("md:    ")} ${p.markdown}`);
    console.log(C.gold("─".repeat(60)) + "\n");
    const md = await fetch(p.markdown);
    if (md.ok) console.log(await md.text());
    else console.log(C.dim(`(ดึง markdown ไม่ได้: HTTP ${md.status})`));
    return;
  }

  throw new Error(`unknown command "${cmd}" — ลอง 'blog help'`);
}

main().catch((e) => { console.error(`\x1b[31m✘ ${e.message}\x1b[0m`); process.exit(1); });
