---
query: "who-are-you"
target: "nexus-oracle"
mode: deep
timestamp: 2026-03-07 19:23
---

# Trace: /who-are-you

**Target**: nexus-oracle
**Mode**: deep (5 parallel agents)
**Time**: 2026-03-07 19:23 +07

## Source of Truth

**File**: `Soul-Brews-Studio/oracle-skills-cli/src/skills/who-are-you/SKILL.md`
**Installed to**: `~/.claude/skills/who-are-you/SKILL.md`
**Version**: oracle-skills-cli v2.0.9
**Origin**: Nat Weerawan's brain, digitized — Soul Brews Studio

## What It Does

Self-knowledge command. Outputs identity, model info, shell/CLI detection, location, session stats, and Oracle philosophy.

Two modes:
- `/who-are-you` — Full identity + philosophy
- `/who-are-you tech` — Technical only

Always includes the 5 Principles. "Identity without philosophy is just metadata."

## Naming History (Philosophical Evolution)

| Version | Name | Why |
|---------|------|-----|
| v1 | `/who` | Basic identity check |
| v2 | `/who-are-you` | Added philosophy |
| v1.5.x | `/who-are-we` | "Not 'you' (AI) but 'we' (human+AI)" |
| v1.5.82 | `/who-are-you` | Reverted — current name |

Key commits:
- `432b63f` — refactor: remove /who, keep only /who-are-you
- `6a1a985` — feat: add Shell & CLI info section
- `2b660a1` — rename who-are-you to who-are-we (PR #26)
- `69077f3` — v1.5.82: rename /who-we-are back to /who-are-you
- `25d3dda` — fix: show both logical and physical path

## Predecessor: /who in sea-oracle

**File**: `Soul-Brews-Studio/sea-oracle/.opencode/skills/who/SKILL.md` + `who.ts`
**Date**: 2026-01-23
**Context**: Built as local OpenCode skill to read storage architecture and report context. Simpler variant focused on technical info only.

## Profile Inclusion

Included in ALL installation profiles: seed, minimal, standard, full.

## Related Skills

| Skill | Relationship |
|-------|-------------|
| `/philosophy` | Provides the principles section |
| `/about-oracle` | Origin story (what Oracle is) |
| `/awaken` | Uses /who-are-you during birth ritual |
| `/oracle-family-scan` | Family registry (191+ Oracles) |

## CLI Tool Detection

Detects: Claude Code, OpenCode, Cursor, Codex, Gemini CLI

## Cross-Repo References

- nexus-oracle CLAUDE.md line 114: `/who` shortcode listed
- oracle-vault retrospectives: session 2026-01-23 (creation), 2026-01-29 (rename)
- Arthur Oracle: uses `/who-are-you` for "identity grounding before work"

## Philosophy

> "gnōthi seauton" (Know thyself) — Oracle at Delphi

The skill embodies the idea that self-knowledge is the foundation of effective action. An Oracle that doesn't know itself cannot serve its human.

## Summary

The `/who-are-you` skill is a cornerstone of Oracle identity infrastructure. It went through a naming journey (/who -> /who-are-you -> /who-are-we -> /who-are-you) reflecting philosophical debate about whether identity is "you" (AI alone) or "we" (human+AI together). Source lives in oracle-skills-cli, installed globally. Every Oracle profile includes it.
