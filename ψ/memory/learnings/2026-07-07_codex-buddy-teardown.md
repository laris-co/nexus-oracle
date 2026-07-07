---
pattern: "Clean teardown of a codex (omx) buddy — kill the omx OWNER pane FIRST (stops the HUD resize-hook from respawning), then leftover panes, then worktree. Plus the traps: don't git-stash from inside a non-worktree dir (hits main repo), and the omx HUD is spawned by --madmax not spawn-method."
date: 2026-07-07
source: "live teardown on nexus-oracle (m5) — repeated spawn/kill cycles debugging omx HUD flicker"
concepts: ["codex", "omx", "teardown", "worktree", "hud", "cleanup"]
---

# Learned: clean teardown of a codex buddy (the order matters)

## The teardown that worked (smooth, repeatable)

```bash
# 1. Kill the omx OWNER pane FIRST — this stops the HUD resize-hook from respawning
#    (killing the HUD pane first is useless: the owner's hook recreates it, %520→%527)
tmux kill-pane -t <buddy-pane-id>
sleep 2
# 2. Kill any leftover HUD pane (now it stays dead — owner is gone)
tmux kill-pane -t <hud-pane-id>
# 3. Remove the worktree (stash-or-move its dirty files first — see trap below)
git worktree remove agents/<slug>
git branch -d agents/<slug>
git worktree prune          # cleans the registry if the dir was removed by hand
# 4. Move leftover .codex / .omx dirs (codex-setup artifacts) out
mv agents /tmp/...          # hook blocks rm -rf; mv to /tmp instead
```

**Why owner-first**: omx registers a tmux resize-hook (`registerHudResizeHook`) that reaps+recreates the HUD pane on reconcile (every `HUD_RESIZE_RECONCILE_DELAY_SECONDS = 2`). Kill the HUD alone → hook respawns it. Kill the omx leader pane → hook dies with it → HUD stays dead.

## Traps hit (each cost a cycle)

1. **`git stash` from inside a non-worktree `agents/<slug>` dir hits the MAIN repo.** When the worktree was already de-registered but the plain dir remained, `cd agents/codex-buddy && git stash -u` resolved `.git` UP to the main repo and stashed *the lead's uncommitted work* ("WIP on main"). Recover with `git stash pop`. Guard: verify `git rev-parse --show-toplevel` before stashing inside a suspected worktree.
2. **omx `.codex/.tmp` and `.omx` block `git worktree remove`** (untracked files). Move them to /tmp first (hook blocks `rm -rf` → use `mv`).
3. **Hooks block destructive git**: `--force`, `git checkout -- .`, `git branch -D`, `git stash drop`, `rm -rf` are all blocked (Nothing is Deleted). Use: `git stash` (not checkout), `git branch -d` (not -D), `mv to /tmp` (not rm), and leave stale stashes rather than dropping them.

## The HUD flicker root cause (separate from teardown, but why we kept respawning)

omx's 2-line HUD pane ("m5", height 2) is created by the **`--madmax`** detached-session path — NOT by spawn method or window layout. `--direct` alone means "no tmux/HUD management" (cli/index.js:167), but `--madmax` overrides it with its detached-session bootstrap that force-splits the HUD when `window height ≥ 45` (`HUD_TMUX_MIN_LAUNCH_WINDOW_HEIGHT_LINES`, checks **window** height not pane height). Fix hypothesis: use `omx --yolo --direct` (yolo = bypass approvals, no detached HUD path) instead of `omx --direct --madmax`. See [[2026-07-07_codex-buddy-worktree-isolation]].

Companion: `Makefile` target `make buddy-down` automates steps 1-4.
