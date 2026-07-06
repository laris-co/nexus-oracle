## Turso (tursodatabase/turso, ChiselStrike Inc.)

**Company background**: Turso is built by ChiselStrike, Inc. (founded 2021), which rebranded its product/GitHub org from "ChiselStrike" to "Turso" after pivoting from a BaaS platform to an edge SQLite database. [ChiselStrike Turso announcement](https://turso.tech/blog/announcing-chiselstrike-turso-164472456b29)

**Compliance/Certifications**
- **SOC 2 Type II**: Achieved and announced July 9, 2024, described as completed "with zero issues." As part of the mandatory annual pen-test requirement for SOC 2, Turso engaged **Doyensec** for penetration testing. [Turso SOC2 blog post](https://turso.tech/blog/turso-achieves-soc2-compliance) — Doyensec's involvement is separately corroborated by [pentestreports.com](https://pentestreports.com/company/doyensec) search context, though the primary/only named source is Turso's own blog.
- **HIPAA**: BAA (Business Associate Agreement) available at no extra cost on the Pro plan. [Launch week security post](https://turso.tech/blog/secure-compliant-and-ready-for-the-pros)
- **DPAs**: Available for EU customers on Scaler/Pro/Enterprise plans.
- **Trust portal**: Published at trust.turso.tech, managed via Vanta for continuous compliance monitoring.
- **ISO 27001**: No evidence found that Turso holds this certification — not mentioned in any official Turso material or search results.

**CVEs / Security Advisories** (verified directly via GitHub's Security Advisories API, `gh api /repos/.../security-advisories`)
- **tursodatabase/turso** (main DB engine repo): **zero published security advisories.**
- **tursodatabase/turso-cli**: One advisory — **CVE-2026-48790 / GHSA-57f6-pvx8-hwj6** ("turso-cli persists Turso platform JWT with world-readable (0o644) file permissions"). Medium severity, CVSS 3.1 score 5.5. The CLI stored the platform JWT in `settings.json` with mode 0o644 (via an unconfigured Viper default), letting any other local user on a shared host/CI runner read the token and gain full platform access (create/destroy DBs, exfiltrate data, change billing). Affects versions ≤1.0.25, fixed in 1.0.26 (commit `ffb914849216...`). Published 2026-05-23. [GHSA-57f6-pvx8-hwj6](https://github.com/tursodatabase/turso-cli/security/advisories/GHSA-57f6-pvx8-hwj6)
  - Note: a secondary aggregator site, DailyCVE, covers the same bug but mislabels it with a placeholder ID "CVE-2024-XXXX" — the correct, GitHub-confirmed identifier is **CVE-2026-48790**. Worth flagging since that site's ID is wrong.
- **libSQL** (Turso's SQLite fork, tracked as its own advisory chain): **CVE-2025-47736 / GHSA-8m95-fffc-h4c5** — a crash (DoS) in the `libsql-sqlite3-parser` Rust crate (`dialect/mod.rs`) when fed non-UTF-8 input. Low severity, CVSS 3.1 base score reflects Local/High-complexity/Low-availability-impact. Affects versions through 0.13.0, fixed in commit `14f422a`. Reported/tracked at [tursodatabase/libsql#2052](https://github.com/tursodatabase/libsql/issues/2052) and [GHSA-8m95-fffc-h4c5 via OSV](https://osv.dev) (confirmed via OSV.dev API).
- No other CVE/NVD/OSV entries found for "turso" or "libsql" package names beyond the two above.

## Spice.ai (spiceai/spiceai)

**Compliance/Certifications**
- **SOC 2 Type II**: Achieved, audited by **Prescient Assurance**, with an unqualified opinion, announced ~February 16, 2024. [Spice.ai SOC2 blog post](https://spice.ai/blog/spice-ai-achieves-soc-2-type-ii-compliance)
- **Security posture page** ([spice.ai/security](https://spice.ai/security)) describes: encryption in transit and at rest (TLS 1.2+), corporate secrets in enterprise password managers with SSO, SSO+RBAC and mandatory MFA across systems, just-in-time access provisioning, least-privilege access, code scanning for secrets/vulnerabilities, and "internal and external expert code audits."
- **ISO 27001**: No evidence found of certification (Prescient Assurance itself offers ISO/PCI/NIST/GDPR/HIPAA/CSA STAR attestation services generally, but nothing indicates Spice.ai obtained any of those beyond SOC 2).
- A dedicated vulnerability-disclosure page was referenced at `docs.spice.ai/security/report`, but that exact URL currently 404s; `docs.spice.ai/security/security` also 404s. The live, working page is **spice.ai/security** (not the docs.spice.ai paths).

**CVEs / Security Advisories**
- **spiceai/spiceai**: **zero published GitHub security advisories** (confirmed via `gh api /repos/spiceai/spiceai/security-advisories` → empty array, and via GitHub UI).
- OSV.dev queries for "spice" (crates.io) and "spiceai" (Go) packages returned no results.
- No CVE/NVD entries found for Spice.ai. (Caution: generic web searches for "Spice CVE" surface unrelated results for the **SPICE remote-display protocol** — an unrelated, older open-source project — not Spice.ai the data/AI company. Those were excluded here as they are a different product entirely.)

## Bottom line
- **Turso**: Has a real, named SOC 2 Type II attestation (2024, "zero issues," pen-tested by Doyensec) plus HIPAA BAA and EU DPAs; no ISO 27001 found. One confirmed CVE (CVE-2026-48790, medium, turso-cli credential file permissions, patched) and one confirmed low-severity CVE in its libSQL parser dependency (CVE-2025-47736, patched); the core `tursodatabase/turso` repo itself has no advisories.
- **Spice.ai**: Has a real, named SOC 2 Type II attestation (Feb 2024, audited by Prescient Assurance) and a documented security-controls page; no ISO 27001 found. No CVEs or GitHub security advisories found for `spiceai/spiceai` in GitHub's advisory database or OSV.dev.

Sources:
- [Turso completed SOC2 Type II compliance with zero issues](https://turso.tech/blog/turso-achieves-soc2-compliance)
- [Turso: Secure, Compliant & ready for the Pros (launch week)](https://turso.tech/blog/secure-compliant-and-ready-for-the-pros)
- [GHSA-57f6-pvx8-hwj6 / CVE-2026-48790 — turso-cli advisory](https://github.com/tursodatabase/turso-cli/security/advisories/GHSA-57f6-pvx8-hwj6)
- [DailyCVE writeup of the turso-cli issue (note: mislabels the CVE ID)](https://dailycve.com/turso-cli-insecure-file-permission-world-readable-credential-cve-2024-xxxx-medium-dc-jun2026-700/)
- [tursodatabase/libsql issue #2052 (CVE-2025-47736 source report)](https://github.com/tursodatabase/libsql/issues/2052)
- [OSV.dev — GHSA-8m95-fffc-h4c5 / CVE-2025-47736](https://osv.dev)
- [Announcing ChiselStrike Turso](https://turso.tech/blog/announcing-chiselstrike-turso-164472456b29)
- [Spice AI achieves SOC 2 Type II compliance](https://spice.ai/blog/spice-ai-achieves-soc-2-type-ii-compliance)
- [Security at Spice AI](https://spice.ai/security)
- GitHub Security Advisories API results (`gh api /repos/tursodatabase/turso/security-advisories`, `/repos/tursodatabase/turso-cli/security-advisories`, `/repos/spiceai/spiceai/security-advisories`) — queried directly, no article link (raw API data)