import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// ── Communities ──────────────────────────────────────────────

export const communities = pgTable("communities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull().default(""),
  realmPubkey: text("realm_pubkey"),
  communityMint: text("community_mint"),
  councilMint: text("council_mint"),
  governancePubkey: text("governance_pubkey"),
  treasuryPubkey: text("treasury_pubkey"),
  inviteCode: varchar("invite_code", { length: 20 })
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(10)),
  quorumPercent: integer("quorum_percent").notNull().default(60),
  votingPeriodHours: integer("voting_period_hours").notNull().default(72),
  createdBy: text("created_by").notNull(), // privy user id
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Members ─────────────────────────────────────────────────

export const members = pgTable("members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  communityId: text("community_id")
    .notNull()
    .references(() => communities.id),
  privyUserId: text("privy_user_id").notNull(),
  solanaAddress: text("solana_address").notNull(),
  email: text("email"),
  role: varchar("role", { length: 20 }).notNull().default("citizen"), // archmage | councilor | citizen
  tokenOwnerRecordPubkey: text("token_owner_record_pubkey"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// ── Proposals ───────────────────────────────────────────────

export const proposals = pgTable("proposals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  communityId: text("community_id")
    .notNull()
    .references(() => communities.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  amount: decimal("amount", { precision: 18, scale: 6 }),
  recipientAddress: text("recipient_address"),
  proposalPubkey: text("proposal_pubkey"),
  governancePubkey: text("governance_pubkey"),
  state: varchar("state", { length: 20 }).notNull().default("draft"),
  createdBy: text("created_by").notNull(), // member id
  createdAt: timestamp("created_at").notNull().defaultNow(),
  votingEndsAt: timestamp("voting_ends_at"),
});

// ── Comments (threaded) ─────────────────────────────────────

export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  proposalId: text("proposal_id")
    .notNull()
    .references(() => proposals.id),
  parentId: text("parent_id"), // null = top-level
  authorId: text("author_id")
    .notNull()
    .references(() => members.id),
  body: text("body").notNull(),
  reactions: jsonb("reactions").default({}), // { "⚔️": ["memberId1"], "🛡️": ["memberId2"] }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Transactions log ────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  communityId: text("community_id")
    .notNull()
    .references(() => communities.id),
  proposalId: text("proposal_id").references(() => proposals.id),
  type: varchar("type", { length: 30 }).notNull(), // deposit | withdrawal | realm_creation | member_join
  amount: decimal("amount", { precision: 18, scale: 6 }),
  signature: text("signature").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
