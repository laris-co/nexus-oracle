---
pattern: "Spawning a codex (omx) buddy as a RIGHT PANE beside a Claude oracle, running in an isolated git worktree — the correct recipe, the 3 traps, and 2 fleet-tooling gaps found live"
date: 2026-07-07
source: "live setup on nexus-oracle (m5), cross-checked with kru32 + maw-rs oracles over maw federation"
concepts: ["codex", "omx", "worktree", "maw", "codex-team", "isolation", "buddy", "fleet-tooling"]
---

# Learned: codex buddy = right pane + isolated worktree (the correct recipe)

**Goal**: put a codex (omx) coder in the RIGHT pane beside your Claude oracle, running in its OWN git worktree (own branch, own `.codex` auth) so it can't clobber the lead's working files.

## The correct recipe (works, reproducible)

```bash
# 1. worktree (git, not tmux — allowed by the no-raw-tmux fleet rule)
git worktree add agents/codex-buddy -b agents/codex-buddy
# 2. tile INTO the worktree as a right pane, with per-worktree isolated CODEX_HOME
maw tile 1 --cmd 'cd agents/codex-buddy && bun $HOME/.claude/skills/oracle-team/scripts/codex-setup.ts 2 && CODEX_HOME=$PWD/.codex OMX_AUTO_UPDATE=0 omx --direct --madmax'
# 3. gitignore the worktree dir so the main repo doesn't see it as untracked
echo 'agents/' >> .gitignore
```

`codex-setup.ts N` copies codex-team account **N**'s auth into the worktree-local `.codex` → `CODEX_HOME=$PWD/.codex` gives **full per-worktree isolation** (auth→pool/N, isolated omx state). This is exactly what the maw config engine `omx-N` already does — `omx-1..5` are all `bun codex-setup.ts N && CODEX_HOME=$PWD/.codex omx --direct --madmax`.

## The 3 traps (each looks right, each is wrong)

| Attempt | Looks like | Actually |
|---|---|---|
| `maw tile 1 -e omx` | 1 codex pane, done | ❌ engine `omx` = `omx --yolo --direct`, **no CODEX_HOME** → shares the DEFAULT codex account |
| `maw tile 1 --cmd 'CODEX_HOME=~/.codex-team/2 omx ...'` | account isolated | ⚠️ acct isolated, but **same dir + same branch (`main`) as the lead** → both edit the same files; uncommitted work is invisible across the shared checkout (crew-master gotcha #7) |
| `maw work . --wt codex-buddy -e omx-2` | true worktree + isolation | ✅ isolation correct, but lands in a **SEPARATE window**, not a beside-pane. `maw join` (to pull it beside) is NOT shipped in the v26.5.16 binary |

## 2 fleet-tooling gaps surfaced live — BOTH FIXED same-day

1. **`maw join`** was missing in the v26.5.16 binary ("unknown command"; help hid it); `maw bring` only PLANS a wake-split, doesn't move a live window. → **maw-rs rebuilt at 14:29** (`v26.7.5-alpha.1823-34-g7456d335`) shipping 8 pane verbs (`join/layout/break/swap/resize/focus/gather/rename-pane`). On the new binary the canonical flow is `maw work . --wt codex-buddy -e omx-2 && maw join codex-buddy --to 13-nexus:nexus && maw layout main-vertical` — cleaner than the tile-into-worktree workaround (which remains the fallback for old-binary nodes).
2. **No central codex-account registry** (which `~/.codex-team/N` is free was tribal — kru32 holds 1/3/4/5, nexus took 2). → **filed as maw-rs #273** (`maw codex accounts` to scan slots and report free/used).

**Meta-lesson**: reporting a tooling gap to the owning oracle (maw-rs) got both gaps resolved within ~25 min — a live verb rebuild + a tracked issue. Report gaps, don't just work around them silently.

## Reusable rules

- **git worktree is allowed** under the "no raw tmux" fleet rule — the rule is about `tmux send-keys/join-pane/kill-window`, not git.
- **Isolation ≠ beside.** `maw work --wt` gives isolation-in-a-window; `maw tile` gives beside-in-shared-dir. Getting BOTH means: make the worktree first, then `maw tile` into it.
- **Always pin CODEX_HOME.** `-e omx` bare = shared default account. Use `omx-N` (config engine) or an explicit `codex-setup.ts N && CODEX_HOME=$PWD/.codex`.
- **gitignore `agents/`** or the lead repo shows the whole worktree as untracked.

Locked into `Makefile` on nexus-oracle: `make buddy` / `buddy-down` / `buddy-status` / `buddy-tile`.

Companion shareable one-pager: `ψ/writing/2026-07-07/codex-buddy-worktree-recipe.md`.
