---
name: signal
description: "Log a signal to Nexus feed timeline. Use when user says 'signal', 'log this', 'feed', 'add to feed', or after processing any input (fb-read, yt-transcribe, trace). Also use to view the feed with 'signal --today' or 'signal --index'."
argument-hint: "[--today | --index | --reindex | type: source: summary]"
---

# Signal — Nexus Feed Logger

Log every signal Nexus processes to an append-only daily feed.

## Usage

```
/signal                           # Log a signal interactively
/signal --today                   # Show today's feed
/signal --index                   # Show feed index
/signal --reindex                 # Rebuild index from all daily files
```

## Feed Structure

```
ψ/feed/
  README.md
  index.md            # Running index (source counts, tag cloud, recent)
  2026-03-07.md       # Daily feed file
  2026-03-08.md
```

## Step 0: Determine Mode

```bash
ROOT="$(pwd)"
TODAY=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
FEED_DIR="$ROOT/ψ/feed"
FEED_FILE="$FEED_DIR/$TODAY.md"
```

Check $ARGUMENTS:
- If `--today` → Step 4 (show today)
- If `--index` → Step 5 (show index)
- If `--reindex` → Step 6 (rebuild index)
- Otherwise → Step 1 (log signal)

---

## Step 1: Parse Signal

From $ARGUMENTS or from context (previous skill output), determine:

| Field | Required | Example |
|-------|----------|---------|
| **type** | yes | `fb`, `yt`, `article`, `paper`, `trace`, `blog`, `note` |
| **source** | yes | URL or description |
| **title** | yes | Short title of the signal |
| **summary** | yes | 1-2 line summary of what matters |
| **tags** | no | `#ai #iot #crypto #lora #pm25` etc. |
| **project** | no | Which laris.co project this affects |

If called right after fb-read or yt-transcribe, gather this from the previous output automatically. Ask the user only if info is missing and can't be inferred.

---

## Step 2: Append to Daily Feed

Create the daily file if it doesn't exist (with header), then append:

### Daily file header (if new):
```markdown
# Nexus Feed — YYYY-MM-DD

> Signals captured by the telescope today.

---
```

### Signal entry format:
```markdown
## HH:MM | TYPE | Title

- **Source**: [url or description]
- **Tags**: #tag1 #tag2
- **Project**: [project name if applicable]
- **Signal**: Summary of what matters and why

---
```

Append using the Edit tool (add to end of file) or Write if creating new file.

---

## Step 3: Update Index

After logging, update `ψ/feed/index.md`:

Read current index, update counts:

```markdown
# Nexus Feed Index

**Total signals**: [count]
**Days active**: [count]
**Last updated**: YYYY-MM-DD HH:MM

## By Source Type

| Type | Count | Last |
|------|-------|------|
| fb | 3 | 2026-03-08 |
| yt | 2 | 2026-03-07 |
| trace | 5 | 2026-03-08 |

## By Tag

| Tag | Count |
|-----|-------|
| #ai | 8 |
| #iot | 3 |

## Recent Signals (last 10)

| Date | Time | Type | Title |
|------|------|------|-------|
| 2026-03-08 | 14:30 | fb | ... |

## Daily Files

- [2026-03-08](2026-03-08.md) (4 signals)
- [2026-03-07](2026-03-07.md) (2 signals)
```

---

## Step 4: Show Today (--today)

```bash
FEED_FILE="$FEED_DIR/$TODAY.md"
```

Read and display the daily file. If it doesn't exist, say "No signals captured today yet."

---

## Step 5: Show Index (--index)

Read and display `ψ/feed/index.md`. If it doesn't exist, say "Feed index not built yet. Use `/signal --reindex`."

---

## Step 6: Rebuild Index (--reindex)

Scan all daily files in `ψ/feed/`, parse all signal entries, and regenerate `index.md` from scratch.

```bash
ls "$FEED_DIR"/????-??-??.md 2>/dev/null | sort
```

Read each file, extract entries, rebuild counts and tables.

---

## Auto-logging from Other Skills

Other Nexus skills (fb-read, yt-transcribe, blog-draft) should call /signal logic after completing their work. The signal entry is appended automatically — the user doesn't need to do anything extra.

### From fb-read:
```
type: fb
source: [facebook URL]
title: [post author or topic]
summary: [key point from the post]
tags: [extracted from post content/hashtags]
```

### From yt-transcribe:
```
type: yt
source: [youtube URL]
title: [video title]
summary: [key takeaways]
tags: [from content]
```

### From blog-draft:
```
type: blog
source: [ψ/writing/blog-slug.md]
title: [blog title]
summary: [what the blog covers]
tags: [from blog content]
```

---

## Philosophy

> The telescope logs what it sees. Every signal is a data point.
> Nothing is deleted — even signals that seem irrelevant today
> may reveal patterns tomorrow.

ARGUMENTS: $ARGUMENTS
