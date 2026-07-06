# How Are Turso and Spice.ai Related? — Cited Report

Produced via a 7-agent workflow (3 code-search agents + 3 web-research agents + 1 synthesis pass), 2026-07-06.

## Bottom Line

**Spice.ai (OSS data + AI inference engine) embeds Turso as a pluggable local data-accelerator backend.** This is a one-directional open-source *dependency* relationship, not a corporate, equity, or partnership relationship. It is documented extensively in Spice.ai's codebase (implementation, config schema, tests) and acknowledged once, briefly, in Turso's own marketing (a CEO testimonial). No case study, joint announcement, or financial relationship was found on either side.

---

## 1. Exact Integration Points (code-level, file:line)

### Core implementation — Spice.ai's Turso accelerator
| Location | What |
|---|---|
| `crates/data_components/src/turso.rs` (3,109 lines, full file) | Complete DataFusion `TableProvider` for Turso |
| `turso.rs:88-149` | Imports `turso::{Builder, Connection, Database, Value as TursoValue}` and `turso_shared::{BEGIN_CONCURRENT_SQL, COMMIT_SQL, JOURNAL_MODE_SQL_LITERAL}` |
| `turso.rs:321-464` | `TursoConnectionPool` — pooling with MVCC / `BEGIN CONCURRENT` support |
| `turso.rs:466-1361` (struct at `471-476`) | `TursoTableProvider` — read path with filter/projection/limit pushdown |
| `turso.rs:1239-1334` | `impl TableProvider for TursoTableProvider` (`scan`, `insert_into`, `delete_from`) |
| `turso.rs:1288-1294` | `scan()` → constructs `TursoExec` |
| `turso.rs:1314-1322` | `insert_into()` → constructs `TursoDataSink` |
| `turso.rs:1330-1332` | `delete_from()` → constructs `TursoDeletionSink` |
| `turso.rs:1363-1492` | `SQLExecutor` impl for cross-database federation |
| `turso.rs:1494-1675` | `TursoExec` execution plan |
| `turso.rs:1677-1728` | `TursoDeletionSink` |
| `turso.rs:1730-1949` | `TursoDataSink` (OVERWRITE / APPEND modes) |
| `turso.rs:1964-2070` | Timestamp conversion (RFC3339 text vs. integer-millis) |
| `turso.rs:2072-2263` | DataFusion `ScalarValue → TursoValue` conversion |
| `turso.rs:2398-3109` | 600+ lines of tests |

### Engine registration
- `crates/runtime-acceleration/src/engine.rs:16-28` — `Engine` enum includes a `Turso` variant alongside `Arrow`, `DuckDB`, `Sqlite`, `PostgreSQL`, `Cayenne`.
- `crates/runtime-acceleration/src/engine.rs:65` — `"turso" => Ok(Engine::Turso)` (string→enum parser for spicepod YAML).

### User-facing config schema
- `crates/spicepod/src/acceleration/mod.rs:482` — `Acceleration.engine: Option<String>` field, which accepts `"turso"`.
- `docs/examples/turso_acceleration_example.md:7-18, 39-53` — example spicepod YAML: `acceleration: { enabled: true, engine: turso }`, plus file-mode config with `turso_file: /var/data/spice/sales.turso`.

### Secondary integration — Cayenne metastore
- `crates/cayenne/src/metastore/turso.rs` (full file) — Turso used as a **separate** integration: the storage backend for Cayenne's metastore (not the data-accelerator path).
- `crates/cayenne/Cargo.toml` — dependency declaration.

### Shared plumbing
- `crates/turso-shared/src/lib.rs` — shared SQL constants (`BEGIN_CONCURRENT_SQL`, etc.) reused by both the accelerator and the Cayenne metastore.
- `crates/runtime-acceleration/src/snapshot/engine/turso.rs` — Turso snapshot engine.
- `crates/runtime/src/dataaccelerator/turso.rs` — runtime wiring.
- `crates/runtime/src/dataaccelerator/spice_sys/{dataset_checkpoint,debezium_kafka,dynamodb,kafka,mongodb}/turso.rs` — CDC/checkpoint paths that write into Turso.

### Dependency declarations
- `Cargo.toml` (root), `bin/spiced/Cargo.toml`, `crates/test-framework/Cargo.toml` — declare the `turso` crate as a dependency.
- `Cargo.lock` — 1,811 lines referencing the turso crate family: `turso`, `turso_core`, `turso_ext`, `turso_macros`, `turso_parser`, `turso_sdk_kit`, `turso_sync_engine`, `turso-shared`, `turso_sdk_kit_macros`, `turso_sync_sdk_kit`.
- `acknowledgements.md:930-931` — `turso 0.5.1, MIT`, linking to `github.com/tursodatabase/turso`.

### Test coverage
- 150+ query-plan snapshots under `crates/test-framework/src/snapshot/snapshots/explain/` (`turso[file]` / `turso[memory]` variants, TPC-H + ClickBench).
- `crates/runtime/tests/acceleration/checkpoint_turso.rs`, `crates/runtime/tests/snapshot_refresh/turso.rs`.
- 60+ spicepod YAML test configs under `tpch/sf1/accelerated/` (e.g. `postgres-turso[file].yaml`, `iceberg-turso[memory].yaml`, `constraints/turso_full_with_pk.yaml`).

### The reverse direction — what Turso's codebase says about Spice.ai
- `README.md:429` (Turso repo) — the **only** "spice" hit (case-insensitive) anywhere in Turso's entire codebase, in Turso's own FAQ:
  > "Turso powers production apps today. That includes Turso Cloud, the Kin AI assistant, and **[Spice.ai](https://github.com/spiceai/spiceai)**."

**Asymmetry note**: Spice.ai's codebase references Turso ~1,811 times across 155+ files (a fully built-out accelerator backend). Turso's codebase references Spice.ai exactly once (a single FAQ line). The relationship is Spice.ai *consuming* Turso, not a joint project.

---

## 2. Public Commentary Found (with URLs)

| Source | What it says |
|---|---|
| [Turso blog — "Introducing the first alpha of Turso: The next evolution of SQLite"](https://turso.tech/blog/turso-the-next-evolution-of-sqlite) (July 1, 2025) | Names Spice.ai as an early adopter using SQLite/DuckDB as accelerators, and quotes Luke Kim (Founder & CEO, Spice AI): *"Turso's Rust-based rewrite of SQLite brings cloud-native, concurrent performance to AI apps and agents. As workloads shift to fast, lightweight databases like SQLite and DuckDB, Turso takes SQLite beyond its concurrency limits, strengthening the ecosystem for scalable, data-driven apps."* Stated rationale: better query performance vs. their SQLite implementation on some queries, plus anticipated gains once Turso ships concurrent writes. |
| [Turso homepage](https://turso.tech/) | Reuses the identical Luke Kim quote in its testimonials carousel — not new content, same quote repackaged. |
| [Spice.ai docs — Data Accelerators](https://spiceai.org/docs/components/data-accelerators) and [Turso accelerator page](https://spiceai.org/docs/components/data-accelerators/turso) | Official docs listing Turso (libSQL) as a Beta-status accelerator: "Async operations, concurrent workloads... Native async support, modern connection pooling." |
| [Spice.ai release notes, e.g. v2.0-rc.5](https://spiceai.org/releases/v2.0-rc.5) | Engineering changelog entries: new `refresh_mode: snapshot` with "SQLite and Turso WAL flushing"; version bumps of the Turso dependency. |

---

## 3. What Was NOT Found (honest gaps, despite searching)

- **No Spice.ai-authored explanation** of why they adopted Turso — the only rationale anywhere is the vendor-solicited testimonial quote that appears in *Turso's* blog post, not a Spice.ai blog post, talk, or podcast.
- **No dedicated case study** on either side: `turso.tech/case-studies` → 404; `turso.tech/customers` → redirects to homepage; Spice.ai's own case-studies page (`spice.ai/case-studies`) does not mention Turso at all.
- **No Hacker News discussion**: direct Algolia HN Search API queries for `"spice.ai" "turso"` and `spiceai turso` returned zero hits; manual scan of the two most relevant candidate threads (Turso launch thread, Spice.ai Show HN) found no cross-mentions.
- **No Reddit discussion**: `site:reddit.com "spice.ai" "turso"` returned zero results.
- **No X/Twitter discussion**: no tweets/threads found beyond the two companies' official accounts; no public commentary from either side or third parties.
- **No corporate/financial relationship of any kind found** — no mention of investment, acquisition, board seats, or formal partnership. Everything found is (a) an OSS dependency Spice.ai built and maintains, and (b) one reused customer-testimonial quote on Turso's marketing pages.

---

## Sources Cited
- Local repo clones: Spice.ai (`spiceai/spiceai`), Turso (`tursodatabase/turso`) — file:line citations above.
- https://turso.tech/blog/turso-the-next-evolution-of-sqlite
- https://turso.tech/
- https://spiceai.org/docs/components/data-accelerators
- https://spiceai.org/docs/components/data-accelerators/turso
- https://spiceai.org/releases/v2.0-rc.5
- https://spiceai.org/blog/releases/v1.9.0-rc.2
- https://spice.ai/case-studies (checked, no Turso mention)
