---
pattern: "arra-oracle-v3 adopting Turso as an optional storage backend has 2 structural blockers (FTS5 parity unverified, sqlite-vec categorically incompatible) plus a safety gap (feature flags don't stop native panics from crashing the whole process) — investigate, don't build yet"
date: 2026-07-06
source: "workflow: oracle-prism 20 lenses + synthesis, cross-referencing arra-oracle-v3's actual code against Turso's known limitations"
concepts: ["arra-oracle-v3", "turso", "fts5", "sqlite-vec", "storage-adapter", "risk-assessment", "process-isolation"]
---

# Learned: safety analysis of adopting Turso in arra-oracle-v3

- **FTS5 is the central open question, unverified**: arra-oracle-v3's `oracle_fts` (porter/unicode61 tokenizer) is the codebase's *always-on fallback* — every degraded vector-search path lands there (`VECTOR_FALLBACK=fts5`). Turso is a from-scratch Rust rewrite, not a libsqlite3 fork, so FTS5 isn't inherited for free; no evidence anyone has verified parity (tokenizer set, MATCH grammar, bm25() ranking). This alone is a go/no-go gate.
- **sqlite-vec (vector search) categorically cannot run under Turso** — not a "needs porting" gap but a structural wall: `sqlite-vec` loads via `sqlite.loadExtension()` (real SQLite's native `sqlite3_load_extension`), and Turso's own COMPAT.md states `.so`/`.dylib` loadable extensions are unsupported. A Turso adoption would permanently strand vector search on bun:sqlite unless a wholly new Turso-native vector adapter gets built.
- **The "existing adapter precedent" is partly aspirational**: arra-oracle-v3's D1 (Cloudflare) support — the only prior "new backend" — did NOT go through the `StorageBackend` registry at all; it built a separate `DbConnection` union specifically because D1's async shape didn't fit. Turso would be the *first* real test of whether `StorageBackend` can flex to an async engine, not a confirmation it already does.
- **Feature flags create false safety against the actual failure mode.** Turso's documented failure mode (WAL corruption) is a native Rust-level panic, not a catchable JS exception. Nothing in arra-oracle-v3's storage layer runs in a separate process/thread today — a flag controls *which code path runs*, not what happens when that path crashes the whole process. This is the single most important correction from this analysis: "just gate it behind an env var" is necessary but not sufficient.
- **Version discipline**: pin to `v0.6.1` (latest stable tag), not `v0.5.1` (what Spice.ai validated, already ~4 months/2,737 commits stale) and definitely not any `-pre` tag (project ships one every 2-3 days).
- **The one genuinely safe next step**: a throwaway script outside `src/`, zero committed dependency, replaying migrations `0017` (FTS5 bootstrap) and `0032` (recursive-CTE-in-trigger + trigger-driven FTS writes) against a scratch Turso file, diffing query results against bun:sqlite. Answers the highest-leverage question (does FTS5 even work) before any other investment.

Full report: `ψ/writing/2026-07-06/arra-oracle-v3-turso-adoption-synthesis.md` (+ full 20-lens detail in the sibling `-prism-20-analysis.md`). This stays a reference document — no code changed, no tasks created, per Nat's explicit "report only" instruction. Companion to [[2026-07-06_arra-oracle-v3-prism-cross-analysis]].
