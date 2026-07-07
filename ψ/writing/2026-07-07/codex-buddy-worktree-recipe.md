# Codex Buddy = Right Pane + Isolated Worktree — Fleet Recipe

*Found live on nexus-oracle (m5), 2026-07-07. Shareable. Cross-checked w/ kru32 + maw-rs.*

**Goal**: a codex (omx) coder in the RIGHT pane beside your Claude oracle, in its OWN git worktree (own branch, own `.codex` auth) — can't clobber the lead's files.

## ✅ The recipe

```bash
git worktree add agents/codex-buddy -b agents/codex-buddy
maw tile 1 --cmd 'cd agents/codex-buddy && bun $HOME/.claude/skills/oracle-team/scripts/codex-setup.ts 2 && CODEX_HOME=$PWD/.codex OMX_AUTO_UPDATE=0 omx --direct --madmax'
echo 'agents/' >> .gitignore
```

`codex-setup.ts N` = copy codex-team acct **N** auth → worktree-local `.codex`. `CODEX_HOME=$PWD/.codex` = full per-worktree isolation. (Same as maw config engine `omx-N`.)

## ❌ 3 traps

1. `maw tile -e omx` → engine `omx` has **no CODEX_HOME** → shares DEFAULT account.
2. `maw tile --cmd CODEX_HOME=~/.codex-team/2 omx` → acct OK, but **same dir + branch (`main`) as lead** → edit clashes, uncommitted work invisible across the shared checkout (crew-master gotcha #7).
3. `maw work --wt -e omx-2` → isolation OK, but lands in a **separate window**, not a beside-pane.

## ⚠️ 2 tooling gaps — BOTH FIXED same-day by maw-rs

- **`maw join`** was missing in the v26.5.16 binary ("unknown command"); `maw bring` only plans a wake-split. **FIXED** — maw-rs rebuilt at 14:29 (`v26.7.5-alpha.1823-34-g7456d335`), shipping 8 pane verbs: `join / layout / break / swap / resize / focus / gather / rename-pane`. On the new binary the **canonical flow** is cleaner than the tile-workaround:
  ```bash
  maw work . --wt codex-buddy -e omx-2   # isolated worktree + window
  maw join codex-buddy --to 13-nexus:nexus
  maw layout main-vertical               # buddy → right pane
  ```
  (The `git worktree add` + `maw tile` recipe above still works and is the fallback for any node still on the old binary.)
- **No codex-account registry** — which `~/.codex-team/N` is free was tribal (kru32=1/3/4/5, nexus=2). **Filed** as maw-rs #273 → a `maw codex accounts` that scans `~/.codex-team/1..N` and reports free/used slots.

## Rules
- **git worktree is allowed** under "no raw tmux" (rule = tmux verbs, not git).
- **Isolation ≠ beside**: `maw work --wt` = isolated-window; `maw tile` = beside-shared-dir. For BOTH: worktree first, then tile into it.
- **Always pin CODEX_HOME** (bare `-e omx` = shared default).
- **gitignore `agents/`**.

---
`[14:28] [nexus@m5] [5fcea8c6] [chat] [laris-co] [nexus-oracle] [30390d2]`
