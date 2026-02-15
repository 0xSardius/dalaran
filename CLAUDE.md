# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dalaran is a collective treasury and governance app for mid-size communities (250–1,000 people). It wraps Solana's SPL Governance (Realms) in a zero-crypto UX: email login via Privy, dollar amounts only, no wallets visible. The UI uses warcraftcn components (Warcraft III-themed shadcn-compatible library) for a distinctive "council chamber" aesthetic.

**Hackathon:** Solana Graveyard Hack (Feb 12–27, 2026), Realms — DAOs track. Submission deadline: Feb 27.

**PRD:** `dalaran-prd-v3.md` is the authoritative spec. Read it at the start of each session.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Package Manager:** pnpm
- **UI Components:** warcraftcn (install via `pnpm dlx shadcn@latest add https://warcraftcn.com/r/[component].json`)
- **Auth:** Privy SDK — email/social login with embedded Solana wallets
- **Blockchain:** Solana devnet, SPL Governance (Realms), USDC (SPL Token)
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **AI:** Vercel AI SDK + Claude API ("The Keeper" — discussion summaries)
- **Backend:** Vercel Serverless Functions
- **Testing:** Vitest

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Lint
pnpm test             # Run all tests (Vitest)
pnpm test -- [file]   # Run a single test file
pnpm db:push          # Push Drizzle schema to Neon
pnpm db:generate      # Generate Drizzle migrations
```

## Project Structure

```
/app                        → Next.js pages and API routes
/components/ui/warcraftcn   → warcraftcn base components (Card, Button, Input, Badge, Dropdown, Skeleton)
/components                 → Custom shared components (ProposalCard, WarChest, VotePanel, etc.)
/lib/governance             → GovernanceProvider interface + RealmsGovernance implementation
/lib/realms                 → SPL Governance SDK wrappers (create-realm, cast-vote, etc.)
/lib/privy                  → Privy auth + embedded wallet config
/lib/ai                     → Vercel AI SDK agent ("The Keeper")
/lib/db                     → Drizzle ORM schema and queries
/hooks                      → Custom React hooks
/scripts                    → Dev scripts (devnet airdrop, seed data)
```

## Architecture

### GovernanceProvider Interface

The central abstraction layer in `/lib/governance/types.ts`. All governance operations (createCommunity, addMember, createProposal, castVote, finalizeVote, executeProposal, getTreasuryBalance) go through this interface. For hackathon, only `RealmsGovernance` (SPL Governance) is implemented. A `SimpleGovernance` (Postgres-backed) implementation is planned for v2.

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
CreateRealm → DepositGoverningTokens → CreateProposal → InsertTransaction →
SignOffProposal → CastVote → FinalizeVote → ExecuteTransaction (manual button for hackathon)
```

### Data Split: Onchain vs Off-chain

**Onchain (SPL Governance — source of truth for governance):** Realm accounts, governance accounts, proposals, vote records, token owner records, native treasury PDA.

**Off-chain (Postgres — UX data):** communities, members, proposals (metadata + body), comments (threaded), transactions log, AI summaries. The Postgres `proposals` and `members` tables link to onchain accounts via `proposal_pubkey`, `realm_pubkey`, `token_owner_record_pubkey`.

### Key Routes

- `/` — Landing page
- `/create` — Create a community (Realm)
- `/invite/[code]` — Join a community via invite link
- `/[community]` — Community dashboard (treasury + proposals overview)
- `/[community]/treasury` — War chest view
- `/[community]/proposals` — Proposals list
- `/[community]/proposals/new` — Create a proposal

## Hackathon Scope

**IN:** Privy auth, Realm creation on devnet, member join via invite link, treasury view (devnet USDC airdrop), proposal creation/voting/finalization via SPL Governance, threaded discussion with reactions, AI Keeper summaries, manual "Execute Order" button, warcraftcn UI throughout.

**OUT:** Fiat on/offramp (Stripe + Bridge), auto-execution, recurring contributions, vote privacy, delegation, notifications, mobile optimization, simple mode (Postgres governance).

**Fallback (if Realms integration is blocked by Day 8):** Postgres-backed voting with identical UI. Note in README that production uses onchain voting.

## Design Conventions

- **Zero crypto terminology in UI.** Dollar amounts only. No wallet addresses, gas fees, token symbols, or blockchain jargon.
- **Color palette:** Golds `#C9A959`, parchment `#E8D5B0`, dark `#1A1A2E`.
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
SPL_GOVERNANCE_PROGRAM_ID=GovER5Lthms3bLBqWub97yVRs6jmSt4LKkRAJuUFVq4e
```

## Key Dependencies

- `@solana/spl-governance` — SPL Governance SDK
- `@solana/spl-token` — SPL Token operations (USDC)
- `@solana/web3.js` — Solana blockchain interactions
- `@privy-io/react-auth` + `@privy-io/server-auth` — Auth + embedded wallets
- `ai` (Vercel AI SDK) — AI agent framework
- `drizzle-orm` + `@neondatabase/serverless` — Database ORM
