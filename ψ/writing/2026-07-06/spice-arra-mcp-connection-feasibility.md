# Can spicepod.yaml Actually Connect to arra-oracle-v3's Memory Tools?

*Deep-research via `/workflows`: 4 parallel Sonnet agents (source-code read on both repos + web/GitHub research) + 1 synthesis agent, 2026-07-06. Reference report only — no code changes; nothing was run or deployed, this is source-code analysis only.*

## Direct answer

**PARTIALLY — structurally possible today via a specific undocumented workaround, but never demonstrated by anyone, anywhere.** Both sides are stdio-only, neither side requires auth in its default mode, and the one hard security restriction on the Spice side (no absolute paths in the `command` field) has a legal escape hatch (`params.mcp_args` is unrestricted). This is a real, traceable path — not proven end-to-end.

## Correcting a premise: "spicechat" isn't a real product

GitHub code/issue search across `spiceai/spiceai` and the whole `spiceai` org returns **zero hits** for the literal string "spicechat." It's almost certainly shorthand for one of two real things, both driven by the same `spicepod.yaml`:
- **`spice chat`** (two words) — a CLI subcommand (`spiceai.org/docs/cli/reference/chat`) opening an interactive REPL or one-shot chat against a model registered in `spicepod.yaml` (flags: `--model`, `--temperature`, `--endpoint`, `--headers`)
- the **`/v1/chat/completions`** OpenAI-compatible HTTP endpoint the Spice runtime exposes for those same spicepod-configured models

(There's also an unrelated consumer app, SpicyChat.ai — confirmed irrelevant, different vendor entirely.)

## The exact mechanism

**Spice's spawn call** (`crates/runtime-tools/src/mcp/catalog.rs:185-197`):
```rust
MCPConfig::Stdio { command, args, env } => {
    TokioChildProcess::new(Command::new(command.as_str()).configure(|c| {
        c.envs(env).args(args);
    }))
}
```
- `.current_dir()` is never called anywhere in the MCP module — the spawned process inherits **Spice's own cwd**, not configurable per-tool (`Tool` struct has no `cwd`/`working_dir` field, and is `#[serde(deny_unknown_fields)]`).
- `env: HashMap<String,String>` from spicepod.yaml **is** fully wired through (secrets-resolved, then merged onto the child's inherited environment via `.envs(env)` — parent env isn't cleared).
- The `command` string is checked against a `DANGEROUS_PATH_GLOB_SET` that **explicitly rejects absolute paths** (the `/*` glob) and `..` traversal — proven by their own unit test `test_dangerous_patterns_reject_absolute_paths`, which asserts `/etc/passwd` and `/var/log/secrets` are rejected. So `from: mcp:/usr/bin/bun` fails at construction; you must use a bare command name resolved via Spice's own `PATH`.
- **The escape hatch**: `args`/`params.mcp_args` are only length/count-checked (max 100 args, 4096 bytes each) — **not** path-content-checked. An absolute path is legal there. `mcp_args` is naively `split_whitespace()`'d — no shell quoting, so a path with a space would break.

**arra-oracle-v3's spawn target**: confirmed stdio-only — a repo-wide search for `StreamableHTTPServerTransport`/`SSEServerTransport`/`rmcp` returns zero matches; it connects exclusively via `StdioServerTransport` (`src/mcp/server.ts:237-241`). Critically, `bin/mcp.ts`'s `launcherRoot()` derives its own repo root from `import.meta.url`, **not from cwd** — meaning it's already tolerant of being spawned from an arbitrary working directory, which is exactly what Spice's uncontrollable-cwd behavior requires. And there's **no auth of any kind** in the default embedded mode — `OracleMCPServer`'s constructor performs no credential check whatsoever; any process that can exec `bun bin/mcp.ts` gets full access.

**Putting them together**: `command` must be the bare runtime (`bun`), and the absolute path to `bin/mcp.ts` must go in `params.mcp_args` — exactly the workaround the source code allows and that nobody has documented.

## A concrete spicepod.yaml snippet (untested, derived from source only)

```yaml
tools:
  - from: mcp:bun
    name: arra_oracle
    env:
      HOME: /Users/nat                 # required — arra-oracle-v3's src/config.ts throws if unset
      ORACLE_REPO_ROOT: /absolute/path/to/arra-oracle-v3   # optional; bin/mcp.ts auto-derives it anyway
    params:
      mcp_args: /absolute/path/to/arra-oracle-v3/bin/mcp.ts
```

## What the model would actually see (naming)

Every non-default tool catalog (MCP catalogs are never in Spice's `default_catalog_names = ["memory","builtin"]`) gets its tools prefixed via `encode_tool_name(catalog, tool) → "{catalog}__{tool}"`. Auto-discovery is unconditional and complete — `McpToolCatalog::list_tools` pages through the server's `tools/list` and wraps **every** returned tool with no filtering. arra-oracle-v3 currently registers 30 MCP tools (confirmed list: `oracle_search`, `oracle_ask`, `oracle_recap`, `oracle_read`, `oracle_learn`, `oracle_list`, `oracle_stats`, `oracle_concepts`, `oracle_supersede`, `oracle_research_note`, `oracle_handoff`, `oracle_inbox`, `oracle_thread*` ×4, `oracle_profile`, `oracle_trace*` ×6, `oracle_reflect`, `oracle_verify`, `oracle_mcp_list_tools`, `oracle_mcp_call`, plus a guide entry literally named `____IMPORTANT`). A Spice model with `tools: auto` would see and call all of them as `arra_oracle__oracle_search`, `arra_oracle__oracle_ask`, `arra_oracle__oracle_recap`, etc. — no curation, no allowlist, the entire tool surface at once.

## Caveats and blockers (confirmed vs. genuinely unknown)

**Confirmed facts:**
- No auth gate on arra-oracle-v3's side in default mode — removes one whole blocker class.
- `HOME` env var is mandatory for arra-oracle-v3 and must be explicitly re-supplied in Spice's `env:` block (uncertain whether Spice's own runtime environment already has it set, especially in containerized/service deployments).
- `command` can never be an absolute path on the Spice side — must be a bare name resolvable on Spice's own `PATH`.

**Genuine unknowns (nobody has tried this):**
- **Zero public examples exist** of Spice.ai connecting to any hand-written/unpublished stdio MCP server. Every real-world example (docs, cookbook, GitHub issues) uses `mcp:npx`/`mcp:docker`/`mcp:uvx` against already-published packages (Google Maps, GitHub, filesystem, Atlassian). The `bun <script.ts>` pattern here is inferred purely from reading Rust source, never demonstrated end-to-end.
- Whether `bun` resolves/executes a `.ts` file correctly under whatever sandboxing the Spice runtime process runs in is unverified.
- Whether Spice's tool-name encoder handles a leading-underscore tool name (`____IMPORTANT`) gracefully is unchecked.

## Relevance to the "config + federation is the key" insight

This confirms the pattern from the [[2026-07-06_spiceai-mcp-ai-integration]] research is genuinely load-bearing, not just theoretical: importing an entire external tool surface into Spice.ai really does take one `tools:` block, no handler code, no SDK wiring — even for a project (arra-oracle-v3) Spice's authors never anticipated connecting to. The reverse capability (arra-oracle-v3 auto-importing an external MCP server's tools the same way) does not exist yet in arra-oracle-v3's own manifest system — this is the concrete shape of the gap identified in [[project_arra-config-federation-key-insight]].

## Addendum: stdio vs. Streamable HTTP — the better direction (2026-07-06, same-day follow-up)

Nat asked directly: is there tutorial content for the stdio workaround above, is arra-oracle-v3's transport choice (if it were SSE) actually bad, and does the target really have to be a literal file on disk? Quick follow-up checks answer all three and point to a cleaner alternative than the stdio workaround documented above:

- **No tutorial exists for the stdio workaround** (already established above) — confirming there's no beaten path to follow if arra-oracle-v3 stays stdio-only.
- **arra-oracle-v3 isn't SSE today — it's stdio-only** (see §1 above). The question of "is SSE bad" is really "if we add an HTTP transport, should it be classic SSE or Streamable HTTP?" — and the answer is unambiguous: **classic SSE would not even be connectable from Spice.ai's own MCP client.** Spice's `MCPType` enum (`crates/runtime-tools/src/mcp/mod.rs:60-68`) has exactly two variants — `StreamableHttp(url::Url)` and `Stdio(String)` — there is no classic-SSE-client variant at all. Spice itself removed its own SSE *server* in v2.0.0 (June 2026) in favor of Streamable HTTP. Classic SSE is legacy: kept in the MCP TypeScript SDK only for backward-compat with pre-2025-03-26-spec clients (its own type docs point implementers toward newer replacements — see `SSEServerTransportOptions`'s `@deprecated` field annotations in the SDK's `server/sse.d.ts`).
- **The SDK for Streamable HTTP is already sitting in arra-oracle-v3's own `node_modules`, unused**: confirmed installed version `@modelcontextprotocol/sdk@1.29.0` (`package.json:116`, matches `node_modules/@modelcontextprotocol/sdk/package.json:3`) already ships `server/streamableHttp.js` (+ `.d.ts`) and even a reference example, `examples/server/sseAndStreamableHttpCompatibleServer` — i.e. adding a Streamable HTTP transport isn't a new dependency, it's turning on a capability already present in the exact package arra-oracle-v3 already depends on for its stdio transport.
- **"Does it have to be a real file?" — yes, but only because stdio is a subprocess spawn.** Two processes talking over stdin/stdout must share a filesystem (or at least a path the spawning process can exec) — that's inherent to the transport, not a config quirk. **Adding a Streamable HTTP transport removes this constraint entirely**: Spice (or any MCP client) would connect via `from: mcp:https://host:port/mcp` (or `mcp:http://localhost:.../mcp` for local), a network call — no shared filesystem, no `bun` resolvable on Spice's `PATH`, no absolute-path-in-`mcp_args` workaround, no cwd uncertainty. This is also the officially documented, actually-demonstrated pattern (Spice's own cookbook "child" recipe connects Spice-to-Spice over `mcp:http://localhost:8090/v1/mcp` — this exact shape, just pointed at a different server).

**Bottom line recommendation**: if arra-oracle-v3 wants to be reachable by Spice.ai (or any other MCP-Streamable-HTTP client) without the untested stdio workaround, the target worth investigating is a **Streamable HTTP transport add-on to `src/mcp/server.ts`** (alongside the existing stdio one, not replacing it — Claude Desktop/Code still expect stdio), using the SDK version already installed. This is still just a direction to evaluate, not a decision to implement — no code has been changed.
