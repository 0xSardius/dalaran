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
/app                        → Next.js pages and API routes
  /api/realms/create        → POST: Create a Realm + community
  /api/realms/join          → POST: Join a community via invite
  /create                   → Community creation form
  /community/[id]           → Community dashboard
  /invite/[code]            → Invite landing page + join flow
/components/ui/warcraftcn   → warcraftcn base components (Card, Button, Input, Badge, Dropdown, Skeleton)
/components/auth            → PrivyProviderWrapper, LoginButton
/lib/governance             → GovernanceProvider interface + RealmsGovernance skeleton
/lib/solana                 → Solana connection singleton, server wallet helper
/lib/privy                  → Privy config, server-side auth verification
/lib/db                     → Drizzle ORM schema (5 tables) and client
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
- `/community/[id]` — Community dashboard (treasury + proposals overview)
- `/community/[id]/treasury` — War chest view (NOT YET BUILT)
- `/community/[id]/proposals` — Proposals list (NOT YET BUILT)
- `/community/[id]/proposals/new` — Create a proposal (NOT YET BUILT)

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

### Next: Phase 2 — Proposals + Voting + Treasury

Phase 2 milestones (not yet planned in detail):
1. Treasury view — show War Chest balance (USDC on devnet), devnet airdrop button
2. Proposal creation — form + POST /api/proposals/create (CreateProposal + InsertTransaction + SignOffProposal instructions)
3. Voting — VotePanel component + POST /api/proposals/vote (CastVote instruction)
4. Vote finalization — FinalizeVote instruction + result display
5. Manual execution — "Execute Order" button (ExecuteTransaction instruction)
6. Threaded discussion — comments with reactions (Postgres-only, no on-chain chat)
7. AI Keeper — Vercel AI SDK agent for discussion summaries
