---
pattern: "Turso Database source deep-dive: cooperative-yield async (no async/await in the engine), MVCC bolted onto WAL, and unusually deep DST/Antithesis testing for an early-stage database"
date: 2026-07-06
source: "learn --deep: tursodatabase/turso"
concepts: ["turso", "rust", "sqlite", "async-io", "mvcc", "deterministic-simulation-testing", "antithesis", "database-internals"]
---

# Learned: tursodatabase/turso (source-code deep dive)

- The engine has **zero `async fn`** — instead a cooperative-yield model (`StepResult::IO`/`Yield`, `IOResult<T>::{Done,IO}`, a `return_if_io!` macro) where the caller drives an explicit resumable state machine. This is what lets one query pipeline run unmodified over io_uring, epoll, Windows IOCP, in-memory, and WASM-friendly backends — a notably different tradeoff than just picking tokio.
- Adds `BEGIN CONCURRENT`/row-level MVCC as a second concurrency-control layer sitting alongside the original WAL, specifically to break SQLite's single-writer bottleneck — bolted on rather than a redesign from scratch.
- Testing depth is disproportionate to project age (~beta): SQLancer + SQLRight + a custom differential fuzzer all run against *real* SQLite for oracle comparison, two separate deterministic-simulation-testing harnesses (one Jepsen-Elle-validated for isolation anomalies), and a full Antithesis integration (deterministic hypervisor-level fault injection, nightly + weekend 24h runs) — this is normally something only mature, funded distributed-systems projects invest in this early.
- Extension mechanism is a hand-rolled C-ABI that's conceptually a mirror of SQLite's vtab/loadable-extension model but is explicitly **not** binary-compatible — a Turso `.dylib` extension cannot load in real SQLite and vice versa, despite matching SQL surface (`load_extension()`, `.load`).
- Sync engine deliberately keeps the old libSQL wire protocol alive as a `Legacy` mode while adding a new CDC + revert-WAL-replay offline-first model as `V1` — a superset/migration path, not a break.

Why this matters: worth revisiting when evaluating embedded-DB options for [[laris-co]] projects wanting per-tenant or per-agent databases — the maturity signal here is the testing investment, not just feature count.
