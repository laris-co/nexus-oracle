# Turso vs. Spice.ai: Integration With AI Agent Frameworks

Researched via web search + direct doc/repo fetches, July 2026. Findings are organized by framework, with explicit labeling of **official** vs. **community/third-party** integrations, since this distinction matters a lot for both products.

## Quick summary table

| Framework | Turso | Spice.ai |
|---|---|---|
| **LangChain** | Community-maintained `LibSQLVectorStore` class in `@langchain/community` (JS only) | No dedicated adapter package; reachable via generic OpenAI-compatible client or `langchain-mcp-adapters` |
| **LlamaIndex** | No dedicated reader/vector-store package found | No dedicated package found; reachable via generic `llama-index-tools-mcp` or OpenAI-compatible LLM wrapper |
| **MCP** | Native, first-class — built into the `tursodb` CLI binary itself | Native, first-class — Spice acts as both MCP **client** and MCP **server** |
| **AutoGPT-style** | No official connector; closest are OpenAI Agents SDK / Claude Agent SDK examples via a third-party (Composio) MCP tool router | No official connector; closest is Spice's own "Agent Skills" (SKILL.md) format for Claude Code/Cursor-style coding agents |

---

## 1. Turso

### LangChain — real, but JS-only and community-maintained
LangChain.js added a genuine `LibSQLVectorStore` class to `@langchain/community` (`libs/langchain-community/src/vectorstores/libsql.ts`), merged via [PR #6904](https://github.com/langchain-ai/langchainjs/pull/6904) (Oct 2024) and extended with delete support ([PR #7053](https://github.com/langchain-ai/langchainjs/issues/7040)) and metadata filters ([PR #7209](https://github.com/langchain-ai/langchainjs/pull/7209)). It supports `addDocuments()` and `similaritySearchWithScore()` against Turso's native vector index, and works against remote or local libSQL/embedded-replica instances. Reference: [LibSQLVectorStore API docs](https://reference.langchain.com/javascript/classes/_langchain_community.vectorstores_libsql.LibSQLVectorStore.html).

I could **not** find a Python equivalent (`langchain_community.vectorstores.libsql`) — searches turned up only the JS class. Turso's own docs mention LangChain just once, generically, as "a tool that can generate embeddings" — not as an integrated storage backend (docs.turso.tech/features/ai-and-embeddings).

Separately, third-party platform **Composio** offers an MCP "tool router" that wires Turso operations into LangChain agents (`@composio/langchain`, `@langchain/mcp-adapters`, `MultiServerMCPClient`) — but this is Composio's integration, not an official Turso or LangChain artifact. Source: [composio.dev/toolkits/turso/framework/langchain](https://composio.dev/toolkits/turso/framework/langchain).

### LlamaIndex — no dedicated package found
No `llama-index-vector-stores-libsql`/turso package exists on PyPI or LlamaHub as of this research. The only real path is generic: point LlamaIndex's `McpToolSpec`/`BasicMCPClient` (from `llama-index-tools-mcp`) at Turso's MCP server (see below) and let the agent call Turso as a tool rather than as a native vector store. Docs: [LlamaIndex + MCP](https://developers.llamaindex.ai/python/framework/module_guides/mcp/llamaindex_mcp/), [llama-index-tools-mcp on PyPI](https://pypi.org/project/llama-index-tools-mcp/).

### MCP — Turso's strongest, most official integration
Turso ships a **built-in MCP server directly in its CLI binary** (`tursodb`) — no separate package needed:
```bash
tursodb your_database.db --mcp      # or `tursodb --mcp` for in-memory
```
It exposes 9 tools: `open_database`, `current_database`, `list_tables`, `describe_table`, `execute_query`, `insert_data`, `update_data`, `delete_data`, `schema_change`. Official announcement: [turso.tech/blog/introducing-the-turso-database-mcp-server](https://turso.tech/blog/introducing-the-turso-database-mcp-server).

Claude Code config:
```bash
claude mcp add my-database -- tursodb ./path/to/your/database.db --mcp
```
Claude Desktop config:
```json
{ "mcpServers": { "turso": { "command": "tursodb", "args": ["path/to/database.db", "--mcp"] } } }
```

There's also a separate **community, cloud-API-level** MCP server, `spences10/mcp-turso-cloud` ([GitHub](https://github.com/spences10/mcp-turso-cloud)), for org/database management (auth-token minting, org listing) rather than SQL execution — used the same way via `npx -y mcp-turso-cloud` in Claude Desktop/Cline config.

### AutoGPT-style agent frameworks — no direct hit
No AutoGPT (Significant-Gravitas/AutoGPT) connector exists. The closest analogues, both via Composio's MCP tool router rather than official Turso work, are documented integrations with the **OpenAI Agents SDK** ([composio.dev/toolkits/turso/framework/open-ai-agents-sdk](https://composio.dev/toolkits/turso/framework/open-ai-agents-sdk)) and **Claude Agent SDK** ([composio.dev/toolkits/turso/framework/claude-agents-sdk](https://composio.dev/toolkits/turso/framework/claude-agents-sdk)) — both of which are autonomous tool-calling loop frameworks in the AutoGPT lineage. Turso also ships **AgentFS** ([github.com/tursodatabase/agentfs](https://github.com/tursodatabase/agentfs), [docs.turso.tech/agentfs/introduction](https://docs.turso.tech/agentfs/introduction)), a copy-on-write agent filesystem/state store built on Turso — adjacent infrastructure for autonomous agents rather than a framework plugin.

---

## 2. Spice.ai

**Disambiguation note**: searches for "Spice.ai + LangChain" surface a lot of noise about **SpiceDB** (Authzed's authorization system, `langchain-spicedb` package, [authzed.com/blog/introducing-the-langchain-spicedb-integration](https://authzed.com/blog/introducing-the-langchain-spicedb-integration)) — an unrelated product. Everything below is about `spiceai/spiceai`, the Rust SQL/inference engine (spiceai.org).

### LangChain — no dedicated adapter
No `langchain-spiceai` package exists on PyPI/npm. Spice's own Python SDK is `spicepy` (`pip install spice-sdk` / `spicepy`, [github.com/spiceai/spicepy](https://github.com/spiceai/spicepy)) — a plain query client (`Client().query("SELECT...")`), not a LangChain `Tool`/`Retriever` subclass. Integration in practice means either (a) wrapping a `spicepy` query call as a custom LangChain `Tool`, or (b) pointing LangChain's OpenAI-compatible client at Spice's AI Gateway (`/v1/chat/completions`), or (c) using `langchain-mcp-adapters` against Spice's MCP endpoint (see MCP section) — none of these are packaged/official.

### LlamaIndex — no dedicated package
Same story: no `llama-index-llms-spiceai` or similar. Spice's AI Gateway is OpenAI-Responses-API-compatible, so it can be used with LlamaIndex's generic `OpenAILike`/`OpenAI` LLM wrapper, or reached via `llama-index-tools-mcp` pointed at Spice's `/v1/mcp` endpoint. No official LlamaIndex integration docs or package were found.

### MCP — Spice's strongest, most official integration (client AND server)
This is where Spice.ai is genuinely deep. Documented at [spiceai.org/docs/features/large-language-models/mcp](https://spiceai.org/docs/features/large-language-models/mcp) and with a runnable example at [github.com/spiceai/cookbook/blob/trunk/mcp/README.md](https://github.com/spiceai/cookbook/blob/trunk/mcp/README.md):

- **As MCP client** — Spice can run stdio MCP servers internally or connect to external ones over Streamable HTTP, configured declaratively in `spicepod.yaml`:
```yaml
tools:
  - name: google_maps
    from: mcp:npx
    params:
      mcp_args: -y @modelcontextprotocol/server-google-maps
  - name: external_mcp_server
    from: mcp:http://example.com/v1/mcp
```
  Tools are then attached to a model: `models: - name: model_with_mcp \n from: openai:gpt-4o \n params: \n tools: google_maps`.

- **As MCP server** — Spice exposes its own SQL/search/tool set at `/v1/mcp`, so another Spice instance (or any MCP-speaking agent, including a LangChain agent via `langchain-mcp-adapters` or a LlamaIndex agent via `McpToolSpec`) can consume it:
```bash
curl -H 'x-api-key: foobar' http://127.0.0.1:8090/v1/tools | jq '.[].name'
```
```yaml
tools:
  - name: spice_mcp
    from: mcp:http://localhost:8090/v1/mcp
    params:
      mcp_headers: "x-api-key: foobar"
```
Access is restricted to `localhost` by default, configurable via `runtime.mcp.allowed_hosts` in `spicepod.yaml`.

### AutoGPT-style agent frameworks — no direct hit; closest is "Agent Skills"
No official AutoGPT connector found. Spice instead ships **Spice Skills** — packaged `SKILL.md` instructions (the open "Agent Skills" format used by Claude Code, Cursor, etc.) that teach a coding agent how to configure `spicepod.yaml`, wire data sources, and use MCP — a different integration model (agent-readable instructions, not a callable tool API). Announced at [spice.ai/blog/introducing-spice-skills-for-ai-coding-agents](https://spice.ai/blog/introducing-spice-skills-for-ai-coding-agents), installed via `/plugin marketplace add spiceai/skills` (Claude Code) or `npx skills add spiceai/skills` (any compatible agent), source at [github.com/spiceai/skills](https://github.com/spiceai/skills).

---

## Bottom line

- **Turso's** deepest, most official framework touchpoint is **MCP built directly into its own CLI binary** — genuinely first-party. Its **LangChain** story is real but narrow (one community-contributed JS vector-store class, no Python equivalent). **LlamaIndex** has no dedicated package at all — only reachable generically through MCP. **AutoGPT-style** support is entirely third-party (Composio) and framework-adjacent (OpenAI Agents SDK, Claude Agent SDK), not AutoGPT itself.
- **Spice.ai's** deepest, most official touchpoint is also **MCP** — but unusually strong on both sides (it's a full client *and* server), plus an OpenAI-compatible gateway that any OpenAI-client-based framework (LangChain, LlamaIndex) can point at generically. It has **no dedicated LangChain or LlamaIndex packages**, and **no AutoGPT connector** — its "agent framework" story for coding agents runs through the separate Agent Skills mechanism, not a tool-calling API.
- In both cases, **MCP is the de facto integration layer** for 2026 — neither vendor maintains bespoke LangChain/LlamaIndex/AutoGPT adapters as their primary strategy; they bet on MCP compatibility and let generic MCP-consuming code in those frameworks (`langchain-mcp-adapters`, `llama-index-tools-mcp`, OpenAI/Claude Agents SDKs) do the bridging.

**Sources**
- [LibSQLVectorStore PR #6904](https://github.com/langchain-ai/langchainjs/pull/6904) / [API reference](https://reference.langchain.com/javascript/classes/_langchain_community.vectorstores_libsql.LibSQLVectorStore.html)
- [Turso: Databases For All Your AI Apps](https://turso.tech/blog/databases-for-all-your-ai-apps)
- [Introducing the Turso Database MCP Server](https://turso.tech/blog/introducing-the-turso-database-mcp-server)
- [Turso AI & Embeddings docs](https://docs.turso.tech/features/ai-and-embeddings)
- [mcp-turso-cloud (community)](https://github.com/spences10/mcp-turso-cloud)
- [Composio: Turso + LangChain](https://composio.dev/toolkits/turso/framework/langchain), [+ OpenAI Agents SDK](https://composio.dev/toolkits/turso/framework/open-ai-agents-sdk), [+ Claude Agent SDK](https://composio.dev/toolkits/turso/framework/claude-agents-sdk)
- [Turso AgentFS](https://github.com/tursodatabase/agentfs) / [docs](https://docs.turso.tech/agentfs/introduction)
- [Spice.ai MCP docs](https://spiceai.org/docs/features/large-language-models/mcp)
- [Spice.ai MCP cookbook example](https://github.com/spiceai/cookbook/blob/trunk/mcp/README.md)
- [Spice.ai for Agentic Applications](https://spiceai.org/docs/v1.5/use-cases/agentic-apps)
- [Spice Skills announcement](https://spice.ai/blog/introducing-spice-skills-for-ai-coding-agents) / [skills repo](https://github.com/spiceai/skills)
- [spicepy Python SDK](https://github.com/spiceai/spicepy)
- [LlamaIndex + MCP](https://developers.llamaindex.ai/python/framework/module_guides/mcp/llamaindex_mcp/) / [llama-index-tools-mcp](https://pypi.org/project/llama-index-tools-mcp/)
- (Unrelated, for disambiguation) [SpiceDB + LangChain](https://authzed.com/blog/introducing-the-langchain-spicedb-integration)