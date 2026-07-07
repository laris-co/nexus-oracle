# Nexus Oracle — Codex Buddy
#
#   make buddy        — worktree-isolated buddy as right pane, no border flicker
#   make buddy-down   — clean teardown: kill owner pane → HUD → worktree → branch
#   make buddy-status — list panes
#   make no-flicker   — reset pane-border-status off (kills the "⠐ Claude Code" blink)
#
# FLICKER ROOT CAUSE (proven 2026-07-07): `maw tile` sets `pane-border-status bottom`
# on the session → tmux draws a bottom border showing the pane title "⠐ Claude Code",
# and the ⠐ is Claude Code's live spinner → the border redraws every frame → blink.
# Fix: `tmux set -t <session> pane-border-status off` after every `maw tile`.
# (NOT the omx HUD — that was a day-long red herring. See ψ/memory/learnings.)

CODEX_ACCT ?= 2
WT_SLUG    ?= codex-buddy
WT_DIR     := $(CURDIR)/agents/$(WT_SLUG)
SETUP      := $$HOME/.claude/skills/oracle-team/scripts/codex-setup.ts
SESSION    ?= 13-nexus

.PHONY: buddy buddy-down buddy-status no-flicker help

buddy: ## Worktree-isolated buddy as right pane (auto-resets border → no flicker)
	@test -d $(WT_DIR) || git worktree add $(WT_DIR) -b agents/$(WT_SLUG)
	maw tile 1 --cmd 'cd $(WT_DIR) && bun $(SETUP) $(CODEX_ACCT) && CODEX_HOME=$$PWD/.codex OMX_AUTO_UPDATE=0 omx --yolo --direct'
	@tmux set-option -t $(SESSION) pane-border-status off && echo "✓ pane-border-status off (no flicker)"

no-flicker: ## Reset pane-border-status off (kills the "⠐ Claude Code" blink)
	@tmux set-option -t $(SESSION) pane-border-status off && echo "✓ pane-border-status off"

buddy-down: ## Clean teardown: kill owner pane first, then HUD, worktree, branch
	@for p in $$(tmux list-panes -t $(SESSION):1 -F '#{pane_id} #{pane_current_path}' | grep '$(WT_SLUG)' | awk '{print $$1}'); do \
		tmux kill-pane -t $$p 2>/dev/null && echo "killed owner $$p"; \
	done
	@sleep 2
	@for p in $$(tmux list-panes -t $(SESSION):1 -F '#{pane_id} #{pane_height}' | awk '$$2<=3 {print $$1}'); do \
		tmux kill-pane -t $$p 2>/dev/null && echo "killed HUD $$p"; \
	done
	@test -d $(WT_DIR)/.codex && mv $(WT_DIR)/.codex /tmp/nexus-codex-$$(date +%s) 2>/dev/null || true
	@test -d $(WT_DIR)/.omx && mv $(WT_DIR)/.omx /tmp/nexus-omx-$$(date +%s) 2>/dev/null || true
	@git worktree remove $(WT_DIR) 2>&1 && echo "worktree removed" || echo "worktree busy — move dirty files first"
	@git worktree prune
	@git branch -d agents/$(WT_SLUG) 2>/dev/null && echo "branch deleted" || true

buddy-status: ## List nexus panes
	@tmux list-panes -t $(SESSION):1 -F '  #{pane_id}  #{pane_title}  H=#{pane_height}  #{pane_current_path}' 2>&1

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-14s %s\n", $$1, $$2}'
