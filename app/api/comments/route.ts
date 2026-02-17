import { NextRequest, NextResponse } from "next/server";
import { eq, and, asc, sql } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";

// GET — fetch comments for a proposal
export async function GET(request: NextRequest) {
  try {
    const proposalId = request.nextUrl.searchParams.get("proposalId");
    if (!proposalId) {
      return NextResponse.json(
        { error: "proposalId query param is required" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const commentRows = await db.query.comments.findMany({
      where: eq(schema.comments.proposalId, proposalId),
      orderBy: [asc(schema.comments.createdAt)],
    });

    // Get author info
    const authorIds = [...new Set(commentRows.map((c) => c.authorId))];
    const authorsMap: Record<
      string,
      { email: string | null; role: string }
    > = {};
    if (authorIds.length > 0) {
      const authorRows = await db.query.members.findMany({
        where: sql`${schema.members.id} IN (${sql.join(
          authorIds.map((aid) => sql`${aid}`),
          sql`, `
        )})`,
      });
      for (const a of authorRows) {
        authorsMap[a.id] = { email: a.email, role: a.role };
      }
    }

    const comments = commentRows.map((c) => ({
      id: c.id,
      proposalId: c.proposalId,
      parentId: c.parentId,
      authorId: c.authorId,
      authorEmail: authorsMap[c.authorId]?.email || "Community member",
      authorRole: authorsMap[c.authorId]?.role || "citizen",
      body: c.body,
      reactions: c.reactions || {},
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comments fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST — create a new comment
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

    const body = await request.json();
    const { proposalId, parentId, body: commentBody } = body as {
      proposalId: string;
      parentId?: string;
      body: string;
    };

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }
    if (!commentBody || commentBody.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }
    if (commentBody.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be under 2000 characters" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verify proposal exists
    const proposal = await db.query.proposals.findFirst({
      where: eq(schema.proposals.id, proposalId),
    });
    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
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
        { error: "You must be a member to comment" },
        { status: 403 }
      );
    }

    const [comment] = await db
      .insert(schema.comments)
      .values({
        proposalId,
        parentId: parentId || null,
        authorId: member.id,
        body: commentBody.trim(),
        reactions: {},
      })
      .returning();

    return NextResponse.json({
      comment: {
        id: comment.id,
        proposalId: comment.proposalId,
        parentId: comment.parentId,
        authorId: comment.authorId,
        authorEmail: member.email || "Community member",
        authorRole: member.role,
        body: comment.body,
        reactions: comment.reactions || {},
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Comment creation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create comment",
      },
      { status: 500 }
    );
  }
}
