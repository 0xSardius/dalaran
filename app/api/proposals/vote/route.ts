import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

    const body = await request.json();
    const { proposalId, choice } = body as {
      proposalId: string;
      choice: string;
    };

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }
    if (!["yes", "no", "abstain"].includes(choice)) {
      return NextResponse.json(
        { error: "Choice must be yes, no, or abstain" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Fetch proposal
    const proposal = await db.query.proposals.findFirst({
      where: eq(schema.proposals.id, proposalId),
    });
    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check proposal is in voting state
    if (proposal.state !== "voting") {
      return NextResponse.json(
        { error: "Voting has ended for this proposal" },
        { status: 400 }
      );
    }

    // Check voting period hasn't expired
    if (proposal.votingEndsAt && new Date(proposal.votingEndsAt) < new Date()) {
      return NextResponse.json(
        { error: "Voting period has expired" },
        { status: 400 }
      );
    }

    // Verify user is a member
    const member = await db.query.members.findFirst({
      where: and(
        eq(schema.members.communityId, proposal.communityId),
        eq(schema.members.privyUserId, authUser.privyUserId)
      ),
    });
    if (!member) {
      return NextResponse.json(
        { error: "You must be a member of this community to vote" },
        { status: 403 }
      );
    }

    // Upsert vote (one vote per member per proposal)
    const existing = await db.query.votes.findFirst({
      where: and(
        eq(schema.votes.proposalId, proposalId),
        eq(schema.votes.memberId, member.id)
      ),
    });

    if (existing) {
      await db
        .update(schema.votes)
        .set({ choice, createdAt: new Date() })
        .where(eq(schema.votes.id, existing.id));
    } else {
      await db.insert(schema.votes).values({
        proposalId,
        memberId: member.id,
        choice,
      });
    }

    // Return updated tally
    const tally = await getVoteTally(db, proposalId, proposal.communityId);

    return NextResponse.json(tally);
  } catch (error) {
    console.error("Vote failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to cast vote",
      },
      { status: 500 }
    );
  }
}

async function getVoteTally(
  db: ReturnType<typeof getDatabase>,
  proposalId: string,
  communityId: string
) {
  const tallies = await db
    .select({
      choice: schema.votes.choice,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.votes)
    .where(eq(schema.votes.proposalId, proposalId))
    .groupBy(schema.votes.choice);

  let yes = 0,
    no = 0,
    abstain = 0;
  for (const t of tallies) {
    if (t.choice === "yes") yes = t.count;
    else if (t.choice === "no") no = t.count;
    else if (t.choice === "abstain") abstain = t.count;
  }

  const memberCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.members)
    .where(eq(schema.members.communityId, communityId));
  const totalMembers = memberCountResult[0]?.count || 0;

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.id, communityId),
  });
  const quorumPercent = community?.quorumPercent || 60;

  const total = yes + no + abstain;
  const quorumReached =
    totalMembers > 0 && total / totalMembers >= quorumPercent / 100;

  return { yes, no, abstain, total, totalMembers, quorumReached, quorumPercent };
}
