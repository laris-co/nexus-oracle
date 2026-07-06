# MCP Server-Building Taxonomy + Concrete Recommendation

*Deep-research via `/workflows` + `/sonnet`: 5 parallel Sonnet agents (SDK/framework survey, server taxonomy, resources/prompts usage, best practices, build-option comparison) + 1 synthesis agent, 2026-07-06. Reference report only.*

## The question this answers

After a full day researching Turso/Spice.ai/MCP transports, the session reached a "do we need to go study how MCP servers are built, or are we stuck for another reason?" moment. This research settles it.

## 1. The taxonomy — three axes people conflate

**Transport (2, converging to ~1 for remote)**: `stdio` (local, trusted by construction) and `Streamable HTTP` (the settled standard for remote access — every actively maintained SDK across every language supports both today; classic SSE is deprecated everywhere).

**Primitives (3 defined, ~1.5 actually used)**: Tools (model-controlled) are ~90%+ of what real servers expose. Resources (app-controlled, read-only reference data) see modest niche adoption. Prompts (user-controlled workflow templates) are the rarest — found almost only in reference/demo servers and a handful of large official servers (GitHub) with budget to implement the full spec. Root cause of the neglect: a client chicken-and-egg problem (no popular client rendered resources/prompts usefully until recently), not that the primitives are useless.

**Functional categories (~11, clustering into 5 architecture patterns)**: local-tool wrappers, data-access/read-only connectors, action/write-capable SaaS wrappers, gateway/aggregator/federation servers, browser automation, search/RAG, stateful/memory servers, workflow-orchestration, observability, payments, and long-tail domain-specific. Academic framing (arXiv 2606.30317) reduces this to 5 patterns: Resource Gateway, Stateful Session Server, Proxy/Aggregator, Tool Orchestrator, Domain-Specific Adapter. A cross-cutting security axis matters in production: "reader" (read-only, wide access) vs. "actor" (write-capable, deliberately no MCP access to avoid a compromised reader becoming a write/exfil vector).

**One-sentence answer**: 2 transports, 3 primitives (really ~1.5 in practice), ~11 functional niches collapsing into 5 architectural patterns — gateway/aggregation is the one category still actively contested (17+ competing tools, no dominant winner), everything else is fairly settled.

## 2. Key surprises (refining earlier session beliefs)

- **arra-oracle-v3's tools-only design (no resources/prompts) is not a gap — it's the ecosystem norm**, confirmed independently across `modelcontextprotocol/servers`, community writeups, and a dev.to survey.
- **Federation/import is a distinct product category, not a bolt-on feature.** Every real federation implementation found (MetaMCP, mcp-aggregator, agentgateway, Kong) is a dedicated gateway product — never a feature retrofitted into a single-purpose server like arra-oracle-v3. This directly overturns the earlier framing of "add an mcpImports feature."
- **The Streamable HTTP SDK dependency is already installed and unused** in arra-oracle-v3 — this reframes "add Streamable HTTP" from "build a feature" to "finish wiring up something already there."
- **Auth is the single most load-bearing gap between "toy" and "production" remote MCP servers** — CVE-2025-6514 (mcp-remote RCE via unsanitized OAuth redirects) is a live cautionary tale, not theoretical.
- Ecosystem scale check: MCP has passed 97M monthly SDK downloads and 81k+ combined GitHub stars across all official SDKs (March 2026).

## 3. The recommendation

**Build Streamable HTTP transport for arra-oracle-v3. Do not build MCP-import/federation.**

Precedent overwhelmingly favors turning on Streamable HTTP — every SDK treats "local → remote" as sprint-sized routine work, not R&D. Federation is architecturally a different, still-unsettled product category (tool-name collisions, schema mismatch, auth-passthrough governance are all open design problems across the 17+ competing tools) — building it now risks redoing it once ecosystem patterns settle, and arra-oracle-v3 doesn't need it until it's itself reachable remotely with consumers wanting to route through it. Streamable HTTP is a prerequisite for federation mattering at all, not the reverse.

**Smallest concrete first step**: instantiate a second transport (`StreamableHTTPServerTransport` from the already-installed `@modelcontextprotocol/sdk`) mounted at `/mcp` on a minimal Express/Hono app, gated behind a single hard-coded API-key check middleware, running alongside the existing stdio transport (don't remove it). Ship stateless-only first (skip session/shared-state work). Validate with one remote client calling `oracle_search` over HTTP with auth enforced. Layer in session-based shared state only once the basic remote path is proven.

## 4. Does this change "we already know enough, just build"?

**No new gap — it confirms and sharpens the plan.** It resolves the Option A vs. B ambiguity with concrete precedent (not just intuition), shows the auth risk is mechanical/well-understood to close (API key now, OAuth 2.1 later if third parties need access), and confirms the existing tools-only design needs no primitive-coverage fix before shipping. Verdict: proceed to build — this is finishing a wire-up, not opening a new investigation.
