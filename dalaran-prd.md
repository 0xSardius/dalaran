# DALARAN — Product Requirements Document

**Version:** 0.2  
**Date:** February 14, 2026  
**Author:** Justin  
**Status:** Draft — Solana Graveyard Hackathon Submission  
**Hackathon:** [Solana Graveyard Hack](https://solana.com/graveyard-hack) (Feb 12–27, 2026)  
**Track:** Realms — DAOs ($5,000 bounty)  
**Submission Deadline:** February 27, 2026

---

## 0. Hackathon Context

The Solana Graveyard Hackathon asks builders to "resurrect dead categories." DAOs are one of them — crypto elites and the trenches left them for dead. But the infrastructure survived. What died was accessibility.

Dalaran is named after the floating city in Warcraft lore — destroyed by Archimonde, left as a crater, then literally resurrected and lifted into the sky. It became a neutral hub governed by the Council of Six, where factions cooperate despite their differences. The parallel is intentional: DAOs were destroyed by complexity and crypto-native UX. Dalaran resurrects them — for everyone.

**Hackathon narrative:** *"Dalaran was destroyed and rose again. So did DAOs."*

**Track alignment (Realms — DAOs):**
- **$2,500 — Governance Builders:** Dalaran is governance tooling built on Realms — a consumer-grade UX layer that makes SPL Governance accessible to non-crypto communities
- **$1,500 — Realms Extensions:** Dalaran extends Realms with threaded discussion, AI-powered summaries, and fiat on/offramps
- **$1,000 — Authority-First Orgs:** Dalaran enables communities to create organizations with strong onchain authority via Realms treasury and proposal execution

**Submission requirements:** Working demo, 3-min video walkthrough, GitHub repo, source code, 1–5 person team.

---

## 1. Problem Statement

Communities of 250–1,000 people have no good tool to pool funds, discuss decisions, and take collective action together. The DAO wave produced powerful governance infrastructure, but none of it survived in a form usable by non-web3 people. Meanwhile, web2 group payment tools like Braid (now shut down) handled money pooling but lacked governance, decision-making, or collective action capabilities.

The result: communities default to a patchwork of Venmo/PayPal for money, Google Forms for votes, Discord for discussion, and spreadsheets for tracking. One person becomes the unpaid CFO. Trust erodes. Participation drops. Collective action stalls.

**Source signal:** [Timour Kosters on X](https://x.com/timourxyz) — "Is there any really good tool for communities of 250–1,000 people to pool funds, discuss and make decisions, and engage in collective action? Would have to be usable by non-web3 ppl."

---

## 2. Product Vision

Dalaran is a collective treasury and governance app for mid-size communities. It lets groups pool real dollars, discuss proposals, vote on decisions, and execute spending — all in one place. Solana and Realms (SPL Governance) power the backend — providing transparent, programmable, trustless governance — but the user experience is pure web2 simplicity: email login, dollar amounts, zero gas fees, no wallets visible.

The UI uses warcraftcn components — Warcraft III-inspired parchment textures, gothic frames, and gold accents — creating a distinctive "council chamber" aesthetic that reinforces the governance metaphor and sets Dalaran apart from every generic DAO tool and fintech app on the market.

**One-liner:** Pool · Discuss · Decide · Act — together.

**Extended pitch:** Dalaran is the Council of Six for every community. Pool your war chest, debate proposals in the council chamber, vote with your voice, and execute decisions automatically — all powered by Solana, none of it visible.

**Core thesis:** The 250–1,000 person range is a dead zone. Too big for Splitwise/Venmo (one person can't manage it). Too small and non-technical for Aragon/Snapshot/Realms UI. Dalaran owns this niche.

---

## 3. Target Users

### Primary Personas

**The Archmage (Community Organizer / Creator)**
- Runs a neighborhood association, mutual aid group, creative collective, investment club, coworking space, or alumni fund
- Currently manages group money through personal accounts
- Needs transparency to maintain trust at scale
- Not crypto-native; may have heard of Bitcoin but doesn't own any

**The Citizen (Community Member / Participant)**
- Contributes funds and votes on proposals
- Wants visibility into how money is spent
- Will not download a wallet, buy SOL, or learn what "gas" means
- Expects the UX quality of Venmo or Cash App

**The Councilor (Community Delegate / Power User)**
- Active contributor who helps write proposals and shepherd discussion
- May manage sub-budgets or committees
- Wants more control without the full admin burden

### Community Types (Initial Focus)

- Neighborhood associations and HOAs
- Mutual aid networks
- Investment and savings clubs
- Creative collectives and co-ops
- Alumni groups and reunion funds
- Coworking spaces and shared studios
- Social clubs and group trip funds
- Small nonprofit chapters

---

## 4. Core Requirements

These map directly to the four capabilities identified in the original signal: **pool funds**, **discuss**, **make decisions**, and **engage in collective action**.

### 4.1 Pool Funds (The War Chest)

**What users see:** "Add gold to the war chest" — feels like Venmo with a fantasy skin.

| Requirement | Details | Priority |
|---|---|---|
| Fiat onramp | Members deposit USD via debit/credit card or bank transfer (ACH) | P0 |
| Stablecoin treasury | All pooled funds held as USDC on Solana via Realms native treasury | P0 |
| Fiat offramp | Withdraw pool funds to bank account | P0 |
| Treasury dashboard | Real-time balance, contribution history, spending log | P0 |
| Recurring contributions | Members can set up auto-deposits (weekly/monthly) | P1 |
| Contribution tracking | Per-member contribution totals and history | P0 |
| Pool links | Shareable URL for anyone to contribute without an account | P1 |
| Sub-treasuries | Earmark funds for specific purposes (e.g., "Events Budget", "Emergency Fund") — maps to multiple Realms governance accounts | P2 |

**What's invisible:** Privy embedded wallet creation, USDC conversion via Bridge/Stripe, SPL Governance native treasury on Solana, transaction fees (near-zero on Solana). The user never sees a wallet address, token symbol, or blockchain transaction.

### 4.2 Discuss (The Council Chamber)

**What users see:** A discussion thread under every proposal — like a focused Reddit thread or Notion comment section, skinned in warcraftcn parchment.

| Requirement | Details | Priority |
|---|---|---|
| Proposal threads | Every proposal gets a dedicated discussion thread | P0 |
| Threaded replies | Members can reply to specific comments | P0 |
| Reactions | Lightweight sentiment signaling (⚔️ 🛡️ 🤔 ❤️) | P0 |
| Temperature checks | Informal polls before formal votes ("Are we directionally aligned?") | P1 |
| AI discussion summary | Auto-generated summary that updates as comments come in | P1 |
| Mention/notify | @mention members or roles to pull them into discussion | P1 |
| Rich text + links | Basic formatting, link previews, image embeds | P1 |
| General discussion board | Non-proposal discussion space for the community | P2 |

**Key design principle:** Discussion and voting are not separate workflows. The thread IS the proposal lifecycle: Draft → Discuss → Temperature Check → Formal Vote → Execute. All in one view, one scroll.

### 4.3 Make Decisions (The Vote)

**What users see:** Clean voting UI in warcraftcn card components with clear outcomes — feels like a polished council vote, not a blockchain governance portal.

| Requirement | Details | Priority |
|---|---|---|
| Proposal creation | Any member (or role-gated) can create a proposal | P0 |
| Proposal types | Funding request, policy change, election, general resolution | P0 |
| Voting | Yes / No / Abstain with configurable quorum and approval thresholds | P0 |
| Quorum settings | Admin-configurable minimum participation % to pass | P0 |
| Voting period | Configurable duration (24hrs – 14 days) | P0 |
| Vote privacy | Option for open or anonymous voting | P1 |
| Delegation | Members can delegate voting power to trusted councilors | P2 |
| Proposal templates | Pre-built templates for common proposal types | P1 |
| Voter notifications | Push/email notifications for new proposals and approaching deadlines | P0 |
| AI voter nudges | Agent reminds members to vote as deadline approaches | P1 |

**Realms integration:** Votes are cast via SPL Governance under the hood. Each vote is a `CastVote` instruction submitted through the user's Privy embedded wallet. The user just taps Yes/No — the Solana transaction is invisible.

### 4.4 Engage in Collective Action (Execute Orders)

**What users see:** "Proposal passed — funds sent." Automatic, transparent, auditable.

| Requirement | Details | Priority |
|---|---|---|
| Auto-execution | Passed funding proposals execute embedded Solana instructions via Realms | P0 |
| Execution log | Immutable record of every action (onchain via Solana explorer) | P0 |
| Multi-recipient payouts | Single proposal can distribute to multiple recipients | P1 |
| Recurring payments | Approved recurring disbursements (e.g., monthly rent for shared space) | P2 |
| Milestone-based release | Release funds in tranches tied to deliverable milestones | P2 |
| External integrations | Trigger actions in other tools (Notion, Discord, email) on proposal pass | P3 |
| Spending limits | Admin can set per-transaction or per-period spending caps | P1 |

**Realms integration:** Proposals in SPL Governance can contain embedded Solana instructions (e.g., SPL token transfer of USDC from native treasury to recipient). When a proposal passes and the voting period ends, anyone can call `ExecuteTransaction` to trigger the embedded instructions. Dalaran automates this call server-side.

---

## 5. Non-Functional Requirements

### 5.1 Usability (The Whole Point)

- **Zero crypto knowledge required.** No wallet addresses, gas fees, token symbols, or blockchain terminology anywhere in the UI. Dollar amounts only.
- **Sign up in < 30 seconds.** Email or phone number → verify → you're in.
- **Mobile-first.** PWA that works great on mobile browsers. Native app is P2.
- **Distinctive UI.** warcraftcn components create a memorable "council chamber" aesthetic. Not another generic dashboard.
- **Accessibility.** WCAG 2.1 AA compliance.

### 5.2 Security & Trust

- Privy embedded wallets secured by TEEs with passkey support
- Realms SPL Governance handles onchain authority — no single key controls the treasury
- Council (admin) + community (member) dual-population model via Realms
- All treasury transactions verifiable on Solana explorer (for those who want to check)
- SOC 2 compliant infrastructure (Privy + Vercel)

### 5.3 Performance

- Page load < 2s on 3G
- Vote submission < 1s (Solana finality ~400ms)
- Real-time balance updates via websocket or polling

### 5.4 Compliance

- KYC/AML via Stripe Identity for pool creators and withdrawals above thresholds
- Money transmission considerations — legal review required before launch (Bridge/Stripe handle the regulated layer)
- Privacy policy and terms of service

---

## 6. System Architecture

### 6.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                       USER LAYER                              │
│           "The citizen sees a council chamber, not a chain"   │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │  Next.js PWA  │  │  Privy Auth   │  │ Stripe / Bridge │   │
│  │  warcraftcn   │  │  Email, SMS,  │  │ Fiat ↔ USDC     │   │
│  │  UI components│  │  Social Login │  │ Onramp / Offramp│   │
│  └──────┬────────┘  └───────┬───────┘  └───────┬─────────┘   │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼──────────────┐
│         ▼                  ▼                  ▼               │
│                    APPLICATION LAYER                          │
│           "The council logic — propose, discuss, decide"      │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │ Realm Manager │  │  Discussion   │  │   AI Agent      │   │
│  │ Create realm, │  │  Engine       │  │   (Vercel AI    │   │
│  │ manage members│  │  Threads,     │  │    SDK + Claude)│   │
│  │ configure     │  │  polls,       │  │   Summarize,    │   │
│  │ governance    │  │  reactions    │  │   nudge, flag   │   │
│  └───────────────┘  └───────────────┘  └─────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Realms SDK Abstraction Layer               │   │
│  │  Wraps SPL Governance SDK — translates app actions     │   │
│  │  into Solana instructions via Privy server wallets     │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
          │
┌─────────┼────────────────────────────────────────────────────┐
│         ▼                                                     │
│              SOLANA / REALMS LAYER                             │
│           "The onchain truth — transparent, immutable"        │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │ SPL Governance│  │  Realm        │  │  Native         │   │
│  │ Program       │  │  Account      │  │  Treasury       │   │
│  │ (Realms)      │  │  Council +    │  │  USDC held in   │   │
│  │ Proposals,    │  │  Community    │  │  governance     │   │
│  │ voting,       │  │  populations  │  │  PDA wallet     │   │
│  │ execution     │  │              │  │                  │   │
│  └───────────────┘  └───────────────┘  └─────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    Solana (Mainnet)                      │   │
│  │          ~400ms finality · ~$0.0001 per tx              │   │
│  │          USDC (SPL Token) · No gas sponsorship needed   │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Realms / SPL Governance Integration

SPL Governance provides the onchain backbone. Here's how Dalaran maps to the Realms account hierarchy:

| Realms Concept | Dalaran Concept | Description |
|---|---|---|
| Realm | Community | Top-level entity. One Dalaran community = one Realm. Created with community mint + optional council mint. |
| Council Population | Admins / Archmages | Small group (3–7) with elevated permissions. Can veto, fast-track proposals, manage membership. Council tokens distributed to admins. |
| Community Population | Members / Citizens | All members. Community tokens minted to each member's embedded wallet on join. 1 member = 1 token = 1 vote. |
| Governance | Treasury Config | Configuration for a specific treasury account — quorum %, voting period, proposal thresholds. One realm can have multiple governances (sub-treasuries). |
| Native Treasury | War Chest | PDA-derived wallet owned by the governance. Holds USDC. Only accessible via passed proposals. |
| Proposal | Proposal | Contains a title, description link (IPFS or off-chain), and embedded Solana instructions to execute on pass. |
| SignatoryRecord | — | Not used in v1. Proposals go directly to voting. |
| ProposalTransaction | Funding Action | Embedded SPL Token transfer instruction: move X USDC from native treasury to recipient. |
| VoteRecord | Vote | One per member per proposal. Yes / No / Abstain. Cast via `CastVote` instruction. |

**Key SDK packages:**
- `@solana/spl-governance` — core SDK for interacting with SPL Governance program
- `governance-idl-sdk` — IDL-based SDK (newer, maintained by Mythic Project)
- `@solana/spl-token` — for USDC (SPL Token) transfers
- `@privy-io/react-auth` + `@privy-io/server-auth` — auth + embedded Solana wallets

**Governance flow:**
```
1. CreateRealm          → Dalaran community created, council + community mints deployed
2. DepositGoverning     → Member's community token deposited to activate voting weight
   TokensInstruction
3. CreateProposal       → Member submits proposal (metadata stored off-chain in Postgres)
4. InsertTransaction    → Embed USDC transfer instruction into proposal
5. SignOffProposal      → Proposal moves to voting state
6. CastVote             → Members vote Yes/No/Abstain (via Privy embedded wallet)
7. FinalizeVote         → Voting period ends, tally computed onchain
8. ExecuteTransaction   → If passed, embedded USDC transfer executes automatically
```

All of these are Solana instructions submitted through Privy's server wallet infrastructure — the user never signs a transaction manually.

### 6.3 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS | Fast iteration, SSR, existing expertise |
| UI Components | warcraftcn/ui (shadcn-compatible) | Distinctive Warcraft III aesthetic — cards, buttons, inputs, badges, dropdowns, skeletons. Install via `pnpm dlx shadcn@latest add https://warcraftcn.com/r/[component].json` |
| Auth & Wallets | Privy SDK, Embedded Solana Wallets | Email/social login, invisible wallet creation, Solana-native |
| Chain | Solana Mainnet (or Devnet for hackathon) | Sub-second finality, near-zero fees, Realms-native |
| Governance | SPL Governance (Realms) | Battle-tested onchain governance. Proposals, voting, treasury, execution. |
| Stablecoin | USDC (SPL Token on Solana) | Most trusted, deep Solana liquidity |
| Payments (Fiat ↔ Crypto) | Stripe Connect + Bridge | Fiat onramp/offramp, Stripe owns Bridge, regulatory compliance built in |
| Backend | Vercel Serverless Functions, Postgres (Neon) | Serverless scale, familiar stack |
| AI Agent | Vercel AI SDK, Claude API | Discussion summaries, voter nudges, proposal flagging |
| Off-chain Storage | Postgres (Neon) | Discussion threads, comments, AI summaries, user profiles, proposal metadata |
| Real-time | Vercel KV + WebSockets (or Ably/Pusher) | Live vote counts, discussion updates |
| File Storage | Vercel Blob or Cloudflare R2 | Proposal attachments, community avatars |

### 6.4 warcraftcn UI Component Mapping

| Component | Dalaran Usage |
|---|---|
| Card | Proposal cards, treasury balance card, member cards |
| Button | Vote buttons (Yes/No/Abstain), deposit CTA, create proposal |
| Input | Proposal form fields, deposit amount, search |
| Badge | Proposal status (Voting, Passed, Failed, Executed), member roles (Archmage, Councilor, Citizen) |
| Dropdown Menu | Proposal type selector, member actions, settings |
| Skeleton | Loading states for proposals, treasury, discussions |

Additional custom components (built in warcraftcn style):
- **Parchment Panel** — proposal detail view with full discussion thread
- **Vote Banner** — full-width voting bar with animated progress
- **Treasury Chest** — stylized balance display with gold coin motif
- **Council Ring** — member avatars in circular layout for small councils

### 6.5 User Flow

```
Archmage creates community       → Realm created on Solana, council + community mints deployed
Member joins via invite link      → Privy creates embedded Solana wallet, community token minted
Member deposits $50 via Stripe    → Bridge converts to USDC → SPL token transfer to Realm treasury
Anyone creates a proposal         → SPL Governance proposal + off-chain discussion thread
Members discuss in thread         → AI agent summarizes, temperature checks gauge sentiment
Members vote Yes/No/Abstain       → CastVote instruction via embedded wallet (invisible)
Proposal passes quorum            → ExecuteTransaction triggers USDC transfer from treasury
Member wants cash out             → USDC → Bridge → bank account
```

### 6.6 Data Model

**Onchain (SPL Governance — source of truth for governance):**
```
Realm Account           → community identity, mints, config
Governance Account      → treasury PDA, voting config (quorum, period)
Proposal Account        → status, vote tally, embedded instructions
VoteRecord Account      → per-member vote on each proposal
TokenOwnerRecord        → member's deposited governance weight
Native Treasury (PDA)   → holds USDC
```

**Off-chain (Postgres — rich UX data not suited for onchain):**
```
communities
  ├── id, name, description, avatar_url, settings_json
  ├── realm_pubkey (links to onchain Realm)
  ├── governance_pubkey (links to primary governance)
  └── created_by

members
  ├── id, community_id, user_id, role (archmage | councilor | citizen)
  ├── privy_wallet_address, token_owner_record_pubkey
  └── contribution_total_usd

proposals
  ├── id, community_id, author_id
  ├── title, body (rich text), type (funding | policy | election | general)
  ├── proposal_pubkey (links to onchain Proposal)
  ├── funding_amount_usd, recipient_wallet
  ├── status (draft | discussion | voting | passed | failed | executed)
  ├── ai_summary (updated periodically)
  └── voting_start, voting_end

comments
  ├── id, proposal_id, author_id, parent_id (threading)
  ├── body, reactions_json
  └── created_at

transactions
  ├── id, community_id, proposal_id (nullable)
  ├── type (deposit | withdrawal | execution)
  ├── amount_usd, solana_tx_signature
  └── timestamp
```

---

## 7. AI Agent Specification

The AI agent is a differentiator — no existing Realms tool or DAO platform has this. Built with Vercel AI SDK + Claude API.

### 7.1 Agent Capabilities

| Capability | Trigger | Output |
|---|---|---|
| Discussion summary | New comments on a proposal | Updated 2–3 sentence summary pinned to top of thread |
| Argument extraction | 5+ comments on a proposal | "Arguments FOR" and "Arguments AGAINST" cards |
| Voter nudge | 24hrs before voting deadline, quorum not met | Push notification / email: "3 proposals need your vote" |
| Spending anomaly flag | Proposal requests > 20% of treasury | Warning banner: "This proposal requests a significant portion of the war chest" |
| Proposal drafting assist | Member starts a new proposal | Suggested structure, auto-fill from templates |
| Recurring payment automation | Approved recurring proposal | Auto-execute on schedule, notify community |
| Onboarding assistant | New member joins | Welcome message, guide to first contribution and vote |

### 7.2 Agent Guardrails

- Agent can NEVER execute transactions without a passed vote
- Agent summaries are clearly labeled as AI-generated
- Members can flag inaccurate summaries
- Agent does not vote or express opinions on proposals
- All agent actions are logged and auditable

---

## 8. Building with Claude Code

This section provides specific implementation guidance for building Dalaran using Claude Code as the primary development tool.

### 8.1 Project Initialization

```bash
# Bootstrap the project
claude "Initialize a Next.js 15 app with TypeScript, Tailwind CSS,
and the app router. Set up the following directory structure:
  /app — pages and API routes
  /components/ui/warcraftcn — warcraftcn components
  /components — shared custom components
  /lib — utilities, constants, types
  /lib/realms — SPL Governance SDK wrappers
  /lib/privy — Privy auth + wallet config
  /lib/ai — Vercel AI SDK agent configuration
  /lib/db — Postgres schema and queries (Drizzle ORM)
  /hooks — custom React hooks
Use pnpm as the package manager.

Install warcraftcn components:
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/card.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/button.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/input.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/badge.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/dropdown-menu.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/skeleton.json"
```

### 8.2 Hackathon Build Phases (13 days remaining)

Given the Feb 27 deadline, the build is compressed into 4 focused sprints. The priority is a working demo that hits all four pillars: pool, discuss, decide, act.

**Phase 1: Foundation + Realms (Days 1–3, Feb 14–16)**

Sprint goal: User can create a community (Realm on Solana), invite members, and everyone has an invisible embedded wallet with a governance token.

```bash
# Auth + wallet setup
claude "Integrate Privy SDK for authentication on Solana. Configure:
- Email and SMS login (no wallet connection option visible)
- Embedded SOLANA wallet creation on signup (hidden from user)
- Session management with Privy tokens
- Solana devnet configuration (switch to mainnet for launch)
Reference Privy docs: https://docs.privy.io
Create: /lib/privy/config.ts, /components/auth/LoginModal.tsx,
/app/api/auth/route.ts"

# Realm creation
claude "Build the community creation flow using SPL Governance SDK:
- Form (warcraftcn card + input components): name, description, avatar
- Settings: quorum % (default 51%), voting period (default 72hrs),
  who can create proposals (anyone | councilors | archmages)
- On creation:
  1. Create community mint (SPL Token) — 1 token per member
  2. Create council mint (SPL Token) — distributed to admins
  3. Call CreateRealm instruction via Privy server wallet
  4. Create Governance account with voting config
- Store community metadata in Postgres, link realm_pubkey
Install: @solana/spl-governance, @solana/spl-token, @solana/web3.js
Create: /lib/realms/create-realm.ts, /lib/realms/config.ts,
/app/create/page.tsx, /lib/db/schema.ts"

# Member join + token minting
claude "Build member invitation and onboarding:
- Generate shareable invite link with community ID
- Landing page: community name, member count, description
  (warcraftcn card with parchment texture)
- On join:
  1. Privy login → embedded Solana wallet created
  2. Mint 1 community token to member's wallet
  3. Deposit governing tokens (CreateTokenOwnerRecord +
     DepositGoverningTokens instructions)
  4. Member now has voting weight in the Realm
- Role assignment: default 'citizen', archmage can promote to 'councilor'
Create: /app/invite/[code]/page.tsx, /lib/realms/mint-token.ts,
/lib/realms/deposit-tokens.ts"
```

**Phase 2: Pool Funds — The War Chest (Days 4–6, Feb 17–19)**

Sprint goal: Members can deposit USD, see it as USDC in the Realm treasury, and view the treasury dashboard.

```bash
# Fiat onramp
claude "Implement fiat-to-USDC deposit flow:
- Stripe Checkout session for card/ACH payment
- Bridge API to convert USD → USDC on Solana
- SPL Token transfer of USDC to the Realm's native treasury PDA
- Record transaction in Postgres with Solana tx signature
- Display balance in USD (USDC is 1:1)
- Webhook handlers for payment confirmation
Create: /app/api/deposit/route.ts, /lib/payments/stripe.ts,
/lib/payments/bridge.ts, /components/treasury/DepositModal.tsx

NOTE FOR HACKATHON: If Bridge integration is too slow to set up,
use devnet USDC airdrop for demo purposes and mock the fiat flow.
The architecture supports real fiat — demo with test tokens."

# Treasury dashboard
claude "Build the war chest dashboard using warcraftcn components:
- Treasury Chest card: large balance display with gold accent,
  use warcraftcn Card component with custom header
- Recent transactions list (deposits, withdrawals, executions)
- Per-member contribution breakdown with warcraftcn Badge for roles
- Contribution chart over time (recharts with Warcraft color palette:
  golds #C9A959, parchment #E8D5B0, dark #1A1A2E)
- 'Add Gold' CTA button (warcraftcn Button)
All amounts displayed in USD. Zero crypto terminology.
Create: /app/[community]/treasury/page.tsx,
/components/treasury/WarChest.tsx,
/components/treasury/TransactionScroll.tsx"
```

**Phase 3: Discuss & Decide — The Council Chamber (Days 7–10, Feb 20–23)**

Sprint goal: Members can create proposals, discuss in threads, and vote. Passed proposals auto-execute USDC transfers.

```bash
# Proposal creation
claude "Build the proposal system with Realms integration:
- Proposal types: funding_request, policy_change, election, general
- Funding requests: amount (USD), recipient (member email or name),
  description, optional milestones
- On submit:
  1. Store metadata in Postgres (title, body, type, amount)
  2. Create SPL Governance proposal via CreateProposal instruction
  3. For funding proposals: InsertTransaction with SPL Token transfer
     instruction (USDC from native treasury to recipient)
  4. SignOffProposal to move to voting state
- Proposal card (warcraftcn Card): title, author badge, status badge,
  funding amount, vote progress bar, time remaining
- Status badges (warcraftcn Badge): Draft, Discussing, Voting,
  Passed, Failed, Executed
Create: /lib/realms/create-proposal.ts,
/lib/realms/insert-transaction.ts,
/app/[community]/proposals/new/page.tsx,
/components/proposals/ProposalCard.tsx"

# Discussion threads
claude "Build threaded discussion below each proposal:
- Comments with threading (parent_id for replies)
- Reactions on comments (⚔️ 🛡️ 🤔 ❤️ stored as jsonb)
- Real-time updates via polling (WebSocket is P2)
- Temperature check polls (quick non-binding 👍/👎)
- @mention autocomplete for community members
- Comment count and participant count on proposal card
Discussion is displayed BELOW the proposal details on the
same page inside a warcraftcn Card — the parchment scroll
that contains the full council debate.
Create: /components/discussion/CouncilThread.tsx,
/components/discussion/CommentInput.tsx,
/components/discussion/TempCheck.tsx,
/app/api/comments/route.ts"

# Voting
claude "Build the voting system backed by SPL Governance:
- Vote UI: three warcraftcn Buttons — Yes (gold), No (red), Abstain (grey)
- On vote:
  1. CastVote instruction via Privy embedded wallet (invisible to user)
  2. Record vote in Postgres for fast UI reads
  3. Update real-time tally display
- Configurable quorum (min participation %) and approval threshold
- Voting period with countdown timer (warcraftcn styled)
- One vote per member, can change before deadline
- Results displayed in animated progress bars when voting closes
- Email notification when voting opens and 24hrs before close
Create: /components/proposals/VotePanel.tsx,
/lib/realms/cast-vote.ts, /app/api/vote/route.ts"

# Auto-execution
claude "Implement proposal execution via Realms:
- When voting period ends and proposal passed:
  1. Call FinalizeVote instruction to compute onchain tally
  2. If passed: call ExecuteTransaction instruction
  3. This triggers the embedded SPL Token transfer (USDC from
     treasury to recipient)
  4. Record Solana tx signature in Postgres
  5. Update proposal status to 'executed'
  6. Notify community: 'Proposal X passed — $Y sent to Z'
- Run as server-side cron or triggered by voting period end
- For non-funding proposals: FinalizeVote → mark as passed → notify
Create: /lib/realms/finalize-vote.ts,
/lib/realms/execute-transaction.ts,
/app/api/cron/execute/route.ts"
```

**Phase 4: AI Agent + Polish (Days 11–13, Feb 24–27)**

Sprint goal: AI summaries work, the demo flows smoothly, and the 3-minute video is recorded.

```bash
# AI agent
claude "Set up the AI agent using Vercel AI SDK with Claude:
- /lib/ai/agent.ts — core agent configuration
- System prompt: 'You are the Keeper of Dalaran, a governance
  assistant for a community treasury. You summarize council
  discussions neutrally, never take sides, and help citizens
  make informed decisions.'
- Tools:
  - summarize_discussion(proposal_id) → neutral summary
  - extract_arguments(proposal_id) → for/against cards
  - get_treasury_stats(community_id) → balance, burn rate
- Discussion summaries: debounced, regenerated on new comments,
  pinned at top of thread in a distinct warcraftcn Card
- Labeled: 'Keeper's Summary — last updated X minutes ago'
Create: /lib/ai/agent.ts, /lib/ai/tools.ts,
/components/discussion/KeeperSummary.tsx,
/app/api/ai/summarize/route.ts"

# Polish for demo
claude "Final polish pass:
- Landing page with Dalaran branding + warcraftcn aesthetic
- Community dashboard: treasury, active proposals, recent activity
- Mobile-responsive layout (bottom nav: Treasury, Proposals, Members)
- Empty states with thematic illustrations
- Loading skeletons (warcraftcn Skeleton component)
- Error handling with friendly messages
- Demo seed data: pre-populated community with 3–4 proposals
  in different states (discussing, voting, passed, executed)"

# Demo video (record separately)
# Script:
# 0:00 — "DAOs were left for dead. Dalaran resurrects them."
# 0:15 — Create a community (show Realm creation, invisible to user)
# 0:30 — Invite members (email link, no wallet required)
# 0:45 — Deposit funds (Stripe → USDC → treasury, all invisible)
# 1:15 — Create a proposal (funding request with discussion)
# 1:45 — Council discusses (threaded comments, AI summary)
# 2:15 — Members vote (tap Yes, invisible Solana tx)
# 2:30 — Proposal passes, auto-executes (USDC sent)
# 2:45 — "Built on Realms. Powered by Solana. Usable by everyone."
```

### 8.3 Claude Code Workflow Tips

**Session management:** Start each session with full context:
```bash
claude "Read the PRD at /docs/PRD.md and the Solana AI dev skill at
https://solana.com/SKILL.md. We are working on Phase [X]. Today's
goal is [specific task]. Review current codebase and continue."
```

**Realms-specific debugging:**
```bash
claude "The CreateProposal instruction is failing. Debug by:
1. Check that the token owner record exists for the proposer
2. Verify governing token deposit amount > 0
3. Confirm the governance account pubkey is correct
4. Log the full instruction and accounts array
Reference: https://docs.realms.today/spl-governance"
```

**Testing strategy:**
```bash
claude "Write tests for the Realms integration:
- Unit tests for PDA derivation (governance, native treasury, proposal)
- Integration test on devnet: create realm → mint token → deposit →
  create proposal → cast vote → finalize → execute
- Mock Privy wallet signing for unit tests
Use Vitest. Use @solana/web3.js Connection to devnet for integration."
```

### 8.4 Environment Variables

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Stripe + Bridge
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
BRIDGE_API_KEY=

# Database
DATABASE_URL=

# AI
ANTHROPIC_API_KEY=

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=       # Helius or Quicknode
NEXT_PUBLIC_SOLANA_NETWORK=devnet # Switch to mainnet for launch
SPL_GOVERNANCE_PROGRAM_ID=GovER5Lthms3bLBqWub97yVRs6jmSt4LKkRAJuUFVq4e

# Notifications
RESEND_API_KEY=
```

---

## 9. Competitive Landscape

| Product | Pool Funds | Discuss | Decide | Execute | Non-Web3 UX | 250-1K Scale | Solana |
|---|---|---|---|---|---|---|---|
| **Realms UI** | ✅ (crypto) | ❌ | ✅ | ✅ | ❌ | ⚠️ | ✅ |
| **Squads** | ✅ (crypto) | ❌ | ✅ (multisig) | ✅ | ❌ | ❌ | ✅ |
| **Snapshot + Safe** | ✅ (crypto) | ❌ | ✅ | ✅ | ❌ | ⚠️ | ❌ (EVM) |
| **Aragon** | ✅ (crypto) | ❌ | ✅ | ✅ | ❌ | ⚠️ | ❌ (EVM) |
| **Braid** | ✅ (fiat) | ⚠️ (basic) | ❌ | ❌ | ✅ | ⚠️ | ❌ (shut down) |
| **Collctiv** | ✅ (fiat) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **GoFundMe** | ✅ (fiat) | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Dalaran** | ✅ (fiat+crypto) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Dalaran is the only product that combines all four pillars with a non-web3 experience on Solana. It's Realms made human.

---

## 10. Key Differentiators

**Zero crypto UX** — Email login, dollar amounts, no gas, no tokens, no wallets visible. Your grandmother can use it. The Solana transaction is as invisible as a Stripe charge.

**Onchain transparency via Realms** — Every proposal, vote, and treasury action lives on Solana via SPL Governance. Auditable by anyone. No single person controls the treasury. Battle-tested infrastructure.

**AI governance agent (The Keeper)** — Summarizes council discussions, flags unusual spending, nudges voters before deadlines. No DAO tool — on Solana or anywhere — has this.

**Distinctive UI** — warcraftcn components create a memorable "council chamber" aesthetic. Not another dashboard. Not another crypto app. Something people actually want to use and show to others.

**250–1,000 sweet spot** — Purpose-built for mid-size communities. Too big for Venmo. Too small for Realms UI. Dalaran owns this niche.

**Discussion + Governance unified** — Proposals aren't just votes — they're living council debates. The thread is the proposal lifecycle.

---

## 11. Metrics & Success Criteria

### Hackathon Success Criteria
- Working demo on Solana devnet with full proposal lifecycle
- At least one real community onboarded for demo
- 3-minute video that clearly shows all four pillars
- Clean GitHub repo with README

### Post-Hackathon North Star
**Monthly Active Realms (MAR):** Communities with ≥ 1 deposit and ≥ 1 passed proposal in the trailing 30 days.

### Key Metrics (6 months post-launch)

| Metric | Target |
|---|---|
| Communities created | 500 |
| Monthly Active Realms | 200 |
| Total funds pooled | $2M+ |
| Avg proposals per community per month | 3+ |
| Voter participation rate | > 40% |
| Member retention (90-day) | > 60% |

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Regulatory (money transmission) | High | Stripe + Bridge handle regulated layer. Dalaran never touches funds directly. Legal counsel pre-launch. |
| SPL Governance complexity | Medium | Abstract all Solana interactions behind `/lib/realms`. Users never see instructions, PDAs, or signatures. |
| Realms SDK documentation gaps | Medium | Reference Mythic Project source code directly. Use governance-idl-sdk for type safety. |
| Low voter participation | Medium | AI nudges, mobile-friendly voting, email digests, temperature checks to lower barrier |
| Crypto stigma | Medium | Zero crypto terminology. Position as "community governance app." Warcraft aesthetic signals "fun," not "finance." |
| Hackathon timeline (13 days) | High | Aggressive scoping. Mock fiat flow if Bridge is slow. Focus on proposal lifecycle as hero demo. |
| Privy Solana wallet limitations | Low | Privy has full Solana support. Test early on Day 1. |

---

## 13. Open Questions

- **Legal entity:** Should each Dalaran community have an optional legal wrapper (LLC)? Partner with Otoco for onchain entity creation?
- **Revenue model:** Transaction fee on deposits/withdrawals? Premium tier for AI features and larger communities? Free for hackathon.
- **Token strategy:** Community tokens are governance-only in v1 (non-transferable, 1 per member). Revisit transferable tokens and weighted voting in v2.
- **Yield:** Should idle USDC in the treasury earn yield? Natural integration point with DeFi on Solana. Regulatory complexity. Potential Tidal integration.
- **Cross-community identity:** Should members carry reputation across Dalaran communities? Network effects vs. privacy.
- **Plugin system:** Realms supports voter weight plugins (VSR, NFT voting, quadratic). Expose these as advanced settings for power users in v2.
- **Hackathon scope:** Is the fiat on/offramp achievable in 13 days, or should we demo with devnet USDC and mock the Stripe flow?

---

## 14. Timeline

### Hackathon Sprint (Feb 14–27)

| Phase | Days | Dates | Deliverable |
|---|---|---|---|
| Phase 1: Foundation + Realms | 3 | Feb 14–16 | Auth, wallets, Realm creation, member join, token minting |
| Phase 2: War Chest | 3 | Feb 17–19 | Deposit flow, treasury dashboard, balance display |
| Phase 3: Council Chamber | 4 | Feb 20–23 | Proposals, discussion threads, voting, auto-execution |
| Phase 4: AI + Polish | 4 | Feb 24–27 | Keeper summaries, demo flow, video, submission |

### Post-Hackathon

| Phase | Duration | Deliverable |
|---|---|---|
| Mainnet migration | Week 1–2 | Switch from devnet to mainnet, real USDC |
| Fiat integration | Week 3–4 | Stripe + Bridge production onramp/offramp |
| Mobile optimization | Week 5–6 | PWA polish, push notifications |
| Private beta | Week 7–8 | 10 communities, invite-only |
| Public launch | Week 10–12 | Open signup |

---

*DALARAN — Pool · Discuss · Decide · Act*

*Destroyed and risen. The Council awaits.*
