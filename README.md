# Dalaran

**Collective treasury & governance for communities — zero crypto UX.**

Dalaran wraps Solana's [SPL Governance (Realms)](https://realms.today) in a consumer-grade interface. Email login, dollar amounts, no wallets visible. Built for mid-size communities (250-1,000 people) who need shared treasury management and democratic decision-making.

> *"Dalaran was destroyed and rose again. So did DAOs."*

Built for the [Solana Graveyard Hack](https://solana.com/graveyard-hack) (Feb 12-27, 2026) — Realms / DAOs track.

---

## Demo Flow

1. **Create a community** — email login via Privy, one-click Realm creation on Solana devnet
2. **Invite members** — share an invite link, members join with email
3. **Submit proposals** — funding requests, policy changes, or general votes
4. **Discuss & vote** — threaded comments with reactions, Support/Oppose/Abstain voting
5. **AI summaries** — The Keeper (Claude) neutrally summarizes discussions
6. **Execute orders** — passed funding proposals transfer SOL from treasury

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| UI | [warcraftcn](https://warcraftcn.com) — Warcraft III-themed shadcn components |
| Auth | [Privy](https://privy.io) — email login with embedded Solana wallets |
| Blockchain | Solana devnet, SPL Governance via `governance-idl-sdk` |
| Database | PostgreSQL (Neon) with Drizzle ORM |
| AI | Vercel AI SDK v6 + Claude (discussion summaries) |

## Architecture

```
User (email login via Privy)
  │
  ├── Frontend (Next.js App Router)
  │     ├── Community Dashboard
  │     ├── Proposals (create / list / detail)
  │     ├── Voting (Support / Oppose / Abstain)
  │     ├── Discussion (threaded comments + reactions)
  │     ├── Treasury (War Chest balance + history)
  │     └── AI Keeper (Claude-powered summaries)
  │
  ├── API Routes (Next.js serverless)
  │     ├── Privy auth verification
  │     ├── Proposal CRUD + vote tallying
  │     ├── Comment threads + reactions
  │     └── AI summary generation
  │
  ├── Solana Devnet
  │     ├── SPL Governance (Realms) — realm, governance, treasury PDA
  │     ├── Token mints — community + council governance tokens
  │     └── Native treasury — holds SOL
  │
  └── PostgreSQL (Neon)
        ├── communities, members, proposals, votes
        ├── comments (threaded, with reactions)
        └── transactions log
```

### Key Design Decisions

- **Postgres-backed voting** — `CastVote` requires the user's wallet to sign, which breaks zero-crypto UX. Votes are stored in Postgres with the same UI. On-chain voting is a stretch goal via Privy client-side signing.
- **Server keypair** — A devnet server wallet handles all on-chain operations (mint creation, realm setup, token deposits). Users never see gas fees or signing prompts. In production, Privy embedded wallets would sign directly.
- **Zero crypto language** — No wallet addresses, gas fees, or token symbols in the UI. "Support" not "CastVote". "War Chest" not "Native Treasury PDA".

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- A [Neon](https://neon.tech) Postgres database
- A [Privy](https://privy.io) app (email login enabled, Solana embedded wallets)
- A Solana devnet RPC ([Helius](https://helius.dev) free tier works)
- An [Anthropic API key](https://console.anthropic.com) (for AI Keeper)

### Setup

```bash
# Clone
git clone https://github.com/0xSardius/dalaran.git
cd dalaran

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_PRIVY_APP_ID, PRIVY_APP_SECRET, DATABASE_URL,
#          NEXT_PUBLIC_SOLANA_RPC_URL, ANTHROPIC_API_KEY

# Generate server wallet (devnet only)
solana-keygen new -o server-wallet.json
solana airdrop 5 $(solana-keygen pubkey server-wallet.json) --url devnet

# Push database schema
pnpm db:push

# (Optional) Seed demo data
pnpm seed

# Start dev server
pnpm dev
```

### Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` for 5-minute voting periods (instead of 72 hours).

### Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm db:push      # Push schema to Neon
pnpm db:studio    # Open Drizzle Studio
pnpm seed         # Seed demo data
```

---

## Project Structure

```
app/
  api/
    realms/create|join       Realm + member onboarding (on-chain)
    proposals/create|vote    Proposal lifecycle (Postgres)
    proposals/[id]/tally     Vote tallying + auto-finalize
    proposals/[id]/execute   Fund transfer for passed proposals
    comments/                Threaded discussion + reactions
    treasury/[communityId]   SOL/USDC balance from chain
    ai/summarize             AI Keeper summary generation
  community/[id]/            Dashboard, proposals, treasury pages
  create/                    Community creation form
  invite/[code]              Join via invite link

components/
  proposals/    ProposalCard, VotePanel, ExecutePanel
  discussion/   CouncilThread, CommentInput, KeeperSummary
  treasury/     WarChest

lib/
  db/           Drizzle schema (6 tables) + Neon client
  ai/           Keeper system prompt + summary generation
  solana/       Connection singleton, server wallet
  privy/        Auth verification
  governance/   GovernanceProvider interface
```

---

## Realms Integration

Dalaran creates real SPL Governance infrastructure on Solana devnet:

| Dalaran Concept | Realms Concept | On-chain? |
|----------------|---------------|-----------|
| Community | Realm | Yes |
| Archmage (admin) | Council token holder | Yes |
| Citizen (member) | Community token holder | Yes |
| War Chest | Native Treasury PDA | Yes |
| Proposal | Postgres record | No (stretch: on-chain) |
| Vote | Postgres record | No (stretch: on-chain) |
| Discussion | Postgres comments | No |
| AI Summary | Postgres field | No |

On community creation, Dalaran executes: `CreateRealm` → `DepositGoverningTokens` → `CreateGovernance` → `CreateNativeTreasury` — all in real Solana transactions.

---

## Hackathon Track Alignment

**Realms — DAOs ($5,000 bounty)**

- **Governance Builders** — Consumer-grade UX layer for SPL Governance
- **Realms Extensions** — Threaded discussion + AI-powered governance summaries
- **Authority-First Orgs** — Communities with on-chain authority via Realms treasury

---

## Team

Solo builder — [0xSardius](https://github.com/0xSardius)

## License

MIT
