import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

    const body = await request.json();
    const { communityId, title, description, type, amount, recipientAddress } =
      body as {
        communityId: string;
        title: string;
        description?: string;
        type?: string;
        amount?: string;
        recipientAddress?: string;
      };

    // Validate
    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }
    if (!title || title.length < 2 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 2-200 characters" },
        { status: 400 }
      );
    }

    const proposalType = type || "general";
    if (!["funding", "policy", "general"].includes(proposalType)) {
      return NextResponse.json(
        { error: "Type must be funding, policy, or general" },
        { status: 400 }
      );
    }

    if (proposalType === "funding") {
      if (!amount || parseFloat(amount) <= 0) {
        return NextResponse.json(
          { error: "Funding proposals require a positive amount" },
          { status: 400 }
        );
      }
      if (!recipientAddress) {
        return NextResponse.json(
          { error: "Funding proposals require a recipient" },
          { status: 400 }
        );
      }
    }

    const db = getDatabase();

    // Verify community exists
    const community = await db.query.communities.findFirst({
      where: eq(schema.communities.id, communityId),
    });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Verify user is a member
    const member = await db.query.members.findFirst({
      where: and(
        eq(schema.members.communityId, communityId),
        eq(schema.members.privyUserId, authUser.privyUserId)
      ),
    });
    if (!member) {
      return NextResponse.json(
        { error: "You must be a member of this community" },
        { status: 403 }
      );
    }

    // Calculate voting end time
    const votingEndsAt = new Date();
    votingEndsAt.setHours(
      votingEndsAt.getHours() + community.votingPeriodHours
    );

    // Create proposal — goes directly to "voting" state for hackathon
    const [proposal] = await db
      .insert(schema.proposals)
      .values({
        communityId,
        title,
        description: description || "",
        type: proposalType,
        amount: proposalType === "funding" ? amount : null,
        recipientAddress: proposalType === "funding" ? recipientAddress : null,
        state: "voting",
        createdBy: member.id,
        votingEndsAt,
      })
      .returning();

    // Log transaction
    await db.insert(schema.transactions).values({
      communityId,
      proposalId: proposal.id,
      type: "proposal_created",
      signature: `proposal-${proposal.id}`,
      description: `Created proposal: "${title}"`,
    });

    return NextResponse.json({ proposalId: proposal.id });
  } catch (error) {
    console.error("Proposal creation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create proposal",
      },
      { status: 500 }
    );
  }
}
