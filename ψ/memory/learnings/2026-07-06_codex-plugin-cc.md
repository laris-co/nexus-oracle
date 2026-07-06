---
pattern: "Learned openai/codex-plugin-cc: broker-daemon JSON-RPC multiplexing, spawn-time sandbox declaration, disk-persisted resumable jobs, fake-codex test fixture"
date: 2026-07-06
source: "learn: openai/codex-plugin-cc"
concepts: ["learn", "codebase", "json-rpc", "sandbox", "broker-daemon", "codex", "claude-code-plugin", "testing-fixtures"]
---

# Learned openai/codex-plugin-cc

- A shared **broker daemon** multiplexes many Claude Code sessions onto one Codex app-server process over JSON-RPC 2.0/JSONL, instead of spawning a fresh Codex CLI subprocess per call — trades per-call isolation for resource efficiency + request queueing.
- Sandbox mode (read-only vs workspace-write) is declared once at spawn time and enforced by the broker before the Codex subprocess touches the filesystem — security boundary lives at the broker layer, not deep in Codex itself.
- Background jobs persist to disk keyed by workspace root + job ID, so long-running delegations survive session boundaries and resume by thread ID.
- Test suite fakes the entire Codex app-server binary (`fake-codex` fixture, Node's `node --test`) so broker/JSON-RPC/task-worker logic is fully tested with zero real Codex dependency — a reusable pattern for testing any subprocess-delegation system.
