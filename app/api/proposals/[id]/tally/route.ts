import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

import { getDatabase, schema } from "@/lib/db";
import { verifyAuth } from "@/lib/privy/verify-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: proposalId } = await context.params;
    const db = getDatabase();

    const proposal = await db.query.proposals.findFirst({
      where: eq(schema.proposals.id, proposalId),
    });
    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Vote tallies
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

    const total = yes + no + abstain;

    // Total members
    const memberCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.members)
      .where(eq(schema.members.communityId, proposal.communityId));
    const totalMembers = memberCountResult[0]?.count || 0;

    const community = await db.query.communities.findFirst({
      where: eq(schema.communities.id, proposal.communityId),
    });
    const quorumPercent = community?.quorumPercent || 60;

    const quorumReached =
      totalMembers > 0 && total / totalMembers >= quorumPercent / 100;

    // Auto-finalize if voting period ended and still in voting state
    let state = proposal.state;
    if (
      state === "voting" &&
      proposal.votingEndsAt &&
      new Date(proposal.votingEndsAt) < new Date()
    ) {
      const passed = quorumReached && yes > no;
      state = passed ? "succeeded" : "defeated";
      await db
        .update(schema.proposals)
        .set({ state })
        .where(eq(schema.proposals.id, proposalId));
    }

    // Get current user's vote if authenticated
    let userVote: string | null = null;
    try {
      const authUser = await verifyAuth(
        request.headers.get("authorization")
      );
      const member = await db.query.members.findFirst({
        where: and(
          eq(schema.members.communityId, proposal.communityId),
          eq(schema.members.privyUserId, authUser.privyUserId)
        ),
      });
      if (member) {
        const vote = await db.query.votes.findFirst({
          where: and(
            eq(schema.votes.proposalId, proposalId),
            eq(schema.votes.memberId, member.id)
          ),
        });
        userVote = vote?.choice || null;
      }
    } catch {
      // Not authenticated — that's fine
    }

    return NextResponse.json({
      yes,
      no,
      abstain,
      total,
      totalMembers,
      quorumReached,
      quorumPercent,
      userVote,
      state,
    });
  } catch (error) {
    console.error("Tally fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch tally" },
      { status: 500 }
    );
  }
}
