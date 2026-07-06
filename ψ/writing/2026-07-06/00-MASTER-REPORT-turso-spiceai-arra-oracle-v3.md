# รายงานเปรียบเทียบ: Turso vs Spice.ai vs arra-oracle-v3

**สถานะ**: รายงานความรู้ (knowledge report) — ยังไม่มีการแก้โค้ดใดๆ ในโปรเจกต์ไหนทั้งสิ้น เก็บไว้ใช้อ้างอิงและตัดสินใจต่อในอนาคต
**วันที่**: 2026-07-06
**ทำโดย**: Nexus Oracle — เจาะโค้ดจริงของทั้ง 2 โปรเจกต์ + web research + วิเคราะห์เทียบกับโปรเจกต์ของเราเอง (arra-oracle-v3)

---

## TL;DR

- **Turso** = ฐานข้อมูล embedded ที่ compatible กับ SQLite, เขียน Rust ใหม่หมด (ไม่ใช่ fork), ยังเป็น beta
- **Spice.ai** = เอนจิน federation query + AI inference ที่นั่งอยู่หน้าฐานข้อมูลอื่นๆ ไม่ใช่ฐานข้อมูลเอง
- **ความสัมพันธ์**: Spice.ai เอา Turso ไปฝังเป็น 1 ใน 6 accelerator backend ของตัวเอง (อ้างถึง 1,811 ครั้งในโค้ด Spice.ai) — ไม่ใช่คู่แข่งกัน เป็น dependency ทางเดียว
- **arra-oracle-v3** (ของเราเอง) = อยู่คนละหมวดกับทั้งคู่ แต่ใช้หลักการ embedded-SQLite เหมือน Turso — เอามาส่องแล้วเจอบั๊กจริง 2 ตัว + ช่องโหว่ security ที่ยังไม่เปิดเผย

---

## 1. Turso คืออะไร

**สถานะปัจจุบัน**: มีสองโค้ดเบสภายใต้แบรนด์เดียวกัน
- **libSQL** — fork จริงของ SQLite, production/stable, นี่คือสิ่งที่ Turso Cloud เชิงพาณิชย์ใช้อยู่ตอนนี้
- **Turso Database** (เดิมชื่อ "Limbo") — เขียน SQLite ใหม่หมดด้วย Rust (ไม่ใช่ fork), ยัง **beta**, เป็นทิศทางในอนาคตของบริษัท

**จุดเด่นทางเทคนิค** (เจาะโค้ดจริงแล้ว):
- Core engine **ไม่มี `async fn` เลย** — ใช้ cooperative-yield state machine (`StepResult::IO`/`Yield`) แทน เพื่อให้ engine เดียวรันได้ทั้ง io_uring/epoll/IOCP/WASM
- เพิ่ม **MVCC บน WAL เดิม** (ไม่ redesign ใหม่) แก้ปัญหา single-writer ของ SQLite
- Extension mechanism แบบ hand-roll C-ABI ซ่อนหลัง safe Rust trait — **ไม่ compatible กับ extension ของ SQLite จริง**
- เทสหนักเกินระดับ beta มาก: SQLancer/SQLRight/differential-fuzz เทียบกับ SQLite จริง, 2 DST harness (ตัวหนึ่ง validate ด้วย Jepsen Elle), **Antithesis เต็มรูปแบบ** รันทุกคืน
- 7+ language binding (JS/Python/Go/Java/C/Rust/.NET/Tcl/React Native) ผ่าน shared C-ABI middleware (`sdk-kit`)

**บริษัท/เงินทุน**: ก่อตั้งโดย Glauber Costa (CEO, ex-ScyllaDB) + Pekka Enberg (CTO, ex-Linux kernel maintainer), เดิมชื่อ ChiselStrike (เริ่มจาก Backend-as-a-Service ก่อน pivot มาโฟกัส SQLite) — **ยัง seed-only ที่ ~$7M, ~20-22 คน ถึงกลางปี 2026** (ไม่มี Series A)

**Benchmark ที่น่าเชื่อถือที่สุด**: co-founder เอง (Pekka Enberg) พูดใน X ตรงๆ ว่า *"อย่าไปเชื่อ vendor benchmark รวมถึงของผมเอง ให้รันเองดีกว่า"* — benchmark อิสระจาก SQG พบว่า Turso ยังช้ากว่า better-sqlite3 มากในหลายกรณี (เช่น COUNT ช้ากว่าเกือบ 100 เท่า)

**Security**: มี SOC 2 Type II (ผ่าน Doyensec pen-test, 2024) และมี CVE ที่เปิดเผยจริง (เช่น CVE-2026-48790 — JWT เก็บแบบ world-readable)

📁 รายละเอียดเต็ม: `ψ/learn/tursodatabase/turso/2026-07-06/` (5 ไฟล์ — Architecture, Code Snippets, Quick Reference, Testing, API Surface)

---

## 2. Spice.ai คืออะไร

**คืออะไร**: engine federation query + AI inference เขียนด้วย Rust บน Apache DataFusion — **ไม่ใช่ฐานข้อมูล** แต่นั่งอยู่หน้าฐานข้อมูล/warehouse อื่นๆ (30+ connector) แล้ว cache/accelerate ข้อมูลในเครื่อง

**จุดเด่นทางเทคนิค** (เจาะโค้ดจริงแล้ว):
- Workspace Rust 76 crate, มี connector แยกเป็น **34 crate** ต่อ 1 แหล่งข้อมูล (Postgres, Snowflake, Kafka, MongoDB ฯลฯ)
- Federation ผ่าน DataFusion fork ของตัวเอง — มี per-source SQL dialect unparsing จริง ไม่ใช่แค่ pass-through
- Distributed execution ผ่าน **Apache Ballista** (fork เอง) — HA scheduler coordinate ผ่าน S3 object storage แทนที่จะใช้ etcd/ZooKeeper
- Text-to-SQL (NSQL) เป็น loop ที่แก้ตัวเองได้ และ **บังคับรันแบบ read-only เสมอ** เพื่อกัน SQL injection จาก LLM
- Vector search: delegate ไปที่ AWS S3 Vectors (cold storage) + DuckDB HNSW (hot cache) — ไม่สร้าง vector DB เอง

**ความสัมพันธ์กับ Turso**: Spice.ai เอา Turso ไปฝังเป็น 1 ใน 6 data accelerator backend ที่เลือกได้ผ่าน config (`engine: turso`) — โค้ดจริงมี `crates/data_components/src/turso.rs` ยาว 3,109 บรรทัด implement เต็มรูปแบบ แถมยังใช้ Turso ซ้ำอีกจุดเป็น metastore ของ Cayenne (accelerator engine ตัวใหม่ล่าสุด) ฝั่ง Turso เองพูดถึง Spice.ai แค่ 1 บรรทัดในทั้งเรพโป — ความสัมพันธ์เป็นทางเดียว ไม่ใช่ partnership

**บริษัท/เงินทุน**: ก่อตั้งโดย Luke Kim (CEO, ex-Microsoft/Dapr) — **เดิมทีเคย pitch ตัวเองเป็นแพลตฟอร์ม Web3/blockchain ตอน seed round ปี 2022** แล้วค่อยๆ ถอด messaging นั้นออกช่วง 2024-2025 หันมาโฟกัส enterprise data federation แทน — ยัง seed-only ที่ ~$14.5M, ~17-18 คน

**ภัยคุกคามที่แท้จริง**: ไม่ใช่ Turso แต่คือ **Databricks ซื้อ Neon ไป ~$1 พันล้าน (พ.ค. 2025)** แล้วลดราคาทันที — ถ้า hyperscaler ผลักฟีเจอร์แบบเดียวกันเข้าแพลตฟอร์มตัวเองโดยตรง Spice.ai (middleware) อาจโดนบีบออกจากตลาด enterprise

**Security**: มี SOC 2 Type II เช่นกัน (ผ่าน Prescient Assurance, 2024) แต่มีบั๊กที่น่าสนใจ: **MCP server เคยตั้งชื่อ tool มี `/` ซึ่งขัดกับกฎของ Claude/Cursor ทำให้ integration พังไปเลย**

📁 รายละเอียดเต็ม: `ψ/learn/spiceai/spiceai/2026-07-06/` (5 ไฟล์) + `ψ/writing/2026-07-06/turso-spiceai-relationship.md` (การเชื่อมโยงแบบละเอียด file:line)

---

## 3. บริบทตลาดกว้างๆ (จาก Gemini Deep Research, 117 แหล่ง)

- ทั้งคู่อยู่ในกระแสใหญ่เดียวกัน: **"embedded database กลายเป็น commodity building block สำหรับ AI agent memory"** — Neon (ของ Databricks) รายงานว่า 80%+ ของ database ใหม่บนแพลตฟอร์มถูกสร้างโดย AI agent ไม่ใช่คน
- Turso แข่งกับ: Neon, PlanetScale, Cloudflare D1, ElectricSQL, PowerSync, LiteFS/Marmot, rqlite/CR-SQLite — จุดต่างคือ Turso ทำ embedded replica แบบ zero-latency read ได้ดีกว่า
- Spice.ai แข่งกับ: Trino/Presto, ClickHouse/Materialize, Cube, Tinybird/Estuary — จุดต่างคือ decentralized sidecar model แทนที่จะเป็น central cluster
- **Community sentiment แบบสองด้าน**: ชมเรื่อง DX (connection pooling, HA scheduler) แต่วิจารณ์เรื่อง reliability จริง (Turso: WAL corruption bugs, ecosystem แตกจาก SQLite; Spice.ai: OOM ที่ scale ใหญ่, schema rigidity)

📁 รายละเอียดเต็ม: `ψ/writing/2026-07-06/gemini-deep-research-turso-spiceai-ecosystem.txt`, `turso-spiceai-benchmarks.md`, `turso-spiceai-security-posture.md`, `turso-spiceai-roadmap-h2-2026.md`, `turso-spiceai-ai-framework-integration.md`, `turso-spiceai-hiring-signals.md`

---

## 4. บทเรียนสำหรับ arra-oracle-v3 (ของเราเอง) — เก็บเป็นความรู้

**arra-oracle-v3 คืออะไร**: "Docker-first MCP Memory + Search" ของ Soul-Brews-Studio — เก็บ note ใน SQLite (`bun:sqlite`), ค้นหาผ่าน FTS5 + vector adapter (LanceDB/sqlite-vec/Qdrant), เปิดผ่าน HTTP/MCP/CLI/plugin/Studio UI

**ตำแหน่งในตลาด**: ไม่ใช่คู่แข่งของ Turso หรือ Spice.ai เลย — มี "premise" เดียวกับ Turso (embedded SQLite) แต่ไม่มี "จุดเด่น" ของ Turso (sync protocol ระหว่าง replica) และไม่มี DNA ร่วมกับ Spice.ai (federation ข้าม engine)

**สิ่งที่เอามาส่องแล้วเจอ** (เป็นความรู้ ไม่ใช่คำสั่งให้แก้):
1. arra-oracle-v3 เจอปัญหา **single-writer bottleneck เดียวกับที่ Turso ทั้งบริษัทเกิดมาเพื่อแก้** — แต่แก้แบบ "503 ขอโทษ" แทนที่จะแก้ที่ต้นตอ
2. เจอบั๊กจริง 2 ตัวระหว่างการเจาะโค้ด: CI test รันซ้ำโดยไม่รู้ตัว (เพราะ worktree ซ้อน), sqlite-vec คืนผลค้นหาไม่ครบแบบเงียบๆ ตอน filter เข้ม
3. Turso และ Spice.ai ต่างมี SOC 2 Type II ทั้งคู่ตั้งแต่ seed stage — arra-oracle-v3 ยังไม่มีอะไรแบบนี้เลย และ docstring ของโค้ดเองก็ยอมรับตรงๆ ว่า plugin sandbox ไม่ใช่ security boundary จริง
4. Spice.ai มี `docs/ROADMAP.md` ไฟล์เดียวที่ระบุ version/milestone ชัดเจน — arra-oracle-v3 ไม่มีอะไรแบบนี้เลยทั้งที่มีเอกสาร 60+ ไฟล์

**ข้อสรุปเชิงกลยุทธ์ (จาก 10-lens prism analysis)**: อย่าเพิ่งสร้าง sync protocol แบบ Turso หรือจ้าง pen-test ตอนนี้ — ให้แก้บั๊กที่มีหลักฐานจริงก่อน (มี sprint backlog 8 ข้อพร้อมสมมติฐานแบบ testable รออยู่แล้วในระบบ task ถ้าจะหยิบมาทำวันหลัง)

📁 รายละเอียดเต็ม: `ψ/learn/Soul-Brews-Studio/arra-oracle-v3/2026-07-06/` (5 ไฟล์) + `ψ/writing/2026-07-06/arra-oracle-v3-prism-10-analysis.md` (10 lens เต็ม) + `arra-oracle-v3-sprint-plan.md` (backlog เต็ม)

---

## แผนที่ไฟล์ทั้งหมด (สำหรับกลับมาอ่านทีหลัง)

```
ψ/learn/tursodatabase/turso/2026-07-06/           — เจาะโค้ด Turso (5 ไฟล์)
ψ/learn/spiceai/spiceai/2026-07-06/                — เจาะโค้ด Spice.ai (5 ไฟล์)
ψ/learn/Soul-Brews-Studio/arra-oracle-v3/2026-07-06/ — เจาะโค้ด arra-oracle-v3 (5 ไฟล์)
ψ/writing/2026-07-06/
  ├── 00-MASTER-REPORT-turso-spiceai-arra-oracle-v3.md  ← ไฟล์นี้ (จุดเริ่มอ่าน)
  ├── turso-spiceai-relationship.md                      — ความสัมพันธ์ code-level ละเอียด
  ├── gemini-deep-research-turso-spiceai-ecosystem.txt    — ตลาด/เงินทุน/คู่แข่ง (117 แหล่ง)
  ├── turso-spiceai-benchmarks.md                         — benchmark จริง+อิสระ
  ├── turso-spiceai-security-posture.md                   — SOC2/CVE
  ├── turso-spiceai-roadmap-h2-2026.md                    — แผนอนาคต
  ├── turso-spiceai-ai-framework-integration.md           — MCP/LangChain/LlamaIndex
  ├── turso-spiceai-hiring-signals.md                     — สัญญาณจาก job posting
  ├── arra-oracle-v3-prism-10-analysis.md                 — 10-lens วิเคราะห์ arra-oracle-v3
  └── arra-oracle-v3-sprint-plan.md                       — sprint backlog (ยังไม่ลงมือทำ)
ψ/memory/learnings/2026-07-06_*.md                        — สรุปสั้นแบบ searchable (5 ไฟล์)
```

**หมายเหตุเรื่อง task**: ตอนแรกสร้าง task #1-8 ไว้ในระบบเป็น sprint backlog แต่ลบทิ้งแล้ว (2026-07-06) เพราะรอบนี้ตั้งใจแค่ทำรายงานความรู้ ยังไม่ลงมือแก้โค้ด — สมมติฐาน/action/verify/expected ของแต่ละข้อยังอยู่ครบใน `arra-oracle-v3-sprint-plan.md` ด้านบน ถ้าจะแก้จริงในอนาคตให้เริ่มวางแผนใหม่จากไฟล์นั้น (บริบทอาจเปลี่ยนไปแล้ว ควร re-verify ก่อนลงมือ ไม่ใช่แค่ copy tasks เก่ากลับมา)
