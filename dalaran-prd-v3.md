# DALARAN — Product Requirements Document

**Version:** 0.3  
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
- **$1,500 — Realms Extensions:** Dalaran extends Realms with threaded discussion and AI-powered governance summaries
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

**Long-term vision — dual mode:** Dalaran is one product with two governance modes. "Simple mode" uses lightweight Postgres-backed governance for casual communities (book clubs, trip funds). "Onchain mode" uses full Realms/SPL Governance for communities that need verifiable, trustless governance (investment clubs, mutual aid managing real money). Both share the same UI, discussion engine, and AI layer. Communities default to simple and can upgrade to onchain as their treasury grows and trust requirements increase. The hackathon ships onchain mode first. Simple mode is a v2 subtraction (remove Realms, replace with Postgres queries behind the same GovernanceProvider interface).

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

## 4. Scope Definition

### 4.1 What's IN for hackathon (must ship by Feb 27)

These are the non-negotiable deliverables for the demo and submission:

- **Privy auth** with embedded Solana wallets (email login, invisible wallet)
- **Realm creation** on Solana devnet (community = Realm with council + community mints)
- **Member join** via invite link (auto-mint governance token, deposit to Realm)
- **Treasury view** showing USDC balance in the Realm native treasury (devnet USDC airdropped for demo — no fiat integration)
- **Proposal creation** via SPL Governance (CreateProposal + InsertTransaction for funding proposals)
- **Discussion threads** on each proposal (Postgres-backed, threaded comments, reactions)
- **Voting** via SPL Governance CastVote instruction (invisible Solana tx behind Yes/No/Abstain buttons)
- **Vote results** displayed with progress bars and pass/fail status after FinalizeVote
- **AI Keeper summaries** on discussion threads (Vercel AI SDK + Claude)
- **warcraftcn UI** throughout (Card, Button, Input, Badge, Dropdown, Skeleton)
- **Demo seed data** with proposals in different lifecycle stages
- **3-minute video** and clean GitHub repo

### 4.2 What's OUT for hackathon (explicitly cut)

These are real features in the product vision but would risk the submission deadline:

| Cut Feature | Why | When |
|---|---|---|
| Fiat on/offramp (Stripe + Bridge) | Complex integration, not what Realms judges care about | v2 — post-hackathon Week 3–4 |
| Auto-execution of passed proposals | ExecuteTransaction adds complexity; show "passed, ready to execute" with manual trigger button instead | v2 — post-hackathon Week 1–2 |
| Recurring contributions | Nice-to-have, not demo-critical | v2 |
| Pool links (shareable contribution URLs) | Requires payment flow which is cut | v2 |
| Sub-treasuries (multiple governance accounts) | Adds Realms complexity for marginal demo value | v2 |
| Vote privacy / anonymous voting | Requires additional architecture | v2 |
| Delegation | SPL Governance supports this but adds onboarding complexity | v2 |
| Proposal templates | UI sugar, not structural | v2 |
| Email/push notifications | Requires Resend setup, not demo-critical | v2 |
| AI voter nudges (cron-based) | Need notifications working first | v2 |
| Spending anomaly flagging | Requires treasury history | v2 |
| Temperature checks | Nice discussion feature, not core governance | v2 |
| @mention autocomplete | UI polish | v2 |
| Rich text editor (tiptap) | Plain text + markdown is fine for hackathon | v2 |
| Mobile PWA optimization | Desktop demo is fine for judges | v2 |
| Simple mode (Postgres governance) | Dual-mode architecture is post-hackathon | v2 |

### 4.3 Fallback plan

If SPL Governance CastVote integration becomes a wall (PDA derivation issues, SDK bugs, devnet instability):

**Fallback:** Postgres-backed voting with the same UI. Votes stored in database, displayed identically. Note in README and video: "Production version executes votes onchain via SPL Governance. Demo uses off-chain voting with the same UX." This is an acceptable fallback — a working demo with clear architecture beats a broken onchain integration. Try Realms first. Fall back if blocked by Day 8.

---

## 5. Core Requirements

These map directly to the four capabilities identified in the original signal: **pool funds**, **discuss**, **make decisions**, and **engage in collective action**.

### 5.1 Pool Funds (The War Chest)

**What users see:** Treasury balance in a stylized war chest card. For the hackathon, funded via devnet USDC airdrop.

| Requirement | Details | Hackathon | v2 |
|---|---|---|---|
| Stablecoin treasury | USDC held in Realms native treasury PDA | ✅ | |
| Treasury dashboard | Balance, contribution history, spending log | ✅ | |
| Contribution tracking | Per-member contribution totals | ✅ | |
| Fiat onramp | Deposit USD via Stripe + Bridge → USDC | ❌ | ✅ |
| Fiat offramp | Withdraw USDC → USD to bank | ❌ | ✅ |
| Recurring contributions | Auto-deposits (weekly/monthly) | ❌ | ✅ |
| Pool links | Shareable URL for anyone to contribute | ❌ | ✅ |
| Sub-treasuries | Multiple governance accounts per Realm | ❌ | ✅ |

**Hackathon approach:** Airdrop devnet USDC to the Realm treasury and member wallets. Treasury dashboard reads real onchain balance via `getTokenAccountBalance`. The architecture supports fiat — it's a deposit flow change, not a structural change.

### 5.2 Discuss (The Council Chamber)

**What users see:** A parchment-styled discussion thread under every proposal.

| Requirement | Details | Hackathon | v2 |
|---|---|---|---|
| Proposal threads | Dedicated discussion per proposal | ✅ | |
| Threaded replies | Reply to specific comments | ✅ | |
| Reactions | Sentiment signaling (⚔️ 🛡️ 🤔 ❤️) | ✅ | |
| AI discussion summary | Auto-generated Keeper summary | ✅ | |
| Temperature checks | Informal pre-vote polls | ❌ | ✅ |
| Mention/notify | @mention members | ❌ | ✅ |
| Rich text + links | Tiptap editor, link previews | ❌ | ✅ |
| General discussion board | Non-proposal discussions | ❌ | ✅ |

**Key design principle:** Discussion and voting live on the same page. The thread IS the proposal lifecycle: Draft → Discuss → Vote → Result. One view, one scroll.

### 5.3 Make Decisions (The Vote)

**What users see:** Three buttons — Yes, No, Abstain — with a live tally and countdown.

| Requirement | Details | Hackathon | v2 |
|---|---|---|---|
| Proposal creation | Any member can create a proposal | ✅ | |
| Proposal types | Funding request, policy change, general | ✅ | |
| Voting (Yes/No/Abstain) | Via SPL Governance CastVote | ✅ | |
| Quorum settings | Configurable min participation % | ✅ | |
| Voting period | Configurable duration | ✅ | |
| Vote results | Progress bars + pass/fail after FinalizeVote | ✅ | |
| Vote privacy | Anonymous voting option | ❌ | ✅ |
| Delegation | Delegate voting power to councilors | ❌ | ✅ |
| Proposal templates | Pre-built templates | ❌ | ✅ |
| Voter notifications | Email/push for new proposals, deadlines | ❌ | ✅ |
| AI voter nudges | Agent reminder before deadline | ❌ | ✅ |

**Realms integration:** Each vote is a `CastVote` instruction submitted through the user's Privy embedded wallet. The user taps a button — the Solana transaction is invisible.

### 5.4 Engage in Collective Action (Execute Orders)

**What users see:** "Proposal passed" with a manual "Execute" button for hackathon. Auto-execution in v2.

| Requirement | Details | Hackathon | v2 |
|---|---|---|---|
| Manual execution | Admin clicks "Execute" after proposal passes | ✅ | |
| Execution log | Tx signature displayed, links to Solana explorer | ✅ | |
| Auto-execution | Server-side cron triggers ExecuteTransaction | ❌ | ✅ |
| Multi-recipient payouts | Single proposal, multiple recipients | ❌ | ✅ |
| Recurring payments | Approved recurring disbursements | ❌ | ✅ |
| Milestone-based release | Funds released in tranches | ❌ | ✅ |
| External integrations | Trigger Notion, Discord, email on pass | ❌ | ✅ |
| Spending limits | Per-transaction or per-period caps | ❌ | ✅ |

**Hackathon approach:** After FinalizeVote confirms a proposal passed, display a "Execute Order" button (warcraftcn Button, gold). On click, call `ExecuteTransaction` via Privy server wallet. Show the Solana tx signature and link to explorer. This proves the full lifecycle without the complexity of cron-based automation.

---

## 6. Non-Functional Requirements

### 6.1 Usability (The Whole Point)

- **Zero crypto knowledge required.** No wallet addresses, gas fees, token symbols, or blockchain terminology anywhere in the UI. Dollar amounts only.
- **Sign up in < 30 seconds.** Email or phone number → verify → you're in.
- **Distinctive UI.** warcraftcn components create a memorable "council chamber" aesthetic.
- **Desktop-first for hackathon.** Mobile PWA optimization is v2.
- **Accessibility.** WCAG 2.1 AA compliance (best-effort for hackathon, full compliance v2).

### 6.2 Security & Trust

- Privy embedded wallets secured by TEEs with passkey support
- Realms SPL Governance handles onchain authority — no single key controls the treasury
- Council (admin) + community (member) dual-population model via Realms
- All treasury transactions verifiable on Solana explorer (for those who want to check)

### 6.3 Performance

- Page load < 2s
- Vote submission < 1s (Solana finality ~400ms)
- Discussion updates via polling (WebSocket is v2)

---

## 7. System Architecture

### 7.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                       USER LAYER                              │
│           "The citizen sees a council chamber, not a chain"   │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │  Next.js PWA  │  │  Privy Auth   │  │  Devnet USDC    │   │
│  │  warcraftcn   │  │  Email, SMS,  │  │  Airdrop        │   │
│  │  UI components│  │  Social Login │  │  (Stripe+Bridge  │   │
│  │               │  │               │  │   in v2)        │   │
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
│  │ configure     │  │  reactions    │  │   "The Keeper"  │   │
│  │ governance    │  │  (Postgres)   │  │   Summarize,    │   │
│  └───────────────┘  └───────────────┘  │   flag          │   │
│                                         └─────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │          GovernanceProvider Interface                    │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐     │   │
│  │  │ RealmsGovernance│  │ SimpleGovernance (v2)     │     │   │
│  │  │ (hackathon)     │  │ Postgres-backed fallback  │     │   │
│  │  │ SPL Governance  │  │ for casual communities    │     │   │
│  │  └─────────────────┘  └──────────────────────────┘     │   │
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
│  │                    Solana (Devnet → Mainnet)             │   │
│  │          ~400ms finality · ~$0.0001 per tx              │   │
│  │          USDC (SPL Token) · No gas sponsorship needed   │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 GovernanceProvider Interface

The abstraction layer that enables dual-mode (Realms vs Simple) in v2. For the hackathon, only `RealmsGovernance` is implemented. The interface is defined on Day 1 as architectural insurance.

```typescript
interface GovernanceProvider {
  // Community lifecycle
  createCommunity(config: CommunityConfig): Promise<CommunityId>;
  addMember(communityId: string, walletAddress: string): Promise<MemberRecord>;
  removeMember(communityId: string, memberId: string): Promise<void>;

  // Proposals
  createProposal(communityId: string, proposal: ProposalInput): Promise<ProposalId>;
  getProposal(proposalId: string): Promise<ProposalState>;
  listProposals(communityId: string, filters?: ProposalFilters): Promise<ProposalState[]>;

  // Voting
  castVote(proposalId: string, memberId: string, vote: Vote): Promise<VoteRecord>;
  finalizeVote(proposalId: string): Promise<VoteResult>;

  // Execution
  executeProposal(proposalId: string): Promise<ExecutionResult>;

  // Treasury
  getTreasuryBalance(communityId: string): Promise<TreasuryBalance>;
  getTreasuryHistory(communityId: string): Promise<Transaction[]>;
}

// Hackathon: implements via SPL Governance SDK
class RealmsGovernance implements GovernanceProvider { ... }

// v2: implements via Postgres queries
class SimpleGovernance implements GovernanceProvider { ... }
```

### 7.3 Realms / SPL Governance Integration

SPL Governance provides the onchain backbone. Here's how Dalaran maps to the Realms account hierarchy:

| Realms Concept | Dalaran Concept | Description |
|---|---|---|
| Realm | Community | Top-level entity. One Dalaran community = one Realm. Created with community mint + optional council mint. |
| Council Population | Admins / Archmages | Small group (3–7) with elevated permissions. Council tokens distributed to admins. |
| Community Population | Members / Citizens | All members. Community tokens minted on join. 1 member = 1 token = 1 vote. |
| Governance | Treasury Config | Configuration for voting rules — quorum %, voting period, proposal thresholds. |
| Native Treasury | War Chest | PDA-derived wallet owned by the governance. Holds USDC. Only accessible via passed proposals. |
| Proposal | Proposal | Title, description link, and embedded Solana instructions to execute on pass. |
| ProposalTransaction | Funding Action | Embedded SPL Token transfer: move X USDC from native treasury to recipient. |
| VoteRecord | Vote | One per member per proposal. Yes / No / Abstain. |

**Governance instruction sequence (hackathon scope):**
```
1. CreateRealm              → Community created, mints deployed
2. DepositGoverningTokens   → Member activates voting weight
3. CreateProposal           → Proposal submitted (metadata in Postgres)
4. InsertTransaction        → Embed USDC transfer instruction
5. SignOffProposal          → Moves to voting state
6. CastVote                 → Members vote (invisible Solana tx)
7. FinalizeVote             → Tally computed onchain
8. ExecuteTransaction       → Manual trigger via "Execute" button (auto in v2)
```

### 7.4 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS | Fast iteration, SSR, existing expertise |
| UI Components | warcraftcn/ui (shadcn-compatible) | Warcraft III aesthetic. Install: `pnpm dlx shadcn@latest add https://warcraftcn.com/r/[component].json` |
| Auth & Wallets | Privy SDK, Embedded Solana Wallets | Email/social login, invisible wallet creation |
| Chain | Solana Devnet (hackathon), Mainnet (v2) | Sub-second finality, near-zero fees |
| Governance | SPL Governance (Realms) | Battle-tested onchain governance |
| Stablecoin | USDC (SPL Token) | Most trusted, deep Solana liquidity |
| Payments | Devnet USDC airdrop (hackathon), Stripe + Bridge (v2) | Real fiat is v2 |
| Backend | Vercel Serverless Functions, Postgres (Neon) | Serverless scale, familiar stack |
| AI Agent | Vercel AI SDK, Claude API | Discussion summaries |
| Off-chain Storage | Postgres (Neon) | Discussions, comments, AI summaries, user profiles |

### 7.5 warcraftcn UI Component Mapping

| Component | Dalaran Usage |
|---|---|
| Card | Proposal cards, treasury balance (war chest), member cards, Keeper summary |
| Button | Vote buttons (Yes/No/Abstain), deposit CTA, create proposal, execute order |
| Input | Proposal form fields, deposit amount, search |
| Badge | Proposal status (Voting, Passed, Failed, Executed), member roles (Archmage, Councilor, Citizen) |
| Dropdown Menu | Proposal type selector, member actions, settings |
| Skeleton | Loading states for proposals, treasury, discussions |

### 7.6 Data Model

**Onchain (SPL Governance — source of truth for governance):**
```
Realm Account           → community identity, mints, config
Governance Account      → treasury PDA, voting config
Proposal Account        → status, vote tally, embedded instructions
VoteRecord Account      → per-member vote on each proposal
TokenOwnerRecord        → member's deposited governance weight
Native Treasury (PDA)   → holds USDC
```

**Off-chain (Postgres — UX data):**
```
communities
  ├── id, name, description, avatar_url, settings_json
  ├── realm_pubkey, governance_pubkey
  └── created_by

members
  ├── id, community_id, user_id, role (archmage | councilor | citizen)
  ├── privy_wallet_address, token_owner_record_pubkey
  └── contribution_total_usd

proposals
  ├── id, community_id, author_id
  ├── title, body, type (funding | policy | general)
  ├── proposal_pubkey
  ├── funding_amount_usd, recipient_wallet
  ├── status (draft | discussion | voting | passed | failed | executed)
  ├── ai_summary
  └── voting_start, voting_end

comments
  ├── id, proposal_id, author_id, parent_id
  ├── body, reactions_json
  └── created_at

transactions
  ├── id, community_id, proposal_id
  ├── type (deposit | withdrawal | execution)
  ├── amount_usd, solana_tx_signature
  └── timestamp
```

---

## 8. AI Agent Specification (The Keeper)

### 8.1 Hackathon Scope

| Capability | Trigger | Output | Hackathon | v2 |
|---|---|---|---|---|
| Discussion summary | New comments posted | 2–3 sentence neutral summary pinned to thread | ✅ | |
| Argument extraction | 5+ comments on a proposal | "Arguments FOR" and "Arguments AGAINST" | ✅ | |
| Voter nudge | 24hrs before deadline, quorum unmet | Push/email reminder | ❌ | ✅ |
| Spending anomaly flag | Proposal > 20% of treasury | Warning banner | ❌ | ✅ |
| Proposal drafting assist | New proposal started | Suggested structure | ❌ | ✅ |
| Onboarding assistant | New member joins | Welcome message, first steps | ❌ | ✅ |

### 8.2 Agent Guardrails

- Agent can NEVER execute transactions without a passed vote
- Agent summaries clearly labeled as AI-generated ("Keeper's Summary")
- Members can flag inaccurate summaries
- Agent does not vote or express opinions on proposals
- All agent actions logged and auditable

---

## 9. Building with Claude Code

### 9.1 Project Initialization

```bash
claude "Initialize a Next.js 15 app with TypeScript, Tailwind CSS,
and the app router. Set up:
  /app — pages and API routes
  /components/ui/warcraftcn — warcraftcn components
  /components — shared custom components
  /lib/realms — SPL Governance SDK wrappers
  /lib/governance — GovernanceProvider interface + RealmsGovernance impl
  /lib/privy — auth + wallet config
  /lib/ai — Vercel AI SDK agent
  /lib/db — Postgres schema (Drizzle ORM)
  /hooks — custom React hooks
Use pnpm.

Install warcraftcn:
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/card.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/button.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/input.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/badge.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/dropdown-menu.json
  pnpm dlx shadcn@latest add https://warcraftcn.com/r/skeleton.json

Also read the Solana AI dev skill: https://solana.com/SKILL.md"
```

### 9.2 Hackathon Build Phases (13 days)

**Phase 1: Foundation + Realms (Days 1–3, Feb 14–16)**

Sprint goal: User can create a community (Realm on Solana devnet), invite members, everyone has an invisible embedded wallet with a governance token. GovernanceProvider interface defined.

```bash
# Define the governance abstraction FIRST
claude "Create /lib/governance/types.ts with the GovernanceProvider
interface (createCommunity, addMember, createProposal, castVote,
finalizeVote, executeProposal, getTreasuryBalance). Then create
/lib/governance/realms.ts implementing RealmsGovernance. This is
the only implementation for now — SimpleGovernance is v2."

# Auth + wallet setup
claude "Integrate Privy SDK for Solana. Configure:
- Email and SMS login (no wallet connection visible)
- Embedded SOLANA wallet creation on signup (hidden)
- Solana devnet configuration
Create: /lib/privy/config.ts, /components/auth/LoginModal.tsx"

# Realm creation
claude "Build community creation using GovernanceProvider:
- Form (warcraftcn Card + Input): name, description
- Settings: quorum % (default 51%), voting period (default 72hrs)
- Under the hood: RealmsGovernance.createCommunity() calls
  CreateRealm + creates Governance account
- Store metadata in Postgres, link realm_pubkey
Install: @solana/spl-governance, @solana/spl-token, @solana/web3.js
Create: /app/create/page.tsx, /lib/db/schema.ts"

# Member join + token minting
claude "Build member invitation:
- Shareable invite link with community ID
- On join: Privy login → mint 1 community token → deposit
  governing tokens → member has voting weight
- warcraftcn Card landing page with community info
Create: /app/invite/[code]/page.tsx"
```

**Phase 2: War Chest + Treasury View (Days 4–6, Feb 17–19)**

Sprint goal: Treasury dashboard shows real USDC balance from devnet. Members see their contributions.

```bash
# Fund treasury with devnet USDC
claude "Build treasury funding for hackathon demo:
- Script to airdrop devnet SOL + mint devnet USDC to member wallets
- UI button: 'Add Gold to War Chest' → triggers SPL Token transfer
  of devnet USDC from member wallet to Realm native treasury PDA
- Record deposit in Postgres with tx signature
Create: /scripts/airdrop-devnet.ts, /app/api/deposit/route.ts"

# Treasury dashboard
claude "Build the war chest dashboard:
- Treasury Chest card (warcraftcn Card): large USD balance,
  reads from getTokenAccountBalance on the native treasury PDA
- Recent transactions list
- Per-member contribution breakdown with role Badges
- Color palette: golds #C9A959, parchment #E8D5B0, dark #1A1A2E
- 'Add Gold' CTA (warcraftcn Button)
All amounts in USD. Zero crypto terminology.
Create: /app/[community]/treasury/page.tsx,
/components/treasury/WarChest.tsx"
```

**Phase 3: Council Chamber — Propose, Discuss, Vote (Days 7–10, Feb 20–23)**

Sprint goal: Full proposal lifecycle — create, discuss, vote, see result. This is the hero demo.

```bash
# Proposals
claude "Build proposals via GovernanceProvider:
- Types: funding_request, policy_change, general
- Funding: amount (USD), recipient, description
- RealmsGovernance.createProposal() calls CreateProposal,
  InsertTransaction (USDC transfer), SignOffProposal
- Proposal card (warcraftcn Card): title, author Badge,
  status Badge, amount, vote progress, countdown
Create: /app/[community]/proposals/new/page.tsx,
/components/proposals/ProposalCard.tsx"

# Discussion threads
claude "Build threaded discussion on proposal page:
- Comments with threading (parent_id)
- Reactions (⚔️ 🛡️ 🤔 ❤️ in jsonb)
- Polling for real-time updates
- Displayed BELOW proposal details, same page, one scroll
- warcraftcn Card as the parchment container
Create: /components/discussion/CouncilThread.tsx,
/components/discussion/CommentInput.tsx,
/app/api/comments/route.ts"

# Voting
claude "Build voting via GovernanceProvider:
- Three warcraftcn Buttons: Yes (gold), No (red), Abstain (grey)
- RealmsGovernance.castVote() → CastVote instruction via Privy
  embedded wallet (invisible to user)
- Mirror vote to Postgres for fast UI reads
- Quorum progress bar + approval threshold line
- Countdown timer styled in warcraftcn aesthetic
- One vote per member, changeable before deadline
Create: /components/proposals/VotePanel.tsx"

# Vote finalization + manual execution
claude "Build vote results and execution:
- After voting period: call FinalizeVote
- Display pass/fail with animated result
- If passed funding proposal: show 'Execute Order' button (gold)
- On click: RealmsGovernance.executeProposal() →
  ExecuteTransaction → USDC transfer from treasury
- Show Solana tx signature + explorer link
- Update status Badge to 'Executed'
Create: /components/proposals/ExecutePanel.tsx"
```

**Phase 4: The Keeper + Polish + Submit (Days 11–13, Feb 24–27)**

Sprint goal: AI summaries work, demo flows, video recorded, submitted.

```bash
# AI Keeper
claude "Set up the Keeper using Vercel AI SDK + Claude:
- System prompt: 'You are the Keeper of Dalaran, a governance
  assistant. Summarize discussions neutrally. Never take sides.'
- On new comments: debounced summary generation (max 1 per 5 min)
- Output: 2-3 sentence summary + arguments for/against
- Display: pinned warcraftcn Card at top of thread
- Labeled: 'Keeper's Summary — updated X min ago'
Create: /lib/ai/keeper.ts, /components/discussion/KeeperSummary.tsx,
/app/api/ai/summarize/route.ts"

# Polish
claude "Final pass:
- Landing page with Dalaran branding + warcraftcn aesthetic
- Community dashboard: treasury, active proposals, recent activity
- Loading skeletons on all data-fetching views
- Error handling with friendly messages
- Demo seed data: 4 proposals (draft, voting, passed, executed)
- README with screenshots, architecture overview, setup instructions"
```

**Demo Video Script (3 minutes):**
```
0:00 — "DAOs were left for dead. Dalaran resurrects them."
       Show graveyard → Dalaran rising
0:15 — Create a community with email login
       Show: no wallet, no crypto, just a name and email
0:30 — Invite members via link, they join in seconds
       Show: member lands on warcraftcn-styled invite page, clicks join
0:50 — View the war chest — treasury funded with USDC
       Show: gold-styled balance card, member contributions
1:10 — Create a funding proposal — "$500 for community event"
       Show: proposal form, submit, status changes to "Voting"
1:30 — Council discusses — threaded comments appear
       Show: members debating, reactions, Keeper summary auto-generates
2:00 — Members vote — tap Yes, invisible Solana transaction
       Show: vote buttons, progress bar filling, quorum reached
2:20 — Proposal passes — execute the order
       Show: "Execute Order" button, USDC transfers, Solana explorer link
2:40 — "Built on Realms. Powered by Solana. Usable by everyone."
       Show: architecture diagram, tech stack, future vision
```

### 9.3 Claude Code Workflow Tips

**Start each session:**
```bash
claude "Read /docs/PRD.md and the Solana dev skill at
https://solana.com/SKILL.md. We're on Phase [X], Day [Y].
Goal: [specific task]. Review codebase and continue."
```

**Realms debugging:**
```bash
claude "CreateProposal is failing. Check:
1. TokenOwnerRecord exists for proposer
2. Governing token deposit > 0
3. Governance pubkey is correct PDA
4. Log full instruction accounts array
Ref: https://docs.realms.today/spl-governance"
```

**Day 8 fallback check:**
```bash
claude "Assess: is CastVote working reliably on devnet?
If yes: continue with Realms. If no: implement SimpleGovernance
as Postgres fallback. Same UI, same GovernanceProvider interface,
votes stored in DB instead of onchain. Note in README."
```

### 9.4 Environment Variables

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Database
DATABASE_URL=

# AI
ANTHROPIC_API_KEY=

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=       # Helius or Quicknode devnet
NEXT_PUBLIC_SOLANA_NETWORK=devnet
SPL_GOVERNANCE_PROGRAM_ID=GovER5Lthms3bLBqWub97yVRs6jmSt4LKkRAJuUFVq4e

# v2 (not needed for hackathon)
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# BRIDGE_API_KEY=
# RESEND_API_KEY=
```

---

## 10. Competitive Landscape

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

## 11. Key Differentiators

**Zero crypto UX** — Email login, dollar amounts, no gas, no tokens, no wallets visible. The Solana transaction is as invisible as a Stripe charge.

**Onchain transparency via Realms** — Every proposal, vote, and treasury action lives on Solana via SPL Governance. Auditable by anyone. No single person controls the treasury.

**AI governance agent (The Keeper)** — Summarizes council discussions, extracts key arguments for and against. No DAO tool — on Solana or anywhere — has this.

**Distinctive UI** — warcraftcn components create a memorable "council chamber" aesthetic. Not another dashboard. Not another crypto app.

**250–1,000 sweet spot** — Purpose-built for mid-size communities. Too big for Venmo. Too small for Realms UI. Dalaran owns this niche.

**Discussion + Governance unified** — Proposals aren't just votes — they're living council debates. The thread is the proposal lifecycle.

---

## 12. Metrics & Success Criteria

### Hackathon Success (Feb 27)
- Working demo on Solana devnet with full proposal lifecycle (create → discuss → vote → execute)
- AI Keeper generating discussion summaries
- warcraftcn aesthetic throughout
- 3-minute video clearly showing all four pillars
- Clean GitHub repo with README and architecture docs

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

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| SPL Governance complexity | High | GovernanceProvider interface allows fallback to Postgres. Try Realms first, fall back by Day 8 if blocked. |
| Realms SDK documentation gaps | Medium | Reference Mythic Project source code directly. Use governance-idl-sdk for type safety. |
| Hackathon timeline (13 days) | High | Scope is trimmed aggressively. No fiat, no auto-execution, no notifications. Focus on proposal lifecycle demo. |
| Privy + Solana wallet issues | Medium | Test on Day 1. Privy has full Solana support but edge cases may exist with SPL Governance signing. |
| Devnet instability | Low | Use reliable RPC (Helius devnet). Seed demo data early so demo isn't dependent on live devnet calls. |
| Crypto stigma in positioning | Medium | Zero crypto terminology in UI. Warcraft aesthetic signals "fun," not "finance." |

---

## 14. Open Questions

- **Hackathon team:** Solo or recruit 1–2 collaborators? Design help for custom warcraftcn components would accelerate Phase 4.
- **Revenue model:** Transaction fee on deposits/withdrawals? Premium tier for AI features? Free for hackathon and beta.
- **Token strategy:** Community tokens are governance-only in v1 (non-transferable, 1 per member). Weighted voting and transferable tokens in v2.
- **Yield on idle treasury:** Natural DeFi integration on Solana. Potential Tidal integration. Regulatory complexity. v2+.
- **Plugin system:** Realms supports voter weight plugins (VSR, NFT voting, quadratic). Expose as advanced settings for power users. v2+.
- **Brand evolution:** Dalaran for hackathon. Consider renaming to Commune for consumer launch if the Warcraft aesthetic feels too niche for mainstream communities.

---

## 15. v2 Roadmap (Post-Hackathon)

### v2.0 — Production Foundation (Weeks 1–4)
- Mainnet migration (devnet → Solana mainnet, real USDC)
- Fiat on/offramp via Stripe + Bridge
- Auto-execution of passed proposals (server-side cron)
- Email notifications via Resend (new proposals, vote reminders, results)
- Mobile PWA optimization (bottom nav, touch targets, add-to-homescreen)

### v2.1 — Simple Mode (Weeks 5–8)
- Implement `SimpleGovernance` (Postgres-backed voting, Privy server wallet treasury)
- Default new communities to Simple mode
- "Upgrade to Onchain" flow for communities that want Realms verification
- Same UI, same discussion engine, same AI — different governance backend

### v2.2 — Power Features (Weeks 9–12)
- Delegation (delegate voting power to trusted councilors)
- Proposal templates
- Temperature checks (informal pre-vote polls)
- AI voter nudges (cron-based reminders before deadlines)
- Spending anomaly flagging
- Rich text editor (tiptap) for proposal bodies
- @mention autocomplete

### v2.3 — Scale & Network (Weeks 13–16)
- Sub-treasuries (multiple governance accounts per Realm)
- Multi-recipient payouts
- Recurring payments
- Cross-community member identity / reputation
- Plugin system (VSR, NFT voting, quadratic voting via Realms plugins)
- External integrations (Discord bot, Notion, webhooks)

### v2.4 — Ecosystem
- Milestone-based fund release
- Treasury yield integration (DeFi on Solana / Tidal)
- Legal entity wrapper (Otoco partnership)
- API for third-party integrations
- Community discovery / directory

---

## 16. Timeline Summary

### Hackathon (Feb 14–27)

| Phase | Days | Dates | Deliverable |
|---|---|---|---|
| Foundation + Realms | 3 | Feb 14–16 | Auth, wallets, Realm creation, member join, GovernanceProvider interface |
| War Chest | 3 | Feb 17–19 | Devnet USDC funding, treasury dashboard |
| Council Chamber | 4 | Feb 20–23 | Proposals, discussions, voting, manual execution |
| Keeper + Polish | 4 | Feb 24–27 | AI summaries, demo data, video, submit |

### Post-Hackathon

| Phase | Duration | Deliverable |
|---|---|---|
| v2.0 Production | Weeks 1–4 | Mainnet, fiat, auto-execution, notifications |
| v2.1 Simple Mode | Weeks 5–8 | Dual-mode governance, default to simple |
| v2.2 Power Features | Weeks 9–12 | Delegation, templates, nudges, rich text |
| v2.3 Scale | Weeks 13–16 | Sub-treasuries, recurring payments, plugins |
| Private Beta | Week 8 | 10 communities, invite-only |
| Public Launch | Week 12 | Open signup (potentially as Commune) |

---

*DALARAN — Pool · Discuss · Decide · Act*

*Destroyed and risen. The Council awaits.*
