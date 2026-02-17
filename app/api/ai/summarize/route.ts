import { NextRequest, NextResponse } from "next/server";
import { eq, asc, sql } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";
import { generateKeeperSummary } from "@/lib/ai/keeper";

export async function POST(request: NextRequest) {
  try {
    // Auth is optional but good to verify the requester
    await verifyAuth(request.headers.get("authorization"));

    const body = await request.json();
    const { proposalId } = body as { proposalId: string };

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }

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

    // Rate limit: only generate if last summary is >5 minutes old
    if (proposal.aiSummaryUpdatedAt) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (new Date(proposal.aiSummaryUpdatedAt) > fiveMinutesAgo) {
        return NextResponse.json({
          summary: proposal.aiSummary,
          updatedAt: proposal.aiSummaryUpdatedAt,
          cached: true,
        });
      }
    }

    // Fetch comments
    const commentRows = await db.query.comments.findMany({
      where: eq(schema.comments.proposalId, proposalId),
      orderBy: [asc(schema.comments.createdAt)],
    });

    if (commentRows.length === 0 && proposal.aiSummary) {
      return NextResponse.json({
        summary: proposal.aiSummary,
        updatedAt: proposal.aiSummaryUpdatedAt,
        cached: true,
      });
    }

    // Get author info
    const authorIds = [...new Set(commentRows.map((c) => c.authorId))];
    const authorsMap: Record<string, string> = {};
    if (authorIds.length > 0) {
      const authorRows = await db.query.members.findMany({
        where: sql`${schema.members.id} IN (${sql.join(
          authorIds.map((aid) => sql`${aid}`),
          sql`, `
        )})`,
      });
      for (const a of authorRows) {
        authorsMap[a.id] = a.email || "Community member";
      }
    }

    const comments = commentRows.map((c) => ({
      authorEmail: authorsMap[c.authorId] || "Community member",
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

    // Generate summary
    const summary = await generateKeeperSummary(
      proposal.title,
      proposal.description,
      comments
    );

    // Store in DB
    const now = new Date();
    await db
      .update(schema.proposals)
      .set({ aiSummary: summary, aiSummaryUpdatedAt: now })
      .where(eq(schema.proposals.id, proposalId));

    return NextResponse.json({
      summary,
      updatedAt: now.toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error("Keeper summary failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}
