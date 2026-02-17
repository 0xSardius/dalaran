import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";

import { getDatabase, schema } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const communityId = request.nextUrl.searchParams.get("communityId");
    if (!communityId) {
      return NextResponse.json(
        { error: "communityId query param is required" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Fetch proposals with vote tallies
    const proposalRows = await db
      .select({
        id: schema.proposals.id,
        title: schema.proposals.title,
        description: schema.proposals.description,
        type: schema.proposals.type,
        amount: schema.proposals.amount,
        recipientAddress: schema.proposals.recipientAddress,
        state: schema.proposals.state,
        createdBy: schema.proposals.createdBy,
        createdAt: schema.proposals.createdAt,
        votingEndsAt: schema.proposals.votingEndsAt,
        aiSummary: schema.proposals.aiSummary,
        aiSummaryUpdatedAt: schema.proposals.aiSummaryUpdatedAt,
        yesVotes: sql<number>`coalesce(sum(case when ${schema.votes.choice} = 'yes' then 1 else 0 end), 0)::int`,
        noVotes: sql<number>`coalesce(sum(case when ${schema.votes.choice} = 'no' then 1 else 0 end), 0)::int`,
        abstainVotes: sql<number>`coalesce(sum(case when ${schema.votes.choice} = 'abstain' then 1 else 0 end), 0)::int`,
      })
      .from(schema.proposals)
      .leftJoin(schema.votes, eq(schema.proposals.id, schema.votes.proposalId))
      .where(eq(schema.proposals.communityId, communityId))
      .groupBy(schema.proposals.id)
      .orderBy(desc(schema.proposals.createdAt));

    // Get creator info for each proposal
    const memberIds = [...new Set(proposalRows.map((p) => p.createdBy))];
    const membersMap: Record<string, { email: string | null; role: string }> = {};
    if (memberIds.length > 0) {
      const memberRows = await db.query.members.findMany({
        where: sql`${schema.members.id} IN (${sql.join(
          memberIds.map((id) => sql`${id}`),
          sql`, `
        )})`,
      });
      for (const m of memberRows) {
        membersMap[m.id] = { email: m.email, role: m.role };
      }
    }

    const proposals = proposalRows.map((p) => ({
      ...p,
      createdByEmail: membersMap[p.createdBy]?.email || "Community member",
      createdByRole: membersMap[p.createdBy]?.role || "citizen",
      totalVotes: p.yesVotes + p.noVotes + p.abstainVotes,
    }));

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Proposals fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
