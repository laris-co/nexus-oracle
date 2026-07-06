# Web Research: H2 2026 Roadmaps — Turso Database & Spice.ai

Research date: 2026-07-06. Sources checked: GitHub milestones/issues/discussions (via `gh api`), official ROADMAP.md, company blogs, and conference session pages.

---

## TURSO DATABASE

### 1. Official stated direction for 2026
Turso's clearest 2026 statement of direction comes from the engineering blog post marking one year of the SQLite-in-Rust rewrite:
- **Close the SQLite compatibility gap** — explicitly named missing pieces still being worked: **multiprocess support** and **VACUUM**.
- **Integrate the new database engine with Turso Cloud** — bringing concurrent writes, CDC, and a richer type system to the cloud product.
- **Stabilize experimental features**: materialized views / incremental view maintenance (IVM), custom types, native encryption.
- **Enterprise/BYOC**: run all of Turso Cloud inside a customer's own cloud account for sovereignty/compliance.
- Source: [We are a year into rewriting SQLite. How is that going?](https://turso.tech/blog/we-are-a-year-into-rewriting-sqlite) (Mar 5, 2026)

Note: an older post, [Upcoming changes to the Turso Platform and Roadmap](https://turso.tech/blog/upcoming-changes-to-the-turso-platform-and-roadmap), is dated **Jan 21, 2025** — over a year stale relative to the H2-2026 window — so I've excluded it from forward-looking claims; it's only relevant as background on Turso's earlier pivot toward core-DB-first strategy.

### 2. Official roadmap on GitHub (README)
The repo's own "Features and Roadmap" section names exactly one item still **on the roadmap** (the rest — MVCC `BEGIN CONCURRENT`, CDC, vector search — are listed as shipped features, not roadmap):
- **Vector indexing for fast approximate vector search** (ANN), similar to libSQL vector search.
- Source: [tursodatabase/turso README](https://github.com/tursodatabase/turso#features-and-roadmap)

### 3. Live GitHub milestones (queried 2026-07-06)
Turso does not use due-dated milestones the way Spice.ai does. The active development milestone is:
- **Milestone "0.9"** (created 2026-03-11, still open, 43 open / 28 closed issues): dominated by MVCC correctness bugs, JOIN/JSON function correctness, `VACUUM INTO`, window-function gaps, GENERATED columns, foreign-key edge cases — i.e., exactly the "close the compatibility gap" work named in the blog.
- **Milestone "1.0"** (open since Dec 2023, 148 open / 75 closed) — the long-running stability bar for GA; still far from closed.
- Source: [github.com/tursodatabase/turso/milestones](https://github.com/tursodatabase/turso/milestones)

Release cadence check: as of query time the newest tags are pre-releases of **v0.7.0** (`v0.7.0-pre.13`, 2026-06-25), with **v0.6.0** shipped 2026-05-14. A maintainer (penberg) estimated in an Aug 2025 GitHub Discussion comment that "1.0 is closer to 6 months than 12 months, but don't take this as a hard estimate" — that estimate has visibly slipped, and no committed 1.0 GA date exists as of July 2026.
- Source: [Discussion #2826 — Is there any general estimate for a stable 1.0 release?](https://github.com/tursodatabase/turso/discussions/2826)
- Source: [Releases · tursodatabase/turso](https://github.com/tursodatabase/turso/releases)

### 4. Turso Cloud (next-gen) — private beta, no GA date committed
Announced Apr 8, 2026, currently in **private beta**, with plan to move to **public beta** next (no date given for GA):
- Concurrent writes, unlimited DB provisioning via REST API, BYOC (data in customer's AWS account), continuous backup + point-in-time restore, instant branching, customer-controlled encryption keys (BYOK), vector/FTS search, cloud-to-local sync.
- Source: [The next generation of Turso Cloud is (almost) here: Now in Private Beta](https://turso.tech/blog/turso-cloud-new-generation-private-beta)
- Related: [Turso Sync: a much, much, much better way to sync](https://turso.tech/blog/turso-sync-a-much-much-much-better-way-to-sync) (Apr 24, 2026)

Business/GTM signals feeding into H2: [Announcing the Turso Partner Program](https://turso.tech/blog/announcing-the-turso-partner-program) (May 27, 2026), [Announcing the Turso Startup Program](https://turso.tech/blog/announcing-the-turso-startup-program) (May 11, 2026), and case studies on BYOC/agent-security use ([How Alien uses Turso to make BYOC deployments reliable](https://turso.tech/blog/how-alien-uses-turso-to-make-byoc-deployments-reliable), Jun 22, 2026; [Why we chose Turso to secure AI credentials](https://turso.tech/blog/why-we-chose-turso-to-secure-ai-credentials), Jun 16, 2026) — these corroborate the "secure/private/compliant for agentic workloads" enterprise direction stated in the March blog.

### 5. Conference talk confirmed for H2 2026
- **P99 CONF 2026** (Oct 21–22, 2026, virtual, free) — session **"Why We're Rewriting SQLite in Rust"**, 20 min, speaker **Glauber Costa** (Founder & CEO, Turso). Abstract covers the Rust rewrite rationale, deterministic simulation testing, and vector search, claiming up to 500x performance gains in specific scenarios.
- Source: [P99 CONF session page](https://p99conf.io/session/why-were-rewriting-sqlite-in-rust/)

(I also checked whether Pekka Enberg is involved with the AgenticOS @ SOSP 2026 workshop, since his name surfaced adjacent to it — the organizer/PC list at [os-for-agent.github.io](https://os-for-agent.github.io/) does **not** list him, so I'm not including that as a Turso-linked event.)

---

## SPICE.AI

### 1. Official roadmap document (most authoritative source found)
`docs/ROADMAP.md` in the main repo lays out a dated release plan reaching into H2 2026 and just past it:

| Version | Timing | Focus | Key items |
|---|---|---|---|
| [v2.1](https://github.com/spiceai/spiceai/milestone/95) | **July 2026** | Schema Management & Distributed Search (DataFusion v53) | Schema registry (initial), schema evolution (add/drop/rename, type widening, auto-migration), non-distributed Cayenne catalog, distributed-acceleration hardening, Ballista/distributed-query shared job state + faster partition reassignment, write-back acceleration with full DML + `spice refresh` |
| [v2.2](https://github.com/spiceai/spiceai/milestone/99) | **September 2026** | Reactive Actions & Event Processing (DataFusion v54) | Distributed search (alpha) — federated vector+FTS with distributed FTS indexes, webhooks/event notifications, Drasi-based reactive actions |
| [v2.3](https://github.com/spiceai/spiceai/milestone/100) | **October 2026** | Enterprise Security, Compliance & Governance (DataFusion v55) | Audit logging, per-user/tenant resource quotas, distributed Cayenne catalog, distributed search scale-out + relative score fusion |
| [v2.4](https://github.com/spiceai/spiceai/milestone/101) | **December 2026** | Extensibility & Plugin Architecture (DataFusion v56) | Pluggable middleware, search tuned for 100B+ row scale (incl. S3 Vectors throughput), unified connector rate-control (extends HTTP rate limiting to DB/object-store connectors) |
| [v2.5](https://github.com/spiceai/spiceai/milestone/102) | **January 2027** (just outside window, included for context) | Encryption (DataFusion v57) | Customer-managed keys (BYOK), data-at-rest encryption |

**Unscheduled "features under consideration"**: Delta Lake write support, Google Docs connector, Key/Value API via SlateDB, PostgreSQL wire-protocol API, vision (image/video) processing, custom ML model integration + model versioning/A-B testing, hallucination detection, faceted search, data lineage.

Source: [spiceai/docs/ROADMAP.md](https://github.com/spiceai/spiceai/blob/trunk/docs/ROADMAP.md)

### 2. Live GitHub milestones — cross-check (queried 2026-07-06)
Milestone due-dates (which the maintainers actively adjust) currently run about 2-6 weeks ahead of the ROADMAP.md's month-level labels, and the milestone *content* doesn't line up 1:1 with the ROADMAP.md's version labels — worth flagging as an inconsistency between the doc and the live tracker rather than something I could fully resolve:

- **v2.1.0** (#95): due 2026-06-22, still **open** with 2 issues outstanding — i.e. it is spilling into H2 2026.
- **v2.2.0** (#99): due **2026-07-13**, 28 open / 29 closed — issue list is dominated by Cayenne correctness/perf work (CDC replication, WAL integrity checksums, MySQL binlog replication, Postgres CDC, crash-recovery hardening), not the "reactive actions/webhooks" theme the ROADMAP.md assigns to v2.2.
- **v2.3.0** (#100): due **2026-08-03**, 10 open — mostly **search**-themed issues (S3 Vectors streaming/throughput, mTLS for public endpoints, full-text search in distributed mode, "Search at 100B+ Row Scale", relative score fusion) — content that more closely matches what ROADMAP.md calls out under v2.1/v2.3.
- **v2.4.0** (#101): due **2026-08-24**, 1 open — unified runtime-wide connector rate-control.
- **v2.5.0** (#102): due **2026-09-13**, description field directly states **"Encryption — Customer-Managed Keys (BYOK), Data-at-Rest Encryption"** — no issues filed yet.
- **v2.6.0 / v2.7.0 / v2.8.0** (#103/#104/#105): due 2026-10-04, 2026-10-25, 2026-11-15 respectively; largely empty of issues except #105 (v2.8.0) which already has 5 open/1 closed issues, notably several bugs against the **Turso data connector** (MVCC/index locking, OOM on large datasets, TPC-H mismatches) — i.e., Spice.ai ships an actual Turso connector and is actively hardening it for a Nov 2026 milestone.
- Source: [github.com/spiceai/spiceai/milestones](https://github.com/spiceai/spiceai/milestones)

### 3. Most recent shipped release referenced in blog
**v2.0-rc.2** (~April 2026): Cayenne (Vortex-based accelerator) at RC status claiming 1.4x faster / 3x lower memory than DuckDB on TPC-H SF100, new ADBC connector with BigQuery support, new catalog connectors, Spice Cloud Portal preview/stable channels + management API + audit log, DataFusion v52 upgrade.
- Source: [Spice Cloud v2.0-rc.2 Release — Spice AI Blog](https://spice.ai/blog/spice-cloud-v2-0-rc-2)
- Full release history: [spiceai.org/releases](https://spiceai.org/releases) / [GitHub Releases](https://github.com/spiceai/spiceai/releases)

### 4. Conference talks / CFPs
No H2-2026-specific talk or CFP found for Spice.ai. The most recent confirmed public talk by founder **Luke Kim** — "The Agent Data Stack: Why Every Agent Needs its Own Data Stack" at DeepLearning.AI's **AI Dev 26 x SF** — was **April 28–29, 2026**, which falls in H1, not H2.
- Source: [Luke Kim Sessionize profile](https://sessionize.com/lukekim/) (no future talks listed)
- Source: [AI Dev 26 x SF](https://ai-dev.deeplearning.ai/) (event date confirmation)

---

## Summary comparison for H2 2026

| | Turso Database | Spice.ai |
|---|---|---|
| **Primary roadmap source** | Blog post + README "roadmap" line (informal, undated) | Formal, dated `docs/ROADMAP.md` with milestone links |
| **Confirmed H2 2026 deliverables** | Vector ANN indexing, VACUUM, multiprocess support, MVCC/JOIN/JSON compatibility fixes (all undated) | v2.1 (Jul), v2.2 (Sep), v2.3 (Oct), v2.4 (Dec) — each with named features and DataFusion version pins |
| **1.0 / GA timing** | No committed date; informal 2025 estimate already slipped | N/A — already past v2.0 GA (Apr 2026), now shipping v2.x minors on a roughly monthly milestone cadence |
| **Enterprise/cloud angle** | Turso Cloud next-gen in private→public beta, BYOC, BYOK | v2.5 "Encryption" (BYOK, data-at-rest) slated Jan 2027; v2.3 adds audit logging/quotas (Oct 2026) |
| **Conference talk confirmed for H2 2026** | Yes — P99 CONF, Oct 21-22, 2026, Glauber Costa | None found |

Both projects show classic "roadmap document says one date, live issue tracker says another" drift — I flagged the discrepancies rather than picking one as authoritative, since neither company has publicly reconciled them.