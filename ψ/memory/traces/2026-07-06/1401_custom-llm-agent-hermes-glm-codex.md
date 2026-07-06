---
query: "custom LLM agent providers, Hermes agents with GLM-5.2 and Codex models, custom model backend configuration"
target: "nexus-oracle"
mode: deep
timestamp: 2026-07-06 14:01
friction_score: 0.2
coverage: [oracle (unavailable), files, git (skipped - Wave 1 sufficient via cross-repo), cross-repo, github (skipped)]
confidence: medium
---

# Trace: custom LLM agent providers / Hermes + GLM-5.2 + Codex

**Target**: nexus-oracle
**Mode**: deep | **Friction**: 0.2 (very hidden) | **Confidence**: medium
**Time**: 2026-07-06 14:01

## Oracle Results
Not available — `arra-oracle` MCP server (muninn_search/muninn_trace) was not connected in this session (ToolSearch returned no matching tools). Skipped, not a zero-result finding.

## Files Found (nexus-oracle repo)
None relevant. Hermes appears only as a narrative/organizational sibling-Oracle reference (comms/message-routing role) in README.md, CLAUDE.md, ψ/memory/resonance/{nexus,oracle}.md — no LLM/model configuration. "Codex" appears only as: (a) this session's own `codex-plugin-cc` CLI research (ψ/learn/openai/codex-plugin-cc/), and (b) a CLI-tool-detection list entry (`ψ/memory/traces/2026-03-07/1923_who-are-you.md`) alongside Claude Code/Cursor/Gemini CLI. No GLM/GLM-5.2 mentions anywhere in-repo.

## Git History
Skipped — Wave 1 cross-repo search was sufficient to find a direct answer.

## GitHub Issues/PRs
Skipped — not applicable, answer found via local vault cross-repo search.

## Cross-Repo Matches
**Confirmed real, dated, first-person source** — found via `grep -rli 'glm-5.2\|glm5.2' ~/Code ~/.claude ~/.maw`:

- `/Users/nat/.claude/projects/-opt-Code-github-com-Arkkra-Co-volt-oracle/memory/reference_hermes_gateway_ops.md` — volt-oracle's own auto-memory reference file: **"Hermes main = glm-5.2 (coding endpoint api.z.ai/api/coding/paas/v4, coding-plan only; standard API ~next week). Aux tasks (compression/title/vision) = glm-4.6. ~Opus 4.7-4.8 level, 1M context."**
- `/Users/nat/Code/github.com/laris-co/oracle-vault/github.com/laris-co/fireman-oracle/ψ/inbox/2026-06-14_10-05_m5-hermes_m5-hermes-hermes-update-2.md` — Hermes's own broadcast to the fleet (2026-06-14T10:05:22Z), Thai: "Hermes ขึ้น GLM-5.2 แล้ว" (Hermes has upgraded to GLM-5.2) — same facts, direct source, plus a documented gateway crash-loop incident/runbook (pm2-based recovery) from the same rollout.
- `/Users/nat/Code/github.com/laris-co/oracle-vault/github.com/laris-co/fireman-oracle/ψ/memory/retrospectives/2026-06/14/19.31_ultracode-research-build-marathon.md` — one-line fleet-broadcast-ack log entry ("17:05, 19:29 | hermes (GLM-5.2) + noah (TEAM-MANUAL) fleet broadcasts — acked, no action"), no additional technical detail.
- No hits anywhere for "Codex" as an LLM/agent model backend (only as the OpenAI Codex CLI tool, a different concept — Codex is itself a coding agent/CLI, not a model you'd swap Claude Code's backend to).

## Oracle Memory (ψ/memory/)
No hits in nexus-oracle's own ψ/memory/{learnings,retrospectives,traces,resonance} for GLM-5.2, Hermes-as-model-backend, or Codex-as-model-backend — confirms this info genuinely lives outside this repo (cross-repo tier), not just under-indexed locally.

## Friction Analysis
**Score**: 0.2 — Very hidden (cross-repo + medium confidence). Consistent with the nature of the finding: it's a real, working fleet pattern, but it's recorded only in another oracle's (volt-oracle) private Claude auto-memory and a third oracle's (fireman-oracle) inbox — nowhere centrally indexed or documented in nexus-oracle or any obviously-discoverable location.
**Coverage**: files (nexus-oracle) ✓, oracle memory (nexus-oracle ψ/) ✓, cross-repo (~/Code, ~/.claude, ~/.maw) ✓, git history — skipped (not needed), GitHub issues — skipped (not needed), Oracle MCP — unavailable this session.
**Goal check**: Partial answer, hence confidence=medium not high. The Hermes+GLM-5.2 half of the question is answered with high confidence (real, dated, first-person source: Hermes IS running glm-5.2 as its main coding-plan engine via api.z.ai, glm-4.6 for aux tasks). The "Codex" half is NOT confirmed — no evidence anywhere in searched sources that Codex is used as an interchangeable LLM backend for any fleet agent; it only appears as a distinct CLI tool. What's missing: direct confirmation from Hermes itself (or documentation) of the exact swap mechanism (almost certainly `ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN`-style env var pointing at Z.ai's Claude-Code-compatible endpoint, based on the "coding endpoint api.z.ai/api/coding/paas/v4" URL shape and Z.ai's known public GLM Coding Plan positioning — but this specific mechanism is inferred, not confirmed via a source in this trace).

## Summary
Yes — Hermes (sibling oracle) genuinely runs a custom, non-Claude LLM backend: GLM-5.2 as its main coding-plan engine (via Z.ai's api.z.ai/api/coding/paas/v4 endpoint), with GLM-4.6 for auxiliary tasks (compression/title/vision), roughly Opus 4.7-4.8 level with 1M context — confirmed via Hermes's own 2026-06-14 fleet broadcast and volt-oracle's memory. No evidence anywhere that "Codex" is used the same way (as a swapped model backend) — Codex only appears in the fleet as OpenAI's own CLI coding tool, a categorically different thing. Next step if pursuing this: ask Hermes directly (`maw hey hermes`) for the exact gateway/env-var mechanism so it could be replicated for nexus/turso/spiceai if desired.
