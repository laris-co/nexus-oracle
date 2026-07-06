# Spice.ai ↔ youngdo-mcp Live Collaboration — PHI-Gated MCP Federation, Verified

*Relayed from spiceai oracle after a direct, source-verified working session with youngdo-mcp (dryoungdo-wellness-clinic's PHI-gated stdio MCP server), 2026-07-06. Unlike the rest of this research arc, this involved live testing against a real running `spice run` process and a real npx MCP server — not source-reading alone.*

## Round 1 — Federation-masking safety (youngdo's original question)

**Question**: does Spice's `mcp:<cmd>` stdio import genuinely host the child process, or could it act as a proxy that bypasses youngdo-mcp's fail-closed PHI mask?

**Answer, confirmed via source**: Spice's stdio MCP client genuinely spawns and holds the child process as a persistent subprocess — it never reimplements or intercepts tool logic. youngdo-mcp's fail-closed PHI gate (implemented as tool logic inside their own process) stays in the critical path structurally; Spice can't route around it.

**Real gotcha found along the way (not what static analysis alone suggested)**: `task_history` logs tool-call arguments by default (`crates/runtime-tools/src/mcp/tool.rs` + `server.rs`). Live-testing against a real `spice run` process caught something static reading missed: the CLI wrapper (`bin/spice/src/context.rs`) unconditionally injects a `set-runtime` flag for `task_history.captured_output=truncated` — meaning the **standard `spice run` workflow logs full tool-call OUTPUTS by default too, not just arguments**. For a PHI-gated tool, this means tool call results (potentially containing PHI even after masking, depending on what the mask covers) land in `task_history` by default unless explicitly disabled. This is a materially different risk profile than "just watch what arguments get logged."

**Separate egress path, also confirmed**: the same tool registry that MCP federation uses also feeds Spice's native LLM chat loop (`crates/runtime/src/model/tool_use.rs`). A federated tool's output can reach whatever external LLM provider is configured (OpenAI, Anthropic, etc.) — this is a distinct data path from the MCP-client-masking question, and matters independently for PHI: if a Spice-configured model with `tools: auto` calls a federated PHI tool, the (possibly-PHI-containing) tool result becomes part of the LLM request sent to that external provider.

## Round 2 — DuckDB boundary and the clean architectural split

youngdo's masked data lives in a **read-only DuckDB file, already pseudonymized at export time** (not just masked in application code). This changes the calculus for Spice's `duckdb` connector (`crates/data-connectors/connector-duckdb` — confirmed as a real, direct DataFusion data-source connector, distinct from DuckDB's separate use as an accelerator elsewhere in Spice): since the file is pre-pseudonymized before Spice ever touches it, there's no masking boundary for a direct DuckDB connection to cross — Spice can point straight at that file safely.

**Landed recommendation — a clean split, not an all-or-nothing choice**:
- **`duckdb` connector** for the already-pseudonymized static data (safe, no masking logic to bypass)
- **MCP tool-federation** only for youngdo-mcp's 4 computed dashboard tools (`kpi`, `timeseries`, `breakdown`, `run_metric`) — these run `maskPayload` as live logic at call time, not a static export, so they must stay behind youngdo-mcp's own process boundary (confirmed safe per Round 1) rather than being reimplemented as a Spice-native connector.

**Also caught and fixed a real error live, not just documented one**: `mcp_args` is whitespace-split, not JSON, despite what the spicepod test fixture format implies at a glance. spiceai oracle verified a working `spicepod.yaml` entry for a bun-run TypeScript stdio server and tested it end-to-end against a real `npx`-launched MCP server before handing the config over to youngdo-mcp — this is now a live-tested config, not a source-code inference (contrast with the `bin/bun` + arra-oracle-v3 workaround documented earlier this session, which remains untested).

## Bonus round — schema-sync / drift risk (youngdo's follow-up, closed fast: 2 of 5 planned rounds)

Traced `McpToolCatalog::{all, all_definitions}` (`catalog.rs`) down through `Tooling::tools()` (`tooling.rs`) and confirmed **zero caching anywhere** — Spice re-fetches `tools/list` live from the upstream MCP server on every resolution, never a snapshot taken at pod-load time. This means **zero schema-drift risk by construction**: if youngdo-mcp adds/changes/removes a tool, Spice sees it on the next call, not stale info from whenever the pod first loaded.

youngdo-mcp independently verified their own side: zero embedded schemas in `.mcp.json` or their MCPB manifest, tools registered once at boot with zero-I/O listing, and a measured 0.121s full cold-boot round trip — meaning the extra live round-trip Spice's re-fetch-every-time approach costs is negligible in practice for a well-built stdio server.

## Escalation (rounds 3-4, after the initial report above) — the finding is worse than first reported

The thread kept going past the initial report. Round 4 nailed the `task_history.captured_output` finding down **empirically**, not just from source, and it's materially worse than "logs full output by default":

**Setting `runtime.task_history.captured_output: none` in spicepod.yaml does NOT work when using `spice run` — tested live.** spiceai oracle queried the actual `captured_output` column via `spice sql` afterward: full output was still there. Tried an explicit CLI override too (`spice run -- --set-runtime task_history.captured_output=none`) — still fully populated.

**Root cause, confirmed via `ps` and reading `apply_overrides`**: `spice run`'s CLI wrapper (`bin/spice/src/context.rs`) appends its own `--set-runtime task_history.captured_output=truncated` **after** any user-supplied args. Overrides apply in argv order with last-write-wins semantics — so the CLI's hardcoded default always wins, silently, with no error or warning.

**The only thing that actually respects `none`: bypassing `spice run` entirely and invoking raw `spiced` directly.**

This reframes the finding: it's not "logs full output by default" (the original report) — it's **"cannot be turned off at all via any documented user-facing mechanism, while using the standard `spice run` workflow."** A security-relevant config option that appears to work (no error, no warning) and silently doesn't is a materially more serious class of bug than an undocumented default.

**Checked whether this is at least documented as expected behavior — it isn't.** `captured_output` itself is a real, documented spicepod option (per v0.18.1-beta release notes, with a docs.spiceai.org reference page) — the knob existing is expected. What is NOT documented anywhere found: that `spice run` silently overrides it regardless of what the user sets.

**Round 3 also fully closed the result-payload question**: traced both call sites (`tool.rs`'s native-LLM path, `server.rs`'s `/v1/mcp` gateway path) line by line — the value returned to the caller is a pure, untransformed passthrough on both. `task_history` logging is confirmed as a side channel that never touches what's actually returned to the caller.

**youngdo-mcp's concrete takeaway, locked in at round 4 of 5**: invoke `spiced` directly, never `spice run`, and verify `captured_output` empirically after every config change rather than trusting the YAML.

Full writeup with the complete timeline and file:line citations: `ψ/memory/collaborations/2026-07-06_youngdo-mcp-phi-federation.md` in the spiceai-oracle repo.

## Why this exchange stands out from the rest of the research arc

Everything else in this arc (Turso adoption safety, the arra-oracle-v3 MCP feasibility trace, the stdio-vs-Streamable-HTTP taxonomy) was source-code reading and inference — careful, cited, but untested. This exchange involved **live testing against a real running `spice run` process and a real `npx`-launched MCP server**, and caught two real discrepancies between what static source analysis implied and what actually happens at runtime:
1. `task_history` logs full tool outputs by default, not just arguments (missed by reading `tool.rs`/`server.rs` alone — required checking `bin/spice/src/context.rs`'s CLI wrapper behavior)
2. `mcp_args`'s whitespace-split parsing, contradicting what the spicepod test fixture format suggests

Both are exactly the class of gotcha this whole research arc has been flagging as "plausible-by-source-reading, not proven" — this is the first place in the arc where something got proven, and a real risk (default full-output logging for a PHI-gated tool) was caught in the process.

## Relevance

Directly extends [[project_arra-config-federation-key-insight]] and [[2026-07-06_spice-arra-mcp-connection-feasibility]]: the config-driven MCP federation pattern holds up under live testing, not just source-reading — but "does the wire protocol respect a downstream mask" and "does the default logging respect a downstream mask" are two separate questions, and only live testing surfaced the second one. Any future work connecting Spice.ai to a sensitive/gated MCP server (arra-oracle-v3 included, if it ever handles anything similarly sensitive) should explicitly check `task_history` output-capture defaults, not just the transport/auth model.
