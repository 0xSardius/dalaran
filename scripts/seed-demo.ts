/**
 * Seed script for demo data.
 * Creates a community with proposals, votes, and comments for demo purposes.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Requires DATABASE_URL in .env.local or environment.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { nanoid } from "nanoid";
import * as schema from "../lib/db/schema";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL. Set it in .env.local");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log("Seeding demo data...\n");

  // 1. Create community
  const [community] = await db
    .insert(schema.communities)
    .values({
      name: "The Silver Hand",
      description:
        "A council of paladins dedicated to community governance and collective treasury management.",
      inviteCode: nanoid(10),
      quorumPercent: 50,
      votingPeriodHours: 72,
      createdBy: "demo-user-1",
    })
    .returning();

  console.log(`Community: ${community.name} (${community.id})`);
  console.log(`Invite code: ${community.inviteCode}\n`);

  // 2. Create members
  const memberData = [
    {
      privyUserId: "demo-user-1",
      email: "tirion@silverhand.org",
      role: "archmage",
      solanaAddress: "Demo111111111111111111111111111111111111111",
    },
    {
      privyUserId: "demo-user-2",
      email: "uther@silverhand.org",
      role: "councilor",
      solanaAddress: "Demo222222222222222222222222222222222222222",
    },
    {
      privyUserId: "demo-user-3",
      email: "turalyon@silverhand.org",
      role: "citizen",
      solanaAddress: "Demo333333333333333333333333333333333333333",
    },
    {
      privyUserId: "demo-user-4",
      email: "liadrin@silverhand.org",
      role: "citizen",
      solanaAddress: "Demo444444444444444444444444444444444444444",
    },
    {
      privyUserId: "demo-user-5",
      email: "yrel@silverhand.org",
      role: "citizen",
      solanaAddress: "Demo555555555555555555555555555555555555555",
    },
  ];

  const members = [];
  for (const m of memberData) {
    const [member] = await db
      .insert(schema.members)
      .values({
        communityId: community.id,
        ...m,
      })
      .returning();
    members.push(member);
    console.log(`  Member: ${m.email} (${m.role})`);
  }

  // 3. Create proposals
  const now = new Date();

  // Proposal 1: Active voting (funding)
  const votingEnds1 = new Date(now.getTime() + 5 * 60 * 1000); // 5 min from now
  const [proposal1] = await db
    .insert(schema.proposals)
    .values({
      communityId: community.id,
      title: "Community Event Fund — Spring Gathering",
      description:
        "Requesting 2 SOL from the treasury to organize a community gathering event. This will cover venue booking, refreshments, and promotional materials. The event will help strengthen community bonds and attract new members.",
      type: "funding",
      amount: "2.000000",
      recipientAddress: members[0].solanaAddress,
      state: "voting",
      createdBy: members[0].id,
      votingEndsAt: votingEnds1,
    })
    .returning();
  console.log(`\n  Proposal 1: ${proposal1.title} (voting, ends in 5 min)`);

  // Proposal 2: Passed (policy)
  const [proposal2] = await db
    .insert(schema.proposals)
    .values({
      communityId: community.id,
      title: "Establish Monthly Treasury Report",
      description:
        "Proposal to require a monthly treasury report published to all members. This ensures transparency and accountability for all community funds.",
      type: "policy",
      state: "succeeded",
      createdBy: members[1].id,
      votingEndsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // ended yesterday
    })
    .returning();
  console.log(`  Proposal 2: ${proposal2.title} (passed)`);

  // Proposal 3: Failed (general)
  const [proposal3] = await db
    .insert(schema.proposals)
    .values({
      communityId: community.id,
      title: "Change Community Name to The Argent Dawn",
      description:
        "A vote on whether to rebrand our community. The Argent Dawn represents a broader mission beyond our current scope.",
      type: "general",
      state: "defeated",
      createdBy: members[2].id,
      votingEndsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    })
    .returning();
  console.log(`  Proposal 3: ${proposal3.title} (defeated)`);

  // 4. Add votes
  // Proposal 1: 2 yes, 1 no (active voting)
  await db.insert(schema.votes).values([
    { proposalId: proposal1.id, memberId: members[1].id, choice: "yes" },
    { proposalId: proposal1.id, memberId: members[2].id, choice: "yes" },
    { proposalId: proposal1.id, memberId: members[3].id, choice: "no" },
  ]);
  console.log(`\n  Votes on P1: 2 yes, 1 no`);

  // Proposal 2: 4 yes, 1 abstain (passed)
  await db.insert(schema.votes).values([
    { proposalId: proposal2.id, memberId: members[0].id, choice: "yes" },
    { proposalId: proposal2.id, memberId: members[1].id, choice: "yes" },
    { proposalId: proposal2.id, memberId: members[2].id, choice: "yes" },
    { proposalId: proposal2.id, memberId: members[3].id, choice: "yes" },
    { proposalId: proposal2.id, memberId: members[4].id, choice: "abstain" },
  ]);
  console.log(`  Votes on P2: 4 yes, 1 abstain`);

  // Proposal 3: 1 yes, 3 no (defeated)
  await db.insert(schema.votes).values([
    { proposalId: proposal3.id, memberId: members[2].id, choice: "yes" },
    { proposalId: proposal3.id, memberId: members[0].id, choice: "no" },
    { proposalId: proposal3.id, memberId: members[1].id, choice: "no" },
    { proposalId: proposal3.id, memberId: members[3].id, choice: "no" },
  ]);
  console.log(`  Votes on P3: 1 yes, 3 no`);

  // 5. Add comments on proposal 1
  const [comment1] = await db
    .insert(schema.comments)
    .values({
      proposalId: proposal1.id,
      authorId: members[1].id,
      body: "I think this is a great initiative. Community events are essential for keeping our council active and engaged. The budget seems reasonable for what's planned.",
      reactions: { "⚔️": [members[0].id], "❤️": [members[2].id, members[4].id] },
    })
    .returning();

  await db.insert(schema.comments).values({
    proposalId: proposal1.id,
    authorId: members[3].id,
    body: "I have concerns about the amount. 2 SOL is a significant portion of our treasury. Could we start with a smaller pilot event first?",
    reactions: { "🤔": [members[1].id] },
  });

  await db.insert(schema.comments).values({
    proposalId: proposal1.id,
    parentId: comment1.id,
    authorId: members[0].id,
    body: "Good point Uther. I've already looked into venues and this covers just the essentials. Happy to share the full breakdown if the council wants to see it.",
    reactions: { "🛡️": [members[1].id] },
  });

  await db.insert(schema.comments).values({
    proposalId: proposal1.id,
    authorId: members[4].id,
    body: "I support this. Our last gathering was months ago and we've grown a lot since then. Worth the investment.",
    reactions: { "⚔️": [members[0].id, members[2].id] },
  });

  console.log(`  Comments on P1: 4 (with threaded reply and reactions)`);

  // 6. Add a transaction log entry
  await db.insert(schema.transactions).values({
    communityId: community.id,
    type: "realm_creation",
    signature: `demo-sig-${nanoid(8)}`,
    description: `Created realm "The Silver Hand"`,
  });

  console.log("\n--- Demo data seeded successfully! ---");
  console.log(`\nVisit: /community/${community.id}`);
  console.log(`Invite link: /invite/${community.inviteCode}`);
  console.log(
    `\nNote: Proposal 1 voting ends in 5 minutes for demo purposes.`
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
