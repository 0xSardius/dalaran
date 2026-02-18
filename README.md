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
git clone https://github.com/0xSardius/dalaran.git
cd dalaran
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in all values — see .env.example for descriptions

# Generate server wallet (devnet only)
solana-keygen new -o server-wallet.json
solana airdrop 5 $(solana-keygen pubkey server-wallet.json) --url devnet

# Push database schema
pnpm db:push

# (Optional) Seed demo data — creates a community with proposals, votes, comments
pnpm seed

# Start dev server
pnpm dev
```

### Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` for 5-minute voting periods instead of 72 hours.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Lint |
| `pnpm db:push` | Push Drizzle schema to Neon |
| `pnpm db:studio` | Open Drizzle Studio (database browser) |
| `pnpm seed` | Seed demo data |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| UI | [warcraftcn](https://warcraftcn.com) — Warcraft III-themed shadcn components |
| Auth | [Privy](https://privy.io) — email login with embedded Solana wallets |
| Blockchain | Solana devnet, SPL Governance via `governance-idl-sdk` |
| Database | PostgreSQL (Neon) with Drizzle ORM |
| AI | Vercel AI SDK v6 + Claude Haiku 4.5 (discussion summaries) |

---

## Architecture

```
User (email login via Privy)
  │
  ├── Frontend (Next.js App Router)
  │     ├── Community Dashboard    /community/[id]
  │     ├── Proposals              /community/[id]/proposals
  │     ├── Proposal Detail        /community/[id]/proposals/[proposalId]
  │     │     ├── VotePanel        Support / Oppose / Abstain
  │     │     ├── CouncilThread    Threaded comments + reactions
  │     │     ├── KeeperSummary    AI-generated discussion summary
  │     │     └── ExecutePanel     Transfer funds (passed proposals)
  │     └── Treasury               /community/[id]/treasury
  │
  ├── API Routes (Next.js serverless)
  │     ├── /api/realms/create     Create Realm on Solana (on-chain)
  │     ├── /api/realms/join       Mint token + deposit (on-chain)
  │     ├── /api/proposals/*       CRUD, vote, tally, execute
  │     ├── /api/comments/*        Threaded discussion + reactions
  │     ├── /api/treasury/*        Read balances from chain
  │     └── /api/ai/summarize      AI Keeper summary
  │
  ├── Solana Devnet
  │     ├── SPL Governance (Realms)
  │     ├── Community + council token mints
  │     └── Native treasury PDA
  │
  └── PostgreSQL (Neon)
        └── 6 tables (see Database Schema below)
```

### Key Design Decisions

- **Postgres-backed voting** — `CastVote` requires the user's wallet to sign, which breaks zero-crypto UX. Votes are stored in Postgres with the same UI. On-chain voting is a stretch goal via Privy client-side signing.
- **Server keypair** — A devnet server wallet handles all on-chain operations (mint creation, realm setup, token deposits). Users never see gas fees or signing prompts. In production, Privy embedded wallets would sign directly.
- **Zero crypto language** — No wallet addresses, gas fees, or token symbols in the UI. "Support" not "CastVote". "War Chest" not "Native Treasury PDA".

---

## Project Structure

```
app/
  api/
    realms/create|join           On-chain realm + member operations
    proposals/create             Create proposal (→ voting state)
    proposals/vote               Cast or change vote (upsert)
    proposals/[id]/tally         Get vote counts + auto-finalize
    proposals/[id]/execute       SOL transfer for passed funding proposals
    proposals/                   List proposals with vote tallies
    comments/                    Create/list threaded comments
    comments/[id]/react          Toggle reactions (⚔️ 🛡️ 🤔 ❤️)
    treasury/[communityId]       SOL + USDC balance from chain
    ai/summarize                 AI Keeper summary generation
  community/[id]/
    layout.tsx                   Community layout with nav bar
    page.tsx                     Dashboard (overview + recent proposals)
    proposals/page.tsx           Proposals list
    proposals/new/page.tsx       Create proposal form
    proposals/[proposalId]/      Proposal detail page
    treasury/page.tsx            War chest + transaction history
  create/page.tsx                Community creation form
  invite/[code]/page.tsx         Join via invite link

components/
  ui/warcraftcn/                 Card, Button, Input, Badge, Skeleton, Dropdown
  auth/                          PrivyProviderWrapper, LoginButton
  proposals/                     ProposalCard, VotePanel, ExecutePanel
  discussion/                    CouncilThread, CommentInput, KeeperSummary
  treasury/                      WarChest

lib/
  db/schema.ts                   Drizzle schema (6 tables)
  db/index.ts                    Neon client singleton
  ai/keeper.ts                   Keeper system prompt + Claude integration
  solana/connection.ts           RPC connection singleton
  solana/server-wallet.ts        Devnet keypair loader
  privy/verify-auth.ts           Server-side Privy token verification
  governance/types.ts            GovernanceProvider interface

hooks/
  use-auth.ts                    Client auth state (Privy + Solana wallet)

scripts/
  seed-demo.ts                   Seed demo data
  airdrop-devnet.ts              Airdrop SOL to server wallet / treasury
```

---

## Database Schema

Six tables in `lib/db/schema.ts`, managed by Drizzle ORM:

**`communities`** — One row per Realm. Stores on-chain pubkeys alongside UX config.
- `id`, `name`, `description`, `realmPubkey`, `communityMint`, `councilMint`, `governancePubkey`, `treasuryPubkey`, `inviteCode`, `quorumPercent`, `votingPeriodHours`, `createdBy`, `createdAt`

**`members`** — Links Privy users to communities with roles.
- `id`, `communityId` (FK), `privyUserId`, `solanaAddress`, `email`, `role` (archmage/councilor/citizen), `tokenOwnerRecordPubkey`, `joinedAt`

**`proposals`** — Proposals with type, state machine, and AI summary cache.
- `id`, `communityId` (FK), `title`, `description`, `type` (funding/policy/general), `amount`, `recipientAddress`, `state` (voting/succeeded/defeated/completed), `createdBy` (FK members), `votingEndsAt`, `aiSummary`, `aiSummaryUpdatedAt`

**`votes`** — One vote per member per proposal. Upsert on re-vote.
- `id`, `proposalId` (FK), `memberId` (FK), `choice` (yes/no/abstain), `createdAt`

**`comments`** — Threaded discussion with emoji reactions stored as JSONB.
- `id`, `proposalId` (FK), `parentId` (self-ref for threading), `authorId` (FK members), `body`, `reactions` (jsonb: `{"⚔️": ["memberId1"]}`), `createdAt`

**`transactions`** — Audit log for on-chain and off-chain operations.
- `id`, `communityId` (FK), `proposalId` (FK, nullable), `type`, `amount`, `signature`, `description`, `createdAt`

---

## API Patterns

All authenticated API routes follow the same pattern:

```typescript
import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";

export async function POST(request: NextRequest) {
  // 1. Verify Privy auth token
  const authUser = await verifyAuth(request.headers.get("authorization"));
  // Returns: { privyUserId, solanaAddress, email }

  // 2. Get database
  const db = getDatabase();

  // 3. Look up member + validate permissions
  const member = await db.query.members.findFirst({
    where: and(
      eq(schema.members.communityId, communityId),
      eq(schema.members.privyUserId, authUser.privyUserId)
    ),
  });

  // 4. Do the thing, return JSON
}
```

Client components send the Privy access token via `Authorization: Bearer <token>`:

```typescript
const { getAccessToken } = usePrivy();
const token = await getAccessToken();
fetch("/api/...", { headers: { Authorization: `Bearer ${token}` } });
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
| Proposal | Postgres record | No (stretch) |
| Vote | Postgres record | No (stretch) |
| Discussion | Postgres comments | No |
| AI Summary | Postgres field | No |

On community creation, Dalaran executes: `CreateRealm` → `DepositGoverningTokens` → `CreateGovernance` → `CreateNativeTreasury` — all in real Solana transactions via `governance-idl-sdk`.

On member join: `CreateATA` → `MintTo` → `DepositGoverningTokens` — mints 1 community token and deposits it into the Realm.

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
