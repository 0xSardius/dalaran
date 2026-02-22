# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dalaran is a collective treasury and governance app for mid-size communities (250–1,000 people). It wraps Solana's SPL Governance (Realms) in a zero-crypto UX: email login via Privy, dollar amounts only, no wallets visible. The UI uses warcraftcn components (Warcraft III-themed shadcn-compatible library) for a distinctive "council chamber" aesthetic.

**Hackathon:** Solana Graveyard Hack (Feb 12–27, 2026), Realms — DAOs track. Submission deadline: Feb 27.

**PRD:** `dalaran-prd-v3.md` is the authoritative spec. Read it at the start of each session.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Package Manager:** pnpm
- **UI Components:** warcraftcn (install via `pnpm dlx shadcn@latest add https://warcraftcn.com/r/[component].json`)
- **Auth:** Privy SDK — email-only login with embedded Solana wallets
- **Blockchain:** Solana devnet, SPL Governance via `governance-idl-sdk` (Mythic Project's maintained IDL-based SDK)
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **AI:** Vercel AI SDK + Claude API ("The Keeper" — discussion summaries)
- **Backend:** Vercel Serverless Functions
- **Testing:** Vitest

## Available Skills / MCP Tools

This project has access to specialized skills that should be used when relevant:

- **Solana skills** — Use for Solana-specific operations, devnet interactions, program deployment
- **Vercel AI SDK skills** — Use for building AI features (The Keeper agent, discussion summaries)

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Lint
pnpm test             # Run all tests (Vitest)
pnpm test -- [file]   # Run a single test file
pnpm db:push          # Push Drizzle schema to Neon
pnpm db:generate      # Generate Drizzle migrations
pnpm db:studio        # Open Drizzle Studio
```

## Project Structure

```
/app                                       → Next.js pages and API routes
  /api/realms/create                       → POST: Create a Realm + community
  /api/realms/join                         → POST: Join a community via invite
  /api/proposals/create                    → POST: Create proposal
  /api/proposals                           → GET: List proposals with tallies
  /api/proposals/vote                      → POST: Cast/change vote
  /api/proposals/[id]/tally                → GET: Vote tally + auto-finalize
  /api/proposals/[id]/execute              → POST: Execute passed proposal
  /api/comments                            → GET/POST: List/create comments
  /api/comments/[id]/react                 → POST: Toggle reactions
  /api/treasury/[communityId]              → GET: Treasury balance
  /api/ai/summarize                        → POST: AI Keeper summary
  /create                                  → Community creation form
  /community/[id]                          → Community dashboard
  /community/[id]/proposals                → Proposals list
  /community/[id]/proposals/new            → Proposal creation form
  /community/[id]/proposals/[proposalId]   → Proposal detail (vote + discuss + execute)
  /community/[id]/treasury                 → Treasury / war chest page
  /invite/[code]                           → Invite landing page + join flow
/components/ui/warcraftcn   → warcraftcn base components (Card, Button, Input, Badge, Dropdown, Skeleton)
/components/auth            → PrivyProviderWrapper, LoginButton
/components/proposals       → ProposalCard, VotePanel, ExecutePanel
/components/discussion      → CouncilThread, CommentInput, KeeperSummary
/components/treasury        → WarChest
/lib/governance             → GovernanceProvider interface + RealmsGovernance skeleton
/lib/solana                 → Solana connection singleton, server wallet helper
/lib/privy                  → Privy config, server-side auth verification
/lib/db                     → Drizzle ORM schema (6 tables) and client
/lib/ai                     → Keeper system prompt + summary generation
/hooks                      → Custom React hooks (use-auth)
/scripts                    → Dev scripts (devnet airdrop, seed data)
```

## Architecture

### Server-Side Transaction Signing (Devnet Tradeoff)

A server keypair (`server-wallet.json`, gitignored) handles all on-chain operations for the hackathon:
- Creates mints (as mint authority)
- Creates Realms (as payer)
- Mints governance tokens to new members
- Deposits governance tokens

The user's Privy embedded wallet address is set as the governance authority on token deposits, but doesn't sign transactions in Phase 1. This is centralized but fast to build. In production, users would sign with their own embedded wallets via Privy.

### GovernanceProvider Interface

The central abstraction layer in `/lib/governance/types.ts`. All governance operations (createCommunity, addMember, createProposal, castVote, finalizeVote, executeProposal, getTreasuryBalance) go through this interface. For hackathon, only `RealmsGovernance` (SPL Governance) is implemented. A `SimpleGovernance` (Postgres-backed) implementation is planned for v2.

### `governance-idl-sdk` (NOT `@solana/spl-governance`)

We use Mythic Project's maintained IDL-based SDK instead of the archived `@solana/spl-governance`. Key class: `SplGovernance` from `governance-idl-sdk`. Default program ID: `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`.

The SDK's GovernanceConfig uses Anchor IDL enum format:
- VoteThreshold: `{ yesVotePercentage: [60] }`, `{ quorumPercentage: [60] }`, `{ disabled: {} }`
- VoteTipping: `{ strict: {} }`, `{ early: {} }`, `{ disabled: {} }`

### Realms / SPL Governance Mapping

| Realms Concept | Dalaran Concept | Notes |
|---|---|---|
| Realm | Community | One community = one Realm. Created with council + community mints. |
| Council Population | Archmages (admins) | 3–7 members with elevated permissions. |
| Community Population | Citizens (members) | 1 member = 1 token = 1 vote. |
| Governance | Treasury Config | Quorum %, voting period, proposal thresholds. |
| Native Treasury (PDA) | War Chest | Holds USDC. Only accessible via passed proposals. |
| Proposal + ProposalTransaction | Proposal | Metadata in Postgres, governance state onchain. |
| VoteRecord | Vote | Yes/No/Abstain via CastVote instruction (invisible to user). |

### Governance Instruction Flow

```
CreateRealm → DepositGoverningTokens → CreateGovernance → CreateNativeTreasury →
CreateProposal → InsertTransaction → SignOffProposal → CastVote →
FinalizeVote → ExecuteTransaction (manual button for hackathon)
```

### Data Split: Onchain vs Off-chain

**Onchain (SPL Governance — source of truth for governance):** Realm accounts, governance accounts, proposals, vote records, token owner records, native treasury PDA.

**Off-chain (Postgres — UX data):** communities, members, proposals (metadata + body), comments (threaded), transactions log, AI summaries. The Postgres `proposals` and `members` tables link to onchain accounts via `proposal_pubkey`, `realm_pubkey`, `token_owner_record_pubkey`.

### Key Routes

- `/` — Landing page
- `/create` — Create a community (Realm)
- `/invite/[code]` — Join a community via invite link
- `/community/[id]` — Community dashboard (treasury + proposals overview + navigation)
- `/community/[id]/treasury` — War chest (SOL/USDC balance + tx history)
- `/community/[id]/proposals` — Proposals list with vote tallies
- `/community/[id]/proposals/new` — Create a proposal (funding/policy/general)
- `/community/[id]/proposals/[proposalId]` — Proposal detail (vote + discussion + execute + AI summary)

## Hackathon Scope

**IN:** Privy auth, Realm creation on devnet, member join via invite link, treasury view (devnet USDC airdrop), proposal creation/voting/finalization via SPL Governance, threaded discussion with reactions, AI Keeper summaries, manual "Execute Order" button, warcraftcn UI throughout.

**OUT:** Fiat on/offramp (Stripe + Bridge), auto-execution, recurring contributions, vote privacy, delegation, notifications, mobile optimization, simple mode (Postgres governance).

**Fallback (if Realms integration is blocked by Day 8):** Postgres-backed voting with identical UI. Note in README that production uses onchain voting.

## Design Conventions

- **Zero crypto terminology in UI.** Dollar amounts only. No wallet addresses, gas fees, token symbols, or blockchain jargon.
- **Color palette:** Golds `#C9A959`, parchment `#E8D5B0`, dark `#1A1A2E`, dark-surface `#252542`.
- **Reactions:** ⚔️ 🛡️ 🤔 ❤️ (stored as jsonb).
- **Roles:** Archmage (admin/organizer), Councilor (power user), Citizen (member).
- **AI summaries** labeled "Keeper's Summary" and clearly marked as AI-generated. The Keeper never takes sides or votes.
- **Discussion and voting live on the same page.** The thread IS the proposal lifecycle: Draft → Discuss → Vote → Result.

## Environment Variables

```env
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=
DATABASE_URL=                              # Neon Postgres
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SOLANA_RPC_URL=                # Helius or Quicknode devnet
NEXT_PUBLIC_SOLANA_NETWORK=devnet
SPL_GOVERNANCE_PROGRAM_ID=GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw
SERVER_WALLET_PATH=./server-wallet.json    # Devnet server keypair (gitignored)
```

## Key Dependencies

- `governance-idl-sdk` — SPL Governance IDL-based SDK (Mythic Project)
- `@solana/spl-token` — SPL Token operations (USDC, governance tokens)
- `@solana/web3.js` — Solana blockchain interactions
- `@privy-io/react-auth` + `@privy-io/server-auth` — Auth + embedded wallets
- `drizzle-orm` + `@neondatabase/serverless` — Database ORM
- `nanoid` — Short ID generation (invite codes, record IDs)
- `ai` + `@ai-sdk/anthropic` — Vercel AI SDK v6 + Anthropic provider (Keeper summaries)

## Session Continuity / Progress Tracker

### Phase 1: Foundation + Realms (Days 1-3)

- [x] **M1: Infrastructure Setup** — Dependencies, warcraftcn components, Dalaran theme, next.config webpack externals, directory structure
- [x] **M2: Privy Auth + Embedded Wallets** — PrivyProviderWrapper, use-auth hook, LoginButton, verify-auth server helper, layout + landing page
- [x] **M3: GovernanceProvider Interface + DB Schema** — Full types.ts interface, RealmsGovernance skeleton, Solana connection singleton, Drizzle schema (5 tables), drizzle.config.ts
- [x] **M4: Realm Creation API + UI** — POST /api/realms/create (mint creation, createRealm, depositGoverningTokens, createGovernance, createNativeTreasury, Postgres storage), /create form page, /community/[id] dashboard
- [x] **M5: Member Join via Invite Link** — /invite/[code] server page, JoinButton client component, POST /api/realms/join (ATA creation, community token mint, depositGoverningTokens, duplicate check, Postgres member record + transaction log)

**Phase 1 complete.** All 5 milestones done.

### Pre-requisites Still Needed (User action)

Before testing end-to-end:
1. Configure Privy app — set `NEXT_PUBLIC_PRIVY_APP_ID` and `PRIVY_APP_SECRET` in `.env.local`
2. Create Neon database — set `DATABASE_URL` in `.env.local`, then run `pnpm db:push`
3. Get a devnet RPC — set `NEXT_PUBLIC_SOLANA_RPC_URL` (Helius free tier recommended)
4. Generate server keypair — `solana-keygen new -o server-wallet.json`, fund with `solana airdrop 5`
5. Set `ANTHROPIC_API_KEY` in `.env.local` (for AI Keeper summaries)

### Schema migration: DONE

Phase 2 schema changes pushed to Neon via `pnpm db:push`:
- New `votes` table (`id, proposal_id, member_id, choice, created_at`)
- New columns on `proposals`: `type` (varchar), `ai_summary` (text), `ai_summary_updated_at` (timestamp)

### Phase 2: Proposals + Voting + Treasury (Days 4-10)

- [x] **M1: Schema Changes + Proposal Creation API** — Added `votes` table, `type`/`aiSummary`/`aiSummaryUpdatedAt` columns to proposals, POST /api/proposals/create, GET /api/proposals (list with tallies)
- [x] **M2: Proposal UI — Form + List + Detail Page** — /community/[id]/proposals/new (creation form with type selector), /community/[id]/proposals (list), /community/[id]/proposals/[proposalId] (detail page), ProposalCard component, updated dashboard with proposals + treasury sections + navigation
- [x] **M3: Voting — Cast + Tally + Display** — POST /api/proposals/vote (upsert, validation), GET /api/proposals/[id]/tally (with auto-finalize), VotePanel component (Support/Oppose/Abstain buttons, progress bars, quorum line, countdown timer, polling)
- [x] **M4: Discussion Threads — Comments + Reactions** — POST/GET /api/comments, POST /api/comments/[id]/react (toggle reactions ⚔️🛡️🤔❤️), CouncilThread component (threaded comments, inline replies, polling), CommentInput component
- [x] **M5: Treasury View — War Chest** — GET /api/treasury/[communityId] (SOL + USDC balance), WarChest component, /community/[id]/treasury page (balance + tx history + faucet instructions), scripts/airdrop-devnet.ts
- [x] **M6: Finalize + Execute** — POST /api/proposals/[id]/execute (auth check, SOL transfer, state update, tx log), ExecutePanel component (confirmation dialog, explorer link), auto-finalize in tally endpoint
- [x] **M7: AI Keeper Summaries** — lib/ai/keeper.ts (system prompt + Claude Haiku 4.5), POST /api/ai/summarize (rate-limited, caches in DB), KeeperSummary component (auto-fetch, refresh, AI badge)

**Phase 2 complete.** All 7 milestones done. Voting is Postgres-backed (PRD fallback). Build passes.

**Key decisions:**
- Voting is Postgres-backed (not on-chain CastVote) per PRD Section 4.3 fallback
- Proposals go directly to "voting" state (skipping draft/signoff for hackathon speed)
- Execute uses server wallet SOL transfer (simplified from SPL Governance ExecuteTransaction)
- AI Keeper uses Claude Haiku 4.5 via Vercel AI SDK v6 for cost efficiency

**Build fixes applied:**
- Added `turbopack: {}` to `next.config.ts` (Next.js 16 requires explicit turbopack config when webpack config exists)
- Installed `bn.js` as direct dependency (was missing, used by realm routes)

### Phase 3: Polish + Demo Prep

- [x] **Community layout + nav bar** — layout.tsx with CommunityNav (Dashboard/Proposals/Treasury tabs, active highlighting), removed duplicate back-links from child pages
- [x] **Demo mode + seed script** — `NEXT_PUBLIC_DEMO_MODE=true` shortens voting to 5 minutes, `pnpm seed` populates community with 5 members, 3 proposals (active/passed/defeated), votes, threaded comments with reactions
- [x] **Hackathon README** — Architecture, setup, demo flow, track alignment, .env.example

**Phase 3 complete.**

### Bug Fixes Applied (Phase 3.5)

- [x] **Realm PDA collision fix** — Append `nanoid(4)` suffix to on-chain realm name to avoid PDA collisions on devnet
- [x] **Signature verification fix** — SPL Governance requires `governingTokenOwner` to sign deposit instruction. Server wallet is now the on-chain governing token owner for all deposits (voting is Postgres-backed, so on-chain ownership is cosmetic). Also use idempotent ATA creation in join route.

### Next: Phase 4 — Ship + Polish

**Priority order:**
1. [ ] End-to-end testing of full demo flow (create → invite → join → propose → vote → discuss → execute → treasury)
2. [ ] Fix server-wallet.ts to support env-var-based keypair for Vercel deployment
3. [ ] Vercel deployment with all environment variables
4. [ ] Dashboard layout polish — Reorganize community dashboard to match designer wireframes: "story so far" banner, open votes as cards, treasury summary at a glance
5. [ ] Creation form enhancements — Add community type selector (mutual aid / investment collective / artist collective / cooperative / other), primary goals field, expected member count, public/private toggle. Store in Postgres `communities` table, display on dashboard.
6. [ ] 3-minute demo video walkthrough
7. [ ] Stretch: client-side Privy wallet signing for on-chain CastVote

**Design reference:** Designer's user flows and toolkits are saved in `~/OneDrive/Pictures/web3/Dalaran/`. Toolkits (Treasury, Decision-Making, Membership, Communication, Transparency, Conflict Resolution, Legal & Compliance, Reputation, Coordination) are post-hackathon scope for Commune.
