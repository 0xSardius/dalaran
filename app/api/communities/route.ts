import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

    const db = getDatabase();

    // Find all communities this user is a member of
    const memberRows = await db.query.members.findMany({
      where: eq(schema.members.privyUserId, authUser.privyUserId),
    });

    if (memberRows.length === 0) {
      return NextResponse.json({ communities: [] });
    }

    const communityIds = memberRows.map((m) => m.communityId);
    const communityRows = await db.query.communities.findMany();

    const myCommunities = communityRows
      .filter((c) => communityIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        role: memberRows.find((m) => m.communityId === c.id)?.role || "citizen",
      }));

    return NextResponse.json({ communities: myCommunities });
  } catch (error) {
    console.error("Fetch communities failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch communities" },
      { status: 500 }
    );
  }
}
