# Plan: KlawCRM — AI-Powered Social Commerce CRM

> Competing product to OpenClaw Mini CRM, fixing the gaps we found.
> Codename: **KlawCRM** (กลอว์)

---

## Vision

**"The CRM that Thai sellers actually use on their phone."**

Mobile-first, AI-native, Thai-first CRM that unifies LINE/Facebook/Instagram chat with automatic customer scoring, workflow automation, and one-tap data export.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Same as OpenClaw but we use RSC properly |
| UI | shadcn/ui + Tailwind CSS 4 | Better components, accessible by default |
| Database | PostgreSQL + Drizzle ORM | Relational > MongoDB for CRM queries |
| Auth | NextAuth.js v5 | Google + LINE Login (Thai users expect LINE login) |
| AI | Claude API (Anthropic SDK) | Sentiment, scoring, RAG, auto-responses |
| Realtime | Server-Sent Events or Pusher | Live chat updates |
| Charts | Recharts | Lightweight, React-native |
| Mobile | PWA + responsive-first | No native app needed |
| Deploy | Vercel | Fast, global CDN |
| Payments | PromptPay QR generation | Thai-native payment |

---

## Phase 1: Foundation (Today's Session)

Build the core shell — layout, navigation, and 3 key pages as working prototypes.

### Step 1: Project Setup
- [ ] `npx create-next-app@latest klaw-crm` with App Router + Tailwind + TypeScript
- [ ] Install shadcn/ui, Recharts, lucide-react icons
- [ ] Setup project structure

### Step 2: Layout & Navigation
- [ ] Responsive sidebar (collapsible on mobile → bottom nav)
- [ ] Thai-first labels with emoji icons (like OpenClaw but better mobile)
- [ ] Dark/light theme toggle (shadcn built-in)
- [ ] Mobile: bottom tab bar with 5 key sections

### Step 3: Dashboard Page (`/dashboard`)
- [ ] Revenue cards with comparison to previous period (OpenClaw gap #1)
- [ ] Area chart for daily revenue
- [ ] Donut chart for payment methods
- [ ] Skeleton loading states (OpenClaw gap #2)

### Step 4: Chat Page (`/chat`)
- [ ] Split view: conversation list | chat detail
- [ ] Mobile: full-screen list → tap → full-screen chat
- [ ] AI sentiment badges (green/yellow/red)
- [ ] Customer score inline
- [ ] Channel indicator (LINE/FB/IG/TG)

### Step 5: CRM Page (`/crm`)
- [ ] Table + Kanban toggle view
- [ ] Customer cards with score, tags, last contact
- [ ] Search with full-text
- [ ] **Export button** (CSV/PDF) — the gap we're fixing
- [ ] Bulk actions toolbar

---

## Phase 2: AI Features (Future)

- [ ] Claude-powered sentiment analysis on chat messages
- [ ] RAG knowledge base (upload docs → AI learns)
- [ ] Auto-closer workflow (time-based follow-up sequences)
- [ ] AI customer scoring with explainability ("scored 90 because...")

---

## Phase 3: Differentiators (Future)

- [ ] Visual workflow builder (drag-and-drop automation)
- [ ] PromptPay QR generation per transaction
- [ ] Broadcast with A/B testing + analytics
- [ ] LINE Login (not just Google)
- [ ] Offline PWA support
- [ ] Multi-language (Thai default, English toggle)

---

## Key Improvements Over OpenClaw

| OpenClaw Gap | KlawCRM Fix |
|-------------|-------------|
| Spinner-stuck pages | Skeleton loading + error boundaries everywhere |
| No data export | CSV + PDF export on every data page |
| Small text, no zoom | Mobile-first responsive, larger touch targets, zoom allowed |
| No score explanation | "Why this score?" expandable with AI reasoning |
| No workflow builder | Visual drag-and-drop automation (Phase 3) |
| No payment integration | PromptPay QR generation built-in |
| No A/B testing | Broadcast A/B with metrics |
| MongoDB limitations | PostgreSQL for proper relational queries |
| No LINE Login | LINE Login + Google OAuth |

---

## File Structure

```
klaw-crm/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Landing/login
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with nav
│   │   ├── page.tsx            # Main dashboard
│   │   ├── chat/page.tsx       # Chat inbox
│   │   ├── crm/page.tsx        # Customer management
│   │   ├── catalog/page.tsx    # Products
│   │   ├── revenue/page.tsx    # Revenue analytics
│   │   └── settings/page.tsx   # Settings
│   └── api/
│       ├── auth/               # NextAuth
│       └── ai/                 # AI endpoints
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── header.tsx
│   ├── dashboard/
│   │   ├── revenue-cards.tsx
│   │   ├── revenue-chart.tsx
│   │   └── payment-donut.tsx
│   ├── chat/
│   │   ├── conversation-list.tsx
│   │   ├── chat-detail.tsx
│   │   └── sentiment-badge.tsx
│   └── crm/
│       ├── customer-table.tsx
│       ├── customer-kanban.tsx
│       └── export-button.tsx
├── lib/
│   ├── db/                     # Drizzle schema
│   ├── ai/                     # Claude integration
│   └── utils.ts
└── public/
```

---

## Today's Goal

Ship Phase 1 — a working prototype with:
1. Beautiful responsive layout (mobile-first)
2. Dashboard with real-looking demo data
3. Chat page with conversation list
4. CRM page with export capability
5. Everything has skeleton loading states
