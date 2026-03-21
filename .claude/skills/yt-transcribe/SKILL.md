---
name: yt-transcribe
description: "Transcribe YouTube videos using auto-generated captions. Use this skill whenever the user shares a YouTube or youtu.be link, asks to transcribe a video, wants to know what a video says, asks for a video summary, or mentions watching/learning from a YouTube video. Also use when URLs contain youtube.com/watch or youtu.be/."
argument-hint: "[youtube-url]"
---

# YouTube Transcriber

Download and clean auto-generated captions from any YouTube video. Works without API keys by using yt-dlp to fetch subtitle tracks that YouTube generates automatically.

## Step 1: Extract the video URL

Parse the URL from the arguments. Accept any YouTube format:
- `https://www.youtube.com/watch?v=xxxxx`
- `https://youtu.be/xxxxx`
- `https://youtube.com/shorts/xxxxx`

## Step 2: Check dependencies

```bash
which yt-dlp > /dev/null 2>&1 || PATH="$HOME/.local/bin:$PATH" which yt-dlp > /dev/null 2>&1 || { echo "Installing yt-dlp..."; pip install yt-dlp 2>&1; }
```

## Step 3: Get video metadata

Fetch title, channel, duration, and view count. Use the URL you extracted in step 1.

```bash
PATH="$HOME/.local/bin:$PATH" yt-dlp --dump-json --no-download "VIDEO_URL_HERE" 2>/dev/null | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'Title: {d.get(\"title\",\"unknown\")}'  )
print(f'Channel: {d.get(\"channel\",\"unknown\")}'  )
print(f'Duration: {d.get(\"duration_string\",\"?\")}'  )
print(f'Views: {d.get(\"view_count\",\"?\"):,}' if isinstance(d.get('view_count'), int) else f'Views: {d.get(\"view_count\",\"?\")}'  )
print(f'Uploaded: {d.get(\"upload_date\",\"?\")}'  )
"
```

Replace `VIDEO_URL_HERE` with the actual URL.

## Step 4: Download captions

Try `en-orig` first (original English), fall back to `en` if unavailable.

```bash
PATH="$HOME/.local/bin:$PATH" yt-dlp --write-auto-sub --sub-lang "en-orig" --sub-format srt --skip-download -o "/tmp/yt-%(id)s" "VIDEO_URL_HERE" 2>&1
```

If that fails with no subtitles found, retry with `--sub-lang en`. If the user requested a specific language, use that language code instead.

## Step 5: Clean the SRT to readable text

The raw SRT has timestamps, sequence numbers, and duplicate lines from the auto-caption sliding window. The cleanup script strips all of that.

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/clean-srt.py
```

The script automatically finds the most recently downloaded SRT file in `/tmp/`.

## Step 6: Present the results

Show the user:
1. **Video metadata** — title, channel, duration, views, upload date
2. **Full transcript** — the cleaned text
3. **Key takeaways** — 3-5 bullet points summarizing the main points
4. **Relevant signals** — flag anything relevant to the user's interests or current work

## Cleanup

After presenting results, remove the SRT file to avoid stale data on future runs:

```bash
rm -f /tmp/yt-*.srt
```

## Troubleshooting

- **"No supported JavaScript runtime"** warning from yt-dlp — this is usually harmless, captions still download fine
- **No captions available** — some videos have captions disabled. Let the user know and suggest they look for a transcript elsewhere
- **Wrong language** — list available languages with `yt-dlp --list-subs "URL"` and let the user pick

## Auto-log to Feed

After presenting the transcript to the user, append a signal entry to the Nexus feed:

```
Feed file: ψ/feed/YYYY-MM-DD.md (today's date)
```

Entry format:
```markdown
## HH:MM | yt | [Video title]

- **Source**: [YouTube URL]
- **Tags**: [inferred topic tags from content]
- **Signal**: [key takeaways in 1-2 lines]

---
```

Create the daily file with header if it doesn't exist yet. Always append — never overwrite.
