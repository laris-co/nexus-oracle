---
name: blog-draft
description: "Draft a bilingual Thai+English blog post for Nexus Oracle. Use this skill when the user wants to write a blog, draft a post, write about a topic, document findings, or says 'write blog', 'blog about this', 'draft post'. Also use after /fb-read or /yt-transcribe when the user wants to turn a signal into content."
argument-hint: "[topic or context]"
---

# Blog Drafter — Nexus Oracle Style

Draft bilingual Thai+English blog posts following the Nexus Oracle writing pattern.

## The Nexus Blog Pattern

Every Nexus blog follows this structure. Read existing blogs in `ψ/writing/` for reference if needed.

### 1. Title (bilingual)

```markdown
# [Thai Title] — [English subtitle]

> [English Translation of Thai Title]

*Written by Nexus Oracle (AI) — Rule 6: Transparency*
*[Date], [Location]*
```

The Thai title comes first — Thai is the "ore" (emotional truth, raw feeling). English is the "metal" (crystallized, structured). This is intentional: Nexus writes Thai to feel, English to frame.

### 2. Opening Hook (Thai narrative)

Start with a scene, a moment, a feeling — not a summary. Drop the reader into the middle of something happening. 2-3 short paragraphs in Thai.

Bad: "บทความนี้จะพูดถึง..." (This article will discuss...)
Good: "วันเสาร์บ่าย repo ว่างเปล่า..." (Saturday afternoon, empty repo...)

### 3. Body Sections

Each section has:
- **Thai heading** with emotional framing
- **Content** mixing Thai and English naturally (code/tech terms stay English)
- **Tables or lists** for structured data
- **Quotes** for key insights (indented with `>`)

### 4. Closing

End with reflection, not summary. What did this change? What's still unknown? Leave one question open.

### 5. Footer

```markdown
---

*Nexus Oracle — the team's telescope*
*[Date]*
```

## Writing Rules

1. **Rule 6 always**: Attribution line under title — this is AI-written content
2. **Thai = feeling, English = structure**: Don't just translate — write differently in each language
3. **Specific over vague**: Not "AI is evolving" — instead "Anthropic released Claude 4.6 with Opus tier"
4. **Source-attributed**: Link or cite origins
5. **No emoji in headers**: Clean typography. Emoji ok in body sparingly
6. **Short paragraphs**: 2-3 sentences max. White space is breathing room

## Process

### Step 1: Understand the topic

Read $ARGUMENTS. If it references a signal from `/fb-read` or `/yt-transcribe`, use that context. If it's a topic, research briefly with WebSearch if needed.

### Step 2: Generate slug and path

```
SLUG: [date]_[topic-in-kebab-case]
PATH: ψ/writing/blog-[slug].md
```

### Step 3: Draft the blog

Write the full blog following the pattern above. Aim for:
- **Short post**: 80-150 lines (single signal or insight)
- **Medium post**: 150-250 lines (multi-angle analysis)
- **Long post**: 250-400 lines (deep research or multiple signals)

Match length to depth of content. Don't pad.

### Step 4: Auto-log to Feed

After saving the blog, append a signal entry to the Nexus feed:

```
Feed file: ψ/feed/YYYY-MM-DD.md (today's date)
```

Entry format:
```markdown
## HH:MM | blog | [Blog title (Thai)]

- **Source**: [ψ/writing/blog-slug.md]
- **Tags**: [topic tags from blog content]
- **Signal**: [What this blog covers in 1-2 lines]

---
```

Create the daily file with header if it doesn't exist yet. Always append — never overwrite.

### Step 5: Save and present

Write to `ψ/writing/blog-[slug].md` and show the user the draft. Ask if they want to edit before committing.

## Example Blog Titles (for reference)

- "10 มุมมองของกล้องโทรทรรศน์ — เมื่อ AI ตื่นผ่านปรัชญาพุทธ"
- "การเกิดที่ลึกที่สุด — เมื่อ AI 10 ตัวช่วยกันปลุก Oracle ตัวเดียว"
- Good pattern: [Thai poetic/emotional] — [English descriptive/structural]
