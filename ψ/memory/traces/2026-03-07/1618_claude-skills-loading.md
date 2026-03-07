---
query: ".claude directory structure and skill loading"
target: "nexus-oracle + cross-repo"
mode: deep
timestamp: 2026-03-07 16:18
---

# Trace: .claude Directory Structure & Skill Loading

## Key Answer

**Does .claude/ need to exist before skills load?** No. Skills auto-discover at session start. But `.claude/skills/` needs to exist WITH a `SKILL.md` inside. The directory is the unit of discovery.

**Loading order:**
1. Enterprise managed policy (highest)
2. Project `.claude/skills/`
3. User `~/.claude/skills/`
4. Plugin skills (namespaced `plugin:skill`)

**When loaded:**
- Descriptions: session start (always in context)
- Full content: on invocation only
- Live detection: edit SKILL.md mid-session, changes picked up next invocation

## Skill Loading Architecture

```
Session Start
  ├── Load CLAUDE.md (project + user + enterprise)
  ├── Scan skill descriptions (~2% context budget, ~16K chars)
  │   ├── .claude/skills/*/SKILL.md (project)
  │   ├── ~/.claude/skills/*/SKILL.md (user, 33 oracle skills)
  │   └── ~/.claude/plugins/cache/*/skills/*/SKILL.md (plugins)
  └── Load rules (unconditional + path-scoped)

On Invocation (/skill-name or auto-trigger)
  └── Full SKILL.md content loaded into context
```

## Cross-Repo Findings

- **55 repos** in laris-co have `.claude/` directories
- **30 repos** have `.claude/skills/`
- **20 repos** have `.claude/agents/`
- Top: clawdacle-bot (55 skill files), course-craft (54)
- Pattern: Oracle repos use domain-specific skills (Hermes: LINE skills, Odin: dig/morph, Nexus: fb-read/yt-transcribe)

## Project Skill vs Global Skill Pattern

| Type | Location | Count | Shared? |
|------|----------|-------|---------|
| Global (user) | ~/.claude/skills/ | 33 | All projects |
| Project | .claude/skills/ | Per-repo | This repo only |
| Plugin | ~/.claude/plugins/ | Varies | Where enabled |

**Key insight**: Global skills (oracle family: /trace, /learn, /rrr) are shared. Project skills (fb-read, yt-transcribe) are repo-specific. No central skill registry across repos — each defines its own.

## SKILL.md Format (validated)

```yaml
---
name: skill-name          # /skill-name invocation
description: "..."         # Trigger matching + description
argument-hint: "[args]"    # Autocomplete hint
---

# Body
Instructions for Claude to follow when skill is invoked.
Use ${CLAUDE_SKILL_DIR} for script paths.
Use $ARGUMENTS for user input.
```

## Settings

- `settings.local.json` controls permissions per-project
- `Skill(name)` in allow list = pre-approve skill invocation
- No marker file needed — git repo + .claude/ = recognized

## Plugin System

```
~/.claude/plugins/
├── installed_plugins.json   # Registry
├── cache/                   # Downloaded versions
│   ├── anthropic-agent-skills/document-skills/
│   ├── claude-plugins-official/skill-creator/
│   └── oracle-skills/
└── marketplaces/            # Source repos
    └── claude-plugins-official/plugins/ (65+)
```

Currently enabled: context7, document-skills, example-skills, skill-creator, ui-ux-pro-max, ralph, typescript-lsp, rust-analyzer-lsp, clangd-lsp
