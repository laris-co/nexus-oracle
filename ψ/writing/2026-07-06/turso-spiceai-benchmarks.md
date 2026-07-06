# Benchmark Research: Turso Database & Spice.ai vs Competitors

## Part 1: Turso Database (Rust rewrite) vs SQLite / libSQL

### Vendor-published (Turso/Turso Inc.) benchmarks

**1. Connection speed** — [How Turso made connections to SQLite databases 575x faster](https://turso.tech/blog/how-turso-made-connections-faster) (Turso blog, Jul 29 2025, by Glauber Costa & Levy Albuquerque)
- SQLite: 130 µs to open a connection to a 1-table DB; ~23 ms for a 10,000-table DB
- Turso: ~40 µs regardless of table count (10 to 10,000 tables)
- Headline claim: **~575x faster** than SQLite specifically on the 10,000-table case (23ms → 40µs)
- **Vendor-published**, includes a linked reproducible benchmark repo.

**2. Concurrent writes / MVCC** — [Beyond the Single-Writer Limitation with Turso's Concurrent Writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) (Turso blog) and covered in [Better Stack: How Turso Eliminates SQLite's Single-Writer Bottleneck](https://betterstack.com/community/guides/databases/turso-explained/)
- Single-threaded, no compute: SQLite ~150K rows/sec; **Turso actually underperforms SQLite** here
- Multi-threaded, no compute: Turso ~16% faster than SQLite
- Multi-threaded with simulated 1ms compute load, 8 threads: SQLite drops to ~80K rows/sec, **Turso is ~4x faster** than SQLite; other summaries of the same post round this to "~200K rows/sec vs SQLite's flat ~150K rows/sec" at 4 threads
- Methodology: batches of 100-row inserts, full fsync-on-commit, threads 1–8, artificial CPU busy-loop for "compute." No published hardware spec.
- **Vendor-published**, no independent replication found.

**3. Sync protocol** — [Turso Sync: a much, much, much better way to sync](https://turso.tech/blog/sync-benchmark) (Turso blog) — compares new `@tursodatabase/sync` push/pull protocol against libSQL "embedded replicas":

| Test | Embedded Replicas | Turso Sync | Gain |
|---|---|---|---|
| Sequential inserts (3,000 rows) | 152s / 34.6MB | 17s / 2.1MB | 8.9x faster, 16.3x less data |
| Read-your-writes (200 cycles) | 48.6s | 156ms | 312x faster |
| Read-your-writes w/ per-cycle push | 43.7s | 6.0s | 7.3x faster |
| Pull 5,000 remote rows | 718ms | 338ms | 2.1x faster |

Reproducible harness published at [tursodatabase/turso-sync-benchmark](https://github.com/tursodatabase/turso-sync-benchmark). **Vendor-published but with open benchmark code** — more credible than a bare claim, though still not independently re-run by a third party as far as I found.

### Independent / third-party data points

- **[SQG SQLite Driver Benchmark](https://sqg.dev/blog/sqlite-driver-benchmark/)** (published by SQG, a SQL-codegen tool vendor unaffiliated with Turso/libSQL) — real numbers, 10K users / 500K posts, i9-12900K, Node 25.3:
  - `getUserById`: better-sqlite3 1,223,260 ops/s vs Turso 707,859 ops/s vs libSQL 61,093 ops/s (better-sqlite3 wins)
  - `countPostsByUser` (pluck): better-sqlite3 1,151,783 ops/s vs **Turso only 5,593 ops/s** (~100x slower than better-sqlite3) in the `countUsers` case — flagged as likely a missing COUNT fast-path
  - `insertUser`: Turso wins at 63,017 ops/s vs better-sqlite3's 53,693 ops/s
  - This is the closest thing to an **independent, third-party benchmark** I found with real numbers — but note SQG sells a competing SQL-to-code tool, so it's not a neutral academic source either, just not Turso/Turso-affiliated.

- **[GitHub issue #2863](https://github.com/tursodatabase/turso/issues/2863)** — community-reported regression, not a vendor claim: single `COUNT(*)` went from 56.6ms (v0.1.4) to 401.9ms (v0.1.5-pre.1), a **~7x regression** on a 10M-row table between two Turso pre-release versions — evidence the project's performance is still volatile/immature.

- **[Pekka Enberg (Turso co-founder, @penberg) on X](https://x.com/penberg/status/2030176014534385672)** — notable candid vendor admission (via search snippet, page itself paywalled/inaccessible to fetch): *"I have this policy of not making performance claims because I represent the vendor here, and people should not really pay too much attention to vendor benchmarks... if you are seriously interested in performance, you should ignore what I am saying and run the benchmark yourself."* He reportedly shared TPC-H results showing SQLite still wins on many queries, Turso wins on others where it fixed SQLite query-planning weaknesses — summary: "decent but still catching up." This is the single most trustworthy source in this whole search because it's a vendor insider explicitly discounting his own side's marketing.

- **[Hacker News discussion](https://news.ycombinator.com/item?id=46810950)** on the Turso Rust rewrite — largely skeptical of maturity/battle-testing, references the SQG benchmark, no new independent numbers surfaced, one commenter reports memory leaks in libSQL under large write jobs.

### Turso vs DuckDB
**I found no direct published benchmark of Turso vs DuckDB.** The only connective claim is that [Spice.ai](https://github.com/spiceai/spiceai) reportedly uses Turso as one accelerator alongside DuckDB and "reported performance improvements over their SQLite implementation for certain query patterns" — vague, no numbers, and Turso is architecturally row-store/OLTP-oriented so a head-to-head vs the columnar/OLAP-oriented DuckDB wouldn't be apples-to-apples anyway. General DuckDB-vs-SQLite context (not Turso-specific): DuckDB vendor/adjacent blogs (MotherDuck, AI2SQL, Hakunamatata) claim DuckDB is dramatically faster on aggregations (e.g., "10M row GROUP BY+SUM: DuckDB <1s vs SQLite 20+s") but **these numbers are unsourced marketing-blog claims, not reproducible benchmarks** — treat with caution.

---

## Part 2: Spice.ai vs Trino / ClickHouse / DuckDB / Presto

All numbers found are **vendor-published** (Spice AI Inc.), from [github.com/spiceai/spiceai](https://github.com/spiceai/spiceai) and the [Spice Cayenne launch blog](https://spice.ai/blog/introducing-spice-cayenne-data-accelerator):

| Comparison | Benchmark | Result | Hardware |
|---|---|---|---|
| Cayenne vs DuckDB (file mode) | TPC-H SF100 | **1.4x faster**, ~3x less memory | 16 vCPU/64GB, AWS c6i.8xlarge-equivalent, local NVMe. Spice v1.9.0 vs DuckDB v1.4.2 |
| Cayenne vs DuckDB (file mode) | ClickBench | **14% faster**, 3.4x less memory | same setup |
| Ballista (Spice's distributed engine) vs single-node DataFusion | TPC-H SF100 | **2.9x faster** | — |
| Ballista vs Apache Spark | TPC-H SF100 | 8x less RAM, **2–8x better query performance** | "early preview" status noted by vendor |
| Vortex (Spice's storage format) vs Parquet | internal | 100x faster random access, 10–20x faster full scans, 5x faster writes | — |

**Important gaps and caveats:**
- **No direct Spice vs Trino or Spice vs Presto benchmark numbers exist anywhere I could find.** All comparative material against Trino/Presto is qualitative/architectural ("Spice pushes down queries more aggressively," "decentralized vs centralized cluster model") from third-party explainer articles like [devzery.com](https://www.devzery.com/post/spice-ai-guide-to-accelerating-data-with-unified-sql-and-ai-integration) and [skywork.ai](https://skywork.ai/skypage/en/Unlocking-Data-Grounded-AI-A-Deep-Dive-into-Spice-AI/1976531282878853120) — no throughput/latency numbers.
- **Spice/Cayenne is not on the official public [ClickBench leaderboard](https://benchmark.clickhouse.com/)** — I confirmed via the [ClickHouse/ClickBench GitHub repo](https://github.com/ClickHouse/ClickBench) system list that Spice, Spice.ai, and Cayenne do not appear among the 60+ listed systems (nor in the "wishlist" of systems awaiting submission). This means the "14% faster / 3.4x less memory" ClickBench figure is Spice's own internal run of the ClickBench queries, **not a submission independently verified/reproduced on the public leaderboard** — flag this clearly as unverified vendor benchmark.
- No independent (non-Spice) third party appears to have benchmarked Spice.ai against Trino, Presto, or ClickHouse as of this search.

---

## Summary of source reliability

| Claim | Source type |
|---|---|
| Turso 575x faster connections, 4x concurrent write throughput, 8.9–312x faster sync | **Vendor (Turso Inc.)** — reproducible code published for the sync benchmark, not for the others |
| Turso ~100x slower than better-sqlite3 on COUNT query | **Independent** (SQG, a tool vendor, not database-affiliated) |
| Turso v0.1.5-pre.1 7x COUNT regression | **Independent** community bug report (GitHub issue) |
| "Don't trust vendor benchmarks, run your own" | **Vendor insider self-admission** (Turso co-founder on X) — arguably the most credible single data point here |
| Spice Cayenne 1.4x/14% faster than DuckDB, 2.9–8x vs Spark/DataFusion | **Vendor (Spice AI Inc.)**, not on public ClickBench leaderboard |
| Spice vs Trino/Presto | **No quantitative benchmark found**, qualitative vendor/explainer claims only |
| DuckDB dramatically faster than SQLite on aggregations | **Low-quality marketing-blog claims**, unsourced, not reproducible as cited |

**Bottom line for the requester:** Almost every hard number in this space (Turso and Spice.ai both) traces back to the vendor's own blog or GitHub repo. The one genuinely independent quantitative benchmark is SQG's driver comparison, and the most epistemically useful source is the Turso co-founder's own public caveat that vendor benchmarks — including his own — shouldn't be trusted without reproducing them yourself. No credible independent lab (academic, ClickBench-verified, or neutral industry benchmark site) has published Turso-vs-SQLite/DuckDB or Spice.ai-vs-Trino/Presto/ClickHouse numbers as of this search (July 2026).