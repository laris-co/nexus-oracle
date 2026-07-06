## Complexity gate

At least three lenses converge on the smaller move: **Skeptic** picks a write-serialization queue over swapping the storage engine to libSQL/Turso, **Market Positioner** says not to build any Turso-Sync-style federation protocol now, and **Minimalist** explicitly favors the zero-risk one-file fix over anything heavier — so the simplest viable design is: **keep `bun:sqlite` as-is, fix the concrete bugs/docs/queue in place, and defer both the storage-engine swap and the Turso-Sync federation protocol until these incremental fixes prove insufficient.**

## Sprint Backlog: arra-oracle-v3 prismatic findings

| # | Task | สมมติฐาน (Hypothesis) | คาดหวัง (Expected) |
|---|------|----------------------|---------------------|
| 1 | Date the unresolved-migration artifacts | The lancedb→sqlite-vec default split and the dead vitest import are dateable and will show the split was a deliberate later override, not an accident | git blame/log confirms intent; gives a clear "align defaults, delete vitest leftover" action item |
| 2 | Fix CI test-isolation bug (`agents/` worktree fan-out) | Bare `bun test` silently multiplies runs into 5 nested `agents/*` worktree copies with no CI guard catching it | Re-run shows 0 test paths under `/agents/`; a CI guard trips red if it regresses |
| 3 | Fix sqlite-vec silent truncation + quantify over-fetch tax | The `limit*3` + JS metadata filter in `sqlite-vec.ts` silently under-returns on selective `where` filters and degrades non-linearly at scale | Benchmark at 100K/1M rows quantifies the tax; queries either backfill to `limit` or return `truncated: true` instead of silently under-filling |
| 4 | Add write-serialization queue for SQLite lock errors | A queue+retry wrapper (mirroring `fallback-chain.ts`'s backoff) around `bun:sqlite` writes resolves `SQLITE_BUSY`/`disk I/O` errors without needing a storage-engine swap | The parallel-write scenario that currently trips "disk I/O error" now completes (slower, never 503s) |
| 5 | Add MCP tool-name validation guard | Third-party `plugin.json` manifests can register invalid tool names (e.g. containing `/`), reproducing Spice.ai's shipped bug, because no validation exists at merge time | A test manifest with `/` in a tool name is rejected at load; catalog vs. live-manifest tool-count CI check passes |
| 6 | Add `docs/ROADMAP.md` | A single dated, milestone-linked roadmap file (Spice.ai's format) is the cheapest available trust/alignment fix and currently doesn't exist | File exists, every row links to a real GitHub milestone, zero code risk introduced |
| 7 | Make the "no sandbox" trust model explicit in user-facing docs | Committing to a real pen-test/SOC2 exercise is premature before tasks 2-5 land; the higher-leverage near-term move is disclosing the existing "error containment only" plugin model externally, not just in a source docstring | User-facing docs (README/AGENTS.md) state the trust model plainly; credential/registry JSON file permissions are audited and tightened where over-permissive |
| 8 | Sprint retro | Tasks 1-7 close the highest-leverage gaps across all 10 lenses without needing the two heaviest asks (Turso-Sync federation protocol, formal pen-test) | Majority of hypotheses confirmed; any mismatch becomes the explicit trigger condition for escalating to the deferred heavy options |

---

### 1. Date the unresolved-migration artifacts
- **สมมติฐาน**: The `lancedb`-fallback vs. `sqlite-vec`-default divergence (`createVectorStore()` vs. `generateDefaultConfig()`) and the dead `vitest` import in `backup-lock.test.ts` are dateable via git history, and the split will turn out to be a deliberate later override rather than an unnoticed accident.
- **ทำ**: Run `git log`/`git blame` on `src/vector/factory.ts` (lancedb fallback), `src/vector/config.ts` (sqlite-vec default), and the history of `vitest.config.ts` / `src/indexer/__tests__/backup-lock.test.ts`.
- **ตรวจสอบ**: Compare commit timestamps and messages across the three files; check whether any follow-up commit ever attempted to reconcile the two defaults.
- **คาดหวัง**: Confirms the sqlite-vec-as-fresh-install-default was intentional and post-dates the lancedb fallback, and that the vitest import is unmaintained debt — producing a concrete "align the fallback, delete the vitest leftover" follow-up instead of an open question.

### 2. Fix CI test-isolation bug
- **สมมติฐาน**: Bare `bun test` recurses into `agents/arra-codex-{backend,frontend,infra,research,test}/` git worktrees (each a full nested copy of `src/`+`tests/`), silently multiplying test execution (Bug Hunter reproduced 6 files / 42 tests from 1 target file), and nothing in CI currently catches this.
- **ทำ**: Reproduce `bun test --isolate src/indexer/__tests__/backup-lock.test.ts` to confirm the fan-out, then add a `.bunignore`/roots exclusion for `agents/` in `bunfig.toml` plus a CI assertion that fails if test output contains any path under `/agents/`.
- **ตรวจสอบ**: Re-run bare `bun test` post-fix and confirm 0 matched paths contain `/agents/`.
- **คาดหวัง**: Test counts match single-copy expectations; the CI guard turns red immediately if the fix is ever reverted or bypassed.

### 3. Fix sqlite-vec silent truncation + quantify over-fetch tax
- **สมมติฐาน**: `src/vector/adapters/sqlite-vec.ts`'s `query()` over-fetches `limit*3` candidates then filters `where` metadata in JS (lines ~123-133), silently returning fewer than `limit` results under selective filters, and this over-fetch degrades non-linearly at scale — the same class of "missing fast-path" the SQG benchmark caught in Turso.
- **ทำ**: Benchmark `query()` with and without metadata `where` filters at 100K/1M row scale (mirroring Turso's published 8-thread harness methodology), then implement either adaptive fetch-multiplier widening or a `truncated: true` field on `VectorQueryResult`.
- **ตรวจสอบ**: Re-run the benchmark and confirm selective-filter queries now either backfill to `limit` (when enough candidates exist) or explicitly flag truncation rather than silently under-returning.
- **คาดหวัง**: No more silent under-fill; the over-fetch cost becomes a documented, quantified number instead of an inferred risk.

### 4. Add write-serialization queue for SQLite lock errors
- **สมมติฐาน**: `isDbLockError()` (`src/db/index.ts:113-125`) currently routes lock hits straight to a 503 "Oracle is indexing" message instead of resolving them, and a serialize-and-retry queue around writes — mirroring the backoff pattern already implemented in `src/vector/fallback-chain.ts` — can absorb contention without a storage-engine swap.
- **ทำ**: Implement a write-serialization queue in `src/db/index.ts` that retries with backoff on `isDbLockError()` hits before any request reaches the 503 handler in `src/middleware/errors.ts`.
- **ตรวจสอบ**: Re-run the parallel-write scenario documented in `bunfig.toml:7` ("parallel test files sharing oracle.db cause 'disk I/O error'") and confirm writes now queue/retry instead of raising a lock error.
- **คาดหวัง**: The concurrent-write scenario that used to 503 now completes successfully (possibly slower, never erroring) — proving the simpler in-process fix resolves the issue without adopting Turso/libSQL's MVCC rewrite.

### 5. Add MCP tool-name validation guard
- **สมมติฐาน**: Third-party `plugin.json` manifests can register arbitrary `mcpTools[]` entries via `normalizeUnifiedPluginManifest`/`pluginMcpToolsFrom` with no character validation, meaning a plugin author could reintroduce Spice.ai's shipped "/"-in-tool-name bug one layer below arra's own flat snake_case core registry.
- **ทำ**: Add a `^[a-zA-Z0-9_-]+$` regex guard at merge time in `pluginMcpToolsFrom` (citing the Spice.ai incident in the code comment), and add a CI check asserting `catalog/arra-oracle.yaml`'s declared tool count matches the live manifest count.
- **ตรวจสอบ**: Write a test plugin manifest with a `/` in a tool name and confirm it's rejected at load/merge time rather than silently merged into `src/mcp/server.ts`'s registry.
- **คาดหวัง**: Malformed tool names fail fast with a clear error; the catalog/live-manifest count check passes (or fails loudly the next time they drift, as they already have — 9 declared vs. 24-28 live).

### 6. Add `docs/ROADMAP.md`
- **สมมติฐาน**: A single dated, milestone-linked roadmap file (Spice.ai's `docs/ROADMAP.md` format) is missing from arra-oracle-v3's 60+ docs and is the cheapest available trust/alignment fix — zero code, ~30 minutes.
- **ทำ**: Create `docs/ROADMAP.md` with a table of upcoming versions/themes/features, each linked to a real existing GitHub milestone, sourced from current issues/milestones (not invented).
- **ตรวจสอบ**: Confirm every row links to a milestone that actually exists and matches its stated content.
- **คาดหวัง**: Contributors/users can answer "is X planned?" from one file; no runtime risk introduced.

### 7. Make the "no sandbox" trust model explicit in user-facing docs
- **สมมติฐาน**: Given the complexity gate, committing to a formal pen-test/SOC2 scoping exercise now is premature — the higher-leverage near-term move is surfacing the existing internal disclosure (`src/plugins/sandbox.ts`'s docstring: "error containment only... not a security boundary") in user-facing docs, plus auditing file permissions on credential/registry JSON (e.g. `src/vector/embedder-identity.ts`'s plaintext tmp+rename writes) — the same category of exposure as Turso's CVE-2026-48790.
- **ทำ**: Add an explicit trust-model disclosure to README/AGENTS.md, and run a permission audit (`ls -l`) on JSON registries/credential files written under `~/.oracle`/`~/.arra`.
- **ตรวจสอบ**: Grep user-facing docs for the new disclosure; confirm file modes on sensitive JSON are tightened where over-permissive (e.g. not world-readable).
- **คาดหวัง**: Users can no longer mistake plugin isolation for a security boundary; any over-permissive file mode gets fixed; a real external pen-test remains a deferred, explicitly-flagged follow-up rather than a silently skipped gap.

### 8. Sprint retro
- **สมมติฐาน**: Tasks 1-7 close the highest-leverage gaps surfaced across all 10 lenses without needing the two heaviest asks — the Turso-Sync-style federation protocol (Architect) and a formal pen-test/SOC2 engagement (Security Auditor/Auditor).
- **ทำ**: Compare expected vs. actual outcome for each of tasks 1-7; note any task whose result reveals the simpler fix was insufficient.
- **ตรวจสอบ**: Scorecard table — matched/mismatched count, surprises listed.
- **คาดหวัง**: Majority of hypotheses confirmed; any mismatch (e.g., the write-serialization queue proving insufficient under real concurrent load) becomes the explicit trigger condition for escalating to the deferred Turso-Sync or pen-test proposals, rather than an ad-hoc decision later.