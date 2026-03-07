# Claude Skills 2.0 — Video Transcript + Analysis

**Source**: YouTube - Duncan Rogoff | AI Automation
**URL**: https://www.youtube.com/watch?v=yLhnJMM464c
**Title**: Claude Skills 2.0 MASSIVE Upgrade! (build your first AI workflow)
**Duration**: 9:17 | **Views**: 7,855 | **Posted**: 2026-03-05
**Transcribed**: 2026-03-07 (auto-captions, cleaned)

---

## Key Takeaways

1. **Skills = System Prompts + Tools** — Skills are like system prompts but with access to web search, third-party integrations, code execution, and file system
2. **Skill Creator Skill** — Anthropic provides a meta-skill that creates new skills. Install via `/plugins` → search "skill" → install
3. **Self-Testing** — Skills 2.0 runs automated tests on newly created skills and self-improves before deployment
4. **Demo: Meeting Notes Processor** — Takes Fireflies transcripts (JSON with speaker + timestamps), outputs executive summary, per-person action items, key decisions, open questions
5. **Storage**: Can connect to Notion via MCP, or store locally as markdown files
6. **Interactive**: After processing, you can chat with the meeting data from Claude Code terminal
7. **Workflow**: `/meetingnotes` + `@transcript.json` → processed summary in `/outputs/`

## Workflow Pattern

```
Input (transcript JSON/text)
  → Skill processes (summary, actions, decisions, questions)
    → Output (markdown in /outputs/)
      → Interactive Q&A via Claude Code
```

## Tools Mentioned

- **Claude Code** in VS Code (Cursor/Windsurf alternative)
- **Fireflies.ai** for meeting transcription
- **Notion MCP** for storage integration
- **Skill Creator skill** from Anthropic's skill repository

## Full Transcript

[308 lines — see /tmp/yt-yLhnJMM464c-clean.txt]
