# Turso as Optional arra-oracle-v3 Backend — Prismatic Synthesis (Knowledge Report Only)

*Synthesizing 20 analytical lenses. No implementation started or recommended — this is a reference document for understanding the safe path forward.*

---

## 1. Convergent Findings

**A. FTS5 compatibility is THE central open question — nearly every lens lands here.**
(Migration Compatibility, FTS5 Compatibility, Data Migration Path, Shadow-Mode Testing, Minimalist Slice, Maintenance Burden, CI/Testing) all independently flag the same fact: `oracle_fts` (FTS5 virtual table, `tokenize='porter unicode61'`) is the codebase's **always-on fallback** (`VECTOR_FALLBACK=fts5`) — every degraded vector-search path lands there. Turso is a from-scratch Rust rewrite, not a libsqlite3 fork, so FTS5 support isn't inherited "for free" — it would have to be independently reimplemented. No lens found evidence this has been verified.

**B. Vector search (sqlite-vec) cannot be reused under Turso, period.**
(Precedent Analyst, Interface Designer, sqlite-vec Compatibility, Data Migration Path, Shadow-Mode, Maintenance Burden) all confirm: `sqlite-vec` loads via `sqlite.loadExtension()` — a call into libsqlite3's native `sqlite3_load_extension`. Turso's own COMPAT.md states SQLite `.so`/`.dylib` loadable extensions are **not supported** — its extension model is a different, hand-rolled C-ABI. A Turso path would need an entirely separate, currently-nonexistent vector adapter. This isn't a compatibility gap to patch — it's a structural wall.

**C. The right architectural seam already exists — and it's `VectorStoreAdapter`/config-based factory, not `detectDbRuntime()`.**
(Precedent Analyst, Feature Flag Design, Staged Rollout, CI/Testing Strategy) converge: `detectDbRuntime()` (bun vs D1) is a **JS-runtime detector** (`isWorkerd`/`isBun`) — it exists because bun:sqlite and D1 are mutually exclusive by physical necessity. Turso runs under the *same* runtime as bun:sqlite, so it can't be runtime-detected; it needs a config/feature-flag axis like `createVectorStore()`'s `VectorDBType` switch, not a new runtime branch.

**D. Version pinning is non-negotiable, and the specific target is v0.6.1 stable — not v0.5.1, not HEAD.**
(Version Pinning, Feature Flag Design, Security Surface, Docker/Deployment, Maintenance Burden) all cite the same underlying facts: 18 pre-release tags in under 2 months, a documented 7x perf regression between adjacent pre-releases, and even Spice.ai's production-validated v0.5.1 sitting 2,737 commits behind current HEAD (v0.7.0-pre.18). Caret-range dependency pinning (the codebase's current default style) would be actively dangerous here.

**E. This must stay strictly non-production, offline/read-only/shadow, for an extended window — and the infrastructure to do that safely doesn't exist yet.**
(Rollback Safety, Data Migration Path, Shadow-Mode Testing, Staged Rollout, Observability) agree: there is no dual-write, no CDC, no export/import path, and no shadow-read comparator anywhere in the codebase today. Today's rollback story (flat SQLite file, `cp` and done) breaks down completely — Turso's on-disk format is its own, and its known failure mode is *corruption*, not clean errors.

**F. The codebase already has good bones for isolating an experiment like this.**
(Interface Designer, CI/Testing Strategy, Feature Flag Design) point to real, reusable precedent: the `StorageBackend` registry (`registerStorageBackend`/`createStorageBackend`), the `isSqliteVecAvailable()` + `describe.skipIf()` capability-probe pattern already used to gate native-extension tests, and CI's existing discipline of running `bun test --isolate <file>` per-file rather than a bare fan-out-prone `bun test`. Whatever Turso work happens should reuse these, not invent new abstractions.

**G. The smallest safe next step is a throwaway script outside `src/`, not a code change.**
(Minimalist Slice, FTS5 Compatibility, Migration Compatibility) all independently arrive at the same concrete action — see Section 3.

---

## 2. Divergent / Conflicting Findings

**Does a clean adapter seam for this already exist, or does every new backend end up bypassing it?**
Precedent Analyst treats `StorageBackend`/registry as a validated template. Interface Designer directly rebuts this: D1 support — the only prior "new backend" — **did not** go through `StorageBackend` at all; it built a separate `DbConnection` union with its own runtime branch, specifically because D1's async shape didn't fit. That's real prior evidence that the "existing adapter" comfort is partly aspirational. Turso would be the *first* real test of whether `StorageBackend` can flex to an async engine, not a confirmation that it already can.

**A gradient of "safe to try" vs. "don't do this yet" that looks contradictory but isn't.**
Feature Flag Design, CI/Testing Strategy, Docker/Deployment, and Minimalist Slice all say some version of "safe to try" — but only for narrowly-scoped *plumbing*: an unused env var, a registry stub, a build-arg-gated Docker stage, a throwaway probe script. Failure Isolation, Concurrency Semantics, Observability, Staged Rollout, and Security Surface all say "don't do this yet" — but they're talking about anything that lets Turso touch **real behavior**: actual concurrent writes, actual production traffic, actual failure handling. Read together, these aren't in conflict — they're describing two very different risk tiers. The wiring is cheap and safe; letting the wiring carry real load is not.

**Is "shadow mode" a lightweight validation step or itself a nontrivial project?**
Shadow-Mode Testing frames dual-write/diff as something buildable relatively mechanically by wrapping Drizzle write calls. But Concurrency Semantics, Observability, and Rollback Safety each separately note that the retry-on-conflict logic, the divergence-metric instrumentation, and the export/import tooling needed to make shadow mode meaningful **don't exist today and would have to be built from scratch**. The tension: "shadow mode" sounds like a safe intermediate step, but it is itself a real engineering project with its own risk surface, not a shortcut around building things.

**Feature flags create false comfort against process-level failure.**
Feature Flag Design, Staged Rollout, and CI/Testing lean on "gate it behind an env var / registry entry" as the safety mechanism. Failure Isolation directly complicates this: Turso's documented failure mode (WAL corruption panics) is a **native Rust-level panic/abort**, not a catchable JS exception. A feature flag isolates *which code path runs* — it does nothing to stop a native crash from taking down the entire process, including the bun:sqlite path it's meant to protect, since nothing in the storage layer runs in a separate process or thread today. This is the single most important correction to the "just flag it" instinct running through several other lenses.

---

## 3. The Smallest Safe First Step

Three lenses (Minimalist/Smallest Safe Slice, FTS5 Compatibility, Migration Compatibility) converge on the identical, cheapest possible move — do this before anything else, and before considering any of the checklist items below:

> **Write one throwaway script, outside `src/`, with zero application code changes and no committed new dependency.** Point a Turso/libsql client at a local scratch file. Replay the 40 migration files verbatim — especially `0017_fts5_bootstrap.sql` (the FTS5 virtual table) and `0032_schema_integrity_guards.sql` (recursive-CTE triggers that write into the FTS virtual table). Then run 2–3 real `MATCH` queries copied directly from `src/server/handlers.ts` and diff the results against bun:sqlite.

This is a hard go/no-go gate, not a nice-to-have. If FTS5 doesn't work, doesn't match, or panics on this replay, the rest of the idea — adapter design, feature flags, staged rollout, security review — is moot, because Turso can't host the always-on fallback path this codebase depends on. It costs essentially nothing (no `src/` changes, no new dependency committed, delete-when-done) and answers the single highest-leverage question first.

---

## 4. Hard Blockers / Red Flags

- **FTS5 parity is completely unverified**, and it's the always-on fallback every degraded vector-search request lands on. If it's missing or diverges (tokenizer set, `MATCH` grammar, `bm25()` ranking), this idea is dead on arrival for this specific codebase — independent of everything else.
- **Vector search (sqlite-vec) cannot run under Turso at all.** Confirmed structurally, not probabilistically — `loadExtension()`/native `.so` loading is explicitly unsupported by Turso's extension ABI. Any Turso adoption leaves vector search permanently stranded on bun:sqlite or requires building an entirely new, currently-nonexistent adapter.
- **Native panics can crash the whole process, and nothing in the storage layer isolates that today.** No process/thread boundary exists anywhere in `src/storage`, `src/db`, or `src/vector` — `child_process`/`worker_threads` are used only for git/shell tooling. A WAL-corruption panic in Turso would take bun:sqlite down with it in the same address space.
- **The project is unusually volatile**: 18 pre-release tags in under two months, a 7x perf regression between adjacent pre-release versions, and 2,737 commits between the only production-validated reference point (Spice.ai's v0.5.1) and current HEAD. This alone rules out tracking HEAD or any `-pre` tag under any circumstance.
- **No infrastructure exists today to observe divergence.** Turso's worst failure mode is described as *correct-looking but wrong* (stale post-checkpoint index entries) — exactly the class of bug the current error-substring-matching observability (`isDbLockError()`, flat 503s) cannot detect, because nothing throws.

None of these mean "never" — but each is a precondition, not a detail, and several of them (FTS5, vector search, panic containment) are structural rather than effort-based: no amount of careful engineering fixes them if the underlying capability simply isn't there.

---

## 5. What Would Need to Be True Before Considering Real Implementation

- [ ] FTS5 (virtual table + `MATCH` + `bm25()` + porter/unicode61 tokenizer) confirmed working and result-equivalent to bun:sqlite via the standalone spike above
- [ ] Migrations `0017` and `0032` (recursive-CTE-in-trigger, trigger-driven FTS writes) confirmed to run cleanly on Turso, tested in isolation before the full 40-file chain
- [ ] A concrete answer on vector search: either a real `TursoVecAdapter` design, or an explicit, accepted decision that vector search stays permanently on bun:sqlite/sqlite-vec even if core storage moves
- [ ] Confirmed whether Turso's native/Rust panics unwind-catchably at the FFI boundary or abort the process — via fault injection, not documentation reading; if abort, a process/thread isolation boundary must be designed before any shared traffic
- [ ] `isDbLockError()` and any write-contention handling made backend-aware for Turso's actual (currently unknown) error vocabulary, plus a retry-on-conflict pattern for its MVCC semantics (doesn't exist in the codebase today)
- [ ] Turso confirmed compatible with Bun's N-API shim under real concurrent async load (segfault/hang test) — "npm/bun install succeeds" is not sufficient evidence
- [ ] Exact version pinned to v0.6.1 stable (not v0.5.1, not any v0.7.0-pre tag), vendored in the lockfile, with a defined manual quarterly re-validation ritual
- [ ] Docker platform binary coverage verified (glibc targets present, no silent source-build fallback requiring an absent Rust toolchain)
- [ ] A backend-agnostic shadow-read comparator and a `storage_backend_divergence` metric built and run for a meaningful window against a disposable, non-production Oracle instance
- [ ] A hard kill-switch / auto-degrade-to-bun:sqlite path designed and tested, reusing the existing fallback pattern
- [ ] A from-scratch security review of Turso's separate native-extension trust boundary, with any sync/embedded-replica features explicitly disabled (config-locked, not just unused)

---

**Bottom line**: the idea is coherent and the codebase has real precedent to build on (`StorageBackend` registry, `VectorStoreAdapter`-style factories, capability-probe test gating) — but two structural facts (FTS5 status unknown while being load-bearing; sqlite-vec categorically incompatible) and one containment gap (native panics vs. no process isolation) mean this stays firmly in "investigate, don't build" territory. The one thing worth doing next, per Nat's instruction not to implement yet, is the zero-footprint FTS5 replay spike in Section 3 — everything else in this report is downstream of what that spike reveals.