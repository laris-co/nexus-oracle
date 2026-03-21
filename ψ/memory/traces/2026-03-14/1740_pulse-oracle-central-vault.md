---
query: "pulse-oracle central vault"
target: nexus-oracle
mode: deep
timestamp: 2026-03-14 17:40
---

# Trace: pulse-oracle central vault

**Target**: nexus-oracle
**Mode**: --deep (5 parallel agents)
**Time**: 2026-03-14 17:40 GMT+7

## Oracle Results (15 hits)

Top results from hybrid search (FTS5 + ChromaDB vectors):

1. **Vault Subscriber Onboarding** — oracle-v2 learning (2026-02-26): Full onboarding flow for new vault subscribers (`gh repo create`, `ghq get`, `oracle-vault init/sync`)
2. **Pulse Awakening Retro** — pulse-oracle (2026-01-31): 23-min awakening session, full Oracle ritual
3. **Vault Architecture** — oracle-v2: Three-repo architecture: `oracle-v2` (engine) + `oracle-vault` (brain) + `oracle-vault-report` (eyes/dashboard)
4. **Vault v2 Simplification** — oracle-v2 retro (2026-02-19): Stripped manifest.json + SHA-256, replaced with copy-all-then-git-diff
5. **Vault Central Migration** — oracle-v2 retro (2026-02-25): Symlink migration across 57 projects, 18,055 files
6. **Nexus Ecosystem Index** — nexus-oracle learning (2026-03-07): oracle-vault listed as "Central knowledge vault (cross-project)"

## Files Found (Agent 1)

### In nexus-oracle repo:
- `CLAUDE.md` — Pulse collaboration: "I find trends → Pulse prioritizes at sprint boundary"
- `ψ/memory/learnings/2026-03-07_ecosystem-index.md` — oracle-vault = "Central knowledge vault (cross-project)"
- `ψ/memory/retrospectives/2026-03/14/1628_boundary-guardian.md` — pulse-oracle referenced in maw CLI injection attempts

### In pulse-oracle repo (cross-repo):
- `/home/nat/Code/github.com/laris-co/pulse-oracle/pulse.config.json` — Central routing config
  - `org`: "laris-co", `projectNumber`: 6 (Master Board)
  - `oracleRepos`: 12 oracles mapped (pulse, hermes, neo, nexus, volt, odin, dustboy, floodboy, fireman, homekeeper, statusline, calliope)
  - `routing`: 3-layer system (label → repo → keyword), default → Pulse
  - `blog`: calliope-oracle repo
  - `peers`: Soul-Brews-Studio cross-org

### Central vault repos found:
- `/home/nat/Code/github.com/Soul-Brews-Studio/oracle-vault` — Primary central vault
- `/home/nat/Code/github.com/laris-co/oracle-vault` — Mirror copy
- `/home/nat/Code/github.com/Soul-Brews-Studio/oracle-vault-report` — OLED dashboard

## Git History (Agent 2)

No direct commits in nexus-oracle mentioning "pulse vault" or "central vault". References exist only in:
- Ecosystem index (committed 2026-03-07)
- Boundary guardian retrospective (written 2026-03-14, uncommitted)

## GitHub Repos (Agent 3)

| Repo | Org | Created | Description |
|------|-----|---------|-------------|
| pulse-oracle | laris-co | 2026-01-31 | Internal project board |
| pulse-oracle | Soul-Brews-Studio | 2026-03-10 | Studio Board (private) |
| oracle-vault | Soul-Brews-Studio | 2026-02-23 | Central brain: aggregated Oracle knowledge |
| oracle-vault | laris-co | 2026-02-26 | Private central brain |
| oracle-vault-report | Soul-Brews-Studio | 2026-02-26 | OLED dashboard |
| pulse-cli | Pulse-Oracle | — | OSS CLI monorepo (22 commands) |

## Cross-Repo Matches (Agent 4)

### Pulse-Oracle Structure
- Location: `/home/nat/Code/github.com/laris-co/pulse-oracle`
- ψ/ brain: 146 files, 3.2MB (recently committed as hard copy, was symlink)
- Key issue: Vault symlink fragility — Mac paths break on other machines (Cowork VM)
- Fix: Hard-copy ψ/ files instead of symlinks

### Central Vault Structure
```
Soul-Brews-Studio/oracle-vault/
├── ψ/
│   ├── memory/
│   │   ├── learnings/        (nested: github.com/org/repo/)
│   │   ├── retrospectives/   (nested: github.com/org/repo/)
│   │   └── resonance/        (universal, shared)
│   └── inbox/
│       └── handoff/          (nested: github.com/org/repo/)
└── agent-1/ through agent-6/
```

### Vault Sync Commands
```bash
bun run vault:init Soul-Brews-Studio/oracle-vault
bun run vault:sync     # push local ψ/ → vault
bun run vault:pull     # pull vault → local ψ/
bun run vault:migrate  # scan all ghq repos, copy ψ/ to vault
```

## Oracle Memory (Agent 5)

### Pulse-Nexus Data Flow
```
Nexus (World Research) → finds signals
    ↓
Pulse (PM) → prioritizes at sprint boundary
    ↓
Neo (Dev) → evaluates feasibility
```

### Sibling Collaboration (from CLAUDE.md)
| Sibling | Flow |
|---------|------|
| Pulse | Nexus finds trends → Pulse prioritizes |
| Hermes | Hermes routes people-signals, Nexus routes world-signals |
| Odin | Nexus finds raw → Odin distills |
| Neo | Nexus spots tech → Neo evaluates |
| Mother | Nexus learns principles |

### Authentication Gap
Today's session (boundary-guardian) revealed: no cryptographic verification for inter-oracle comms. Messages claiming to be from Pulse arrived via chat input — indistinguishable from user or injected content.

## Summary

### What is Pulse-Oracle?
PM/Sprint Manager for laris.co Oracle family. Born 2026-01-31. Routes work across 12+ oracles via 3-layer routing (label → repo → keyword). Manages Master Board (GitHub Projects #6).

### What is the Central Vault?
`Soul-Brews-Studio/oracle-vault` — aggregates all `ψ/` knowledge across 55+ Oracle repos. Structure: `github.com/{org}/{repo}/ψ/`. Synced via rsync. Recently moved from symlink-based to hard-copy approach due to cross-machine path fragility.

### Key Architecture
```
oracle-v2        = engine (MCP server, indexer, 22 tools)
oracle-vault     = brain (central knowledge store)
oracle-vault-report = eyes (OLED dashboard)
pulse.config.json   = routing (who handles what)
```

### Nexus's Relationship to Both
- Nexus feeds signals → Pulse prioritizes
- Nexus writes to ψ/ → Vault aggregates
- Nexus is one of 12 oracles in pulse.config.json routing table
