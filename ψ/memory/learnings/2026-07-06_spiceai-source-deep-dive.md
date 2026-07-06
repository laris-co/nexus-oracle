---
pattern: "Spice.ai source deep-dive: 76-crate DataFusion workspace, self-correcting text-to-SQL run read-only for safety, Turso used internally as an accelerator backend"
date: 2026-07-06
source: "learn --deep: spiceai/spiceai"
concepts: ["spiceai", "rust", "datafusion", "text-to-sql", "vector-search", "federation", "turso", "testing-philosophy"]
---

# Learned: spiceai/spiceai (source-code deep dive)

- 76-crate Rust workspace built around Apache DataFusion; 29 separate `connector-*` crates (one per data source) confirm federation is genuinely pluggable, not a monolith with config flags.
- NSQL (text-to-SQL) is a **self-correcting loop**: LLM generates SQL → DataFusion executes it, always **read-only**, explicitly to mitigate model-mediated SQL injection → on failure the error is fed back to the LLM as context, retried up to 10 times. The read-only constraint is a deliberate, documented safety choice, not an oversight.
- Confirms the [[2026-07-06_turso-vs-spiceai|Turso-vs-Spice.ai]] finding at the code level: Turso is one of Spice's pluggable `VectorIndex`/data-accelerator backends, and Spice's own S3 Vectors integration wraps AWS's *actual* `aws-sdk-s3vectors` service — not a homegrown vector store.
- Testing philosophy is "hit the real thing": connector integration tests spin up real Postgres/MySQL/Kafka containers via a `bollard`-driven Docker harness rather than mocking wire protocols; mocks are reserved narrowly for isolating DataFusion pushdown-logic unit tests. `cargo-nextest` forces `retries=0` on an explicit allowlist of correctness-sensitive tests after a prior retry once masked a real race condition as a flake — a concrete, named institutional scar.
- Clean separation between two eras of "model" support in the same codebase: `model_components` is the older pre-LLM ONNX/tabular-prediction runtime (`tract` engine), while all LLM chat/embedding/rerank/tool-use routing lives in `runtime::model`, layered on a `Chat` trait — the two never merged into one abstraction.

Why this matters: the read-only-NSQL and Docker-not-mocks choices are both patterns worth reusing directly if [[laris-co]] projects build LLM-driven query or data-federation tooling.
