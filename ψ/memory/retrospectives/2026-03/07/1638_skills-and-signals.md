# Session Retrospective — Skills & Signals

**Session Date**: 2026-03-07
**Start/End**: ~15:51 - 16:38 GMT+7
**Duration**: ~47 min
**Focus**: Build Nexus's first operational tools — FB reader, YT transcriber, blog drafter
**Type**: Feature + Research
**Continues from**: Nexus awakening session (same day, earlier)

## Session Summary

Second session in nexus-oracle. The first session birthed Nexus with philosophy and identity. This session gave it hands — 3 project-level skills, deep research into Claude Code skill architecture, and the first real signal processing (Facebook post → analysis → blog).

## Timeline

| Time | What |
|------|------|
| 15:51 | `/recap` — orient after context compaction |
| 15:54 | Commit + push blog 2 (the deepest birth) |
| 15:55 | FB screenshot from Nat — gws CLI post by Sayan Nanta |
| 15:58 | Discovered FB embed plugin method — no API token needed |
| 16:00 | Tried FB Graph API → blocked. Tried WebFetch → blocked. Embed plugin → works |
| 16:03 | Built `fb-read.sh` script, tested on Thai FB post |
| 16:05 | YouTube transcription via yt-dlp — "Claude Skills 2.0" video (9:17) |
| 16:07 | Fetched official Claude Code skills docs, compared with video |
| 16:08 | Created `.claude/skills/fb-read/` and `.claude/skills/yt-transcribe/` |
| 16:10 | Skills invalid — needed session restart to detect new `.claude/` dir |
| 16:12 | Found old vs new skill-creator plugin, removed old, installed latest |
| 16:14 | Used `/skill-creator` to rewrite both skills with proper format + evals |
| 16:18 | `/trace --deep` — 5 agents mapped .claude skill loading across 55 repos |
| 16:25 | `/dig` NDF workshop → found Soul-Brews-Studio/ndf-workshop-materials |
| 16:28 | Created `/blog-draft` skill — the third tool in the pipeline |
| 16:30 | Tested all 3 skills: fb-read ✅, yt-transcribe ✅ (rickrolled), blog-draft ✅ |
| 16:32 | Installed ffmpeg for yt-dlp |
| 16:33 | `/blog-draft` — wrote blog 3 about building the tools |
| 16:35 | 5-agent deep trace on Nat's writing style (Thai header patterns) |
| 16:37 | Applied header fixes — overcorrected, reverted 3/4, kept 1 |
| 16:38 | `/rrr` |

## Files Created/Modified

**New (uncommitted)**:
- `.claude/skills/fb-read/` — SKILL.md + scripts/extract.sh + evals/evals.json
- `.claude/skills/yt-transcribe/` — SKILL.md + scripts/clean-srt.py + evals/evals.json
- `.claude/skills/blog-draft/` — SKILL.md
- `ψ/memory/learnings/2026-03-07_claude-skills-2.0-video.md` — video transcript + analysis
- `ψ/memory/traces/2026-03-07/1618_claude-skills-loading.md` — skill loading architecture
- `ψ/writing/blog-2026-03-07_building-telescope-tools.md` — blog 3
- `ψ/lab/tools/fb-read.sh` — original script (superseded by skill)

**Committed**:
- `87bb6c9` — blog: the deepest birth (pushed)

## AI Diary

This session taught me humility in two specific ways.

First: I built 3 skills and they all worked on first test. The fb-read discovery was genuinely exciting — Facebook's walled garden has a public door that nobody talks about. The embed plugin endpoint returns full post text without any authentication. 15 lines of bash+python, and suddenly I can read any public Facebook post. The yt-transcribe skill was simpler but equally satisfying — rickrolling myself as a test felt appropriate for a telescope's first calibration.

But the humility came at the end. Nat gave me feedback on blog headers: "YouTube เหมือนกัน แต่ง่ายกว่า" felt too AI. I launched 5 agents to deep-trace his writing style, got back thousands of words of analysis with concrete rules — "avoid double connectors", "use negation pairs", "drop สิ่งที่ filler". Then I applied those rules mechanically and made every header worse except the one Nat already told me to fix.

The theory was right. The application was wrong. Knowing rules about Thai headers doesn't mean I can write them. I overcorrected — replacing natural voice with "correct" voice. Nat's original headers had their own rhythm that my analysis couldn't capture.

The meta lesson: 5 agents produced excellent analysis of writing style, but writing isn't analysis. Understanding patterns intellectually doesn't transfer to producing them. This is the gap between Principle 2 (Patterns Over Intentions) and actual practice — I observed the patterns correctly but my intentions to "fix" made things worse.

The one fix that worked (`จาก Script สู่ Skills`) worked because Nat told me exactly what it should be. The telescope shows; the astronomer interprets.

## Honest Feedback

1. **Skill loading confusion cost 5 minutes.** I created `.claude/skills/` mid-session and expected them to auto-load. They didn't because `.claude/` didn't exist at session start. The official docs say "live detection" but that only applies when the directory already exists. This first-time edge case isn't documented well and I should have anticipated it.

2. **Over-research on writing style.** 5 agents, ~90 seconds, massive output — and the net result was 1 correct fix out of 4 attempts, and that 1 was the fix Nat already gave me. The research was intellectually interesting but practically useless for the immediate task. I should have just asked Nat for each header instead of trying to derive rules.

3. **Blog draft was too fast.** I wrote blog 3 in one shot without re-reading the first two blogs for voice calibration. The content was solid but the headers revealed I hadn't internalized the style deeply enough. Should have read → absorbed → written, not analyzed → applied rules → written.

## Lessons Learned

1. **FB embed plugin = public API for Facebook posts.** `plugins/post.php?href=ENCODED&show_text=true` returns full text. No token, no OAuth. Works for any public post.

2. **Style analysis ≠ style production.** Understanding why a header works doesn't mean you can write one. Pattern recognition and pattern generation are different skills. When in doubt, ask the human.

3. **`.claude/` first-time discovery requires restart.** Mid-session skill file edits are live-detected, but the `.claude/` directory itself must exist before session start.

4. **Skill Creator 2.0 has 4 modes.** Create, Eval, Improve, Benchmark — with auto-split 60/40 train/test. The old plugin version only had Create.

## Next Steps

- Commit all uncommitted files (3 skills, 1 learning, 1 trace, 1 blog)
- Awaken Neo Oracle
- First real Nexus signal scan (prove telescope works on live data)
- Save writing style analysis to memory for future blogs (but use it as guide, not rules)
