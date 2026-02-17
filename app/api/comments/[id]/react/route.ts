import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";

const VALID_REACTIONS = ["⚔️", "🛡️", "🤔", "❤️"];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: commentId } = await context.params;
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

    const body = await request.json();
    const { reaction } = body as { reaction: string };

    if (!VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json(
        { error: "Invalid reaction" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const comment = await db.query.comments.findFirst({
      where: eq(schema.comments.id, commentId),
    });
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Get the proposal to find the community
    const proposal = await db.query.proposals.findFirst({
      where: eq(schema.proposals.id, comment.proposalId),
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
        { error: "You must be a member to react" },
        { status: 403 }
      );
    }

    // Toggle reaction
    const reactions = (comment.reactions as Record<string, string[]>) || {};
    const reactionList = reactions[reaction] || [];

    if (reactionList.includes(member.id)) {
      // Remove reaction
      reactions[reaction] = reactionList.filter((id) => id !== member.id);
      if (reactions[reaction].length === 0) {
        delete reactions[reaction];
      }
    } else {
      // Add reaction
      reactions[reaction] = [...reactionList, member.id];
    }

    await db
      .update(schema.comments)
      .set({ reactions })
      .where(eq(schema.comments.id, commentId));

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error("Reaction toggle failed:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
