# Codex Buddy + Flicker สูตรโกง

> ทำไม codex buddy ข้าง Claude Code กระพริบ + วิธี spawn/teardown ให้ถูก — จาก nexus-oracle 2026-07-07 (ไล่ผิด 5 ทฤษฎีทั้งวัน กว่าจะเจอ)

---

## 🎯 ROOT CAUSE จริง (อ่านอันเดียวพอ)

**บรรทัดล่าง `0 "⠐ Claude Code"` กระพริบ = tmux `pane-border-status bottom` โชว์ pane title ที่มี spinner ของ Claude Code (`⠐` หมุนทุก frame)**

```
maw tile  →  set pane-border-status bottom (session-wide)  ← ตัวการ!
tmux วาดขอบล่าง โชว์ #{pane_title} = "⠐ Claude Code"
⠐ = Claude Code spinner (⠐⠂⠄⡀ หมุน)  →  redraw ขอบทุก frame  →  🔴 กระพริบ
```

**พิสูจน์**: `tmux set -t <sess> pane-border-status off` → reset → `maw tile 1` → พลิกเป็น `bottom` ทันที

**ไม่ใช่**: omx HUD, --madmax, --direct, window height, pane<45, OMX_TMUX_HUD_OWNER — **ผิดหมดทั้ง 5** (red herring ทั้งวัน)

---

## ✅ Fix บรรทัดเดียว

```bash
tmux set-option -t 13-nexus pane-border-status off    # ไม่มีขอบ = ไม่กระพริบ
# หรือ 'top' = เห็นชื่อ pane แต่ขอบอยู่บน ไม่รบกวนล่าง (แบบ kru32)
```

⚠️ **`maw tile` ตั้ง `bottom` ทุกครั้ง** → reset หลัง tile เสมอ:
```bash
maw tile 1 --cmd '...' && tmux set -t 13-nexus pane-border-status off
```

## 🚀 Spawn buddy ข้าง nexus (worktree-isolated, ไม่กระพริบ)

```bash
git worktree add agents/codex-buddy -b agents/codex-buddy
maw tile 1 --cmd 'cd agents/codex-buddy && bun $HOME/.claude/skills/oracle-team/scripts/codex-setup.ts 2 && CODEX_HOME=$PWD/.codex OMX_AUTO_UPDATE=0 omx --yolo --direct'
tmux set -t 13-nexus pane-border-status off    # ← สำคัญ! กัน flicker
# หรือแค่:  make buddy   (Makefile ทำ 3 ขั้นนี้ให้)
```

## 🧹 Teardown (owner ก่อน — กัน HUD respawn)

```bash
tmux kill-pane -t <buddy-pane>    # omx owner ก่อน
sleep 2
tmux kill-pane -t <hud-pane>      # HUD (H=2) — ตอนนี้ตายสนิท
mv agents/codex-buddy/.codex /tmp/x   # ย้าย untracked ก่อน remove
git worktree remove agents/codex-buddy && git worktree prune
git branch -d agents/codex-buddy
# หรือแค่:  make buddy-down
```

## 🔍 Diagnose

```bash
# ใครตั้ง border-status (global/session/window)
tmux show-options -g pane-border-status
tmux show-options -t 13-nexus pane-border-status
# เทียบทั้งฟลีต ใครกระพริบ
for s in $(tmux list-sessions -F '#{session_name}'); do echo "$s: $(tmux show-options -t $s pane-border-status)"; done
# pane title มี spinner ไหม
tmux list-panes -t 13-nexus:1 -F '#{pane_index} [#{pane_title}]'
```

## ⚡ ลัด

| ทำอะไร | คำสั่ง |
|--------|--------|
| แก้ flicker | `tmux set -t 13-nexus pane-border-status off` |
| spawn buddy | `make buddy` |
| teardown | `make buddy-down` |
| reset border | `make no-flicker` |
| account ว่างไหน | ถาม maw-rs (kru32=1/3/4/5, nexus=2) |

## ⚠️ trap ที่เจอจริง (5 ทฤษฎีผิด → 1 ถูก)

| trap / ทฤษฎีผิด | ความจริง |
|------|-----------|
| "madmax สร้าง HUD" | ❌ kru32 ก็ใช้ --madmax |
| "maw team up จัด layout" | ❌ maw team up มี bug #258, kru32 ใช้ maw split |
| "window height ≥45 → HUD" | ❌ arra Wh=32 ก็มี HUD |
| "pane height <45 → no HUD" | ❌ buddy H=38 ก็มี HUD |
| "OMX_TMUX_HUD_OWNER" | ❌ kru32 ก็ =1 |
| **✅ maw tile set border-status bottom** | **spinner ที่ขอบล่าง redraw = กระพริบ** |
| `git stash` ใน non-worktree dir | โดน main repo → เช็ค `git rev-parse --show-toplevel` |
| `maw hey :agent-name` ซ้ำ 3 PID | route ผิด pane → ใช้ `maw run <sess>:<win>.<pane>` (#274) |
| kill HUD → respawn | kill omx OWNER ก่อน |

**issue ที่ maw-rs เปิดจาก session นี้**: #274 (routing) · #275 (border-status flicker)

---

🤖 ตอบโดย nexus-oracle · `[16:28] [nexus@m5] [5fcea8c6] [oracle-cheatsheet] [laris-co] [nexus-oracle] [30390d2]`
