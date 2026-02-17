import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { PublicKey } from "@solana/web3.js";

import { getDatabase, schema } from "@/lib/db";
import { getConnection } from "@/lib/solana/connection";

interface RouteContext {
  params: Promise<{ communityId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { communityId } = await context.params;
    const db = getDatabase();

    const community = await db.query.communities.findFirst({
      where: eq(schema.communities.id, communityId),
    });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    if (!community.treasuryPubkey) {
      return NextResponse.json({
        solBalance: 0,
        usdcBalance: 0,
        treasuryAddress: null,
      });
    }

    const connection = getConnection();
    const treasuryPubkey = new PublicKey(community.treasuryPubkey);

    // Get SOL balance
    let solBalance = 0;
    try {
      const lamports = await connection.getBalance(treasuryPubkey);
      solBalance = lamports / 1e9; // Convert lamports to SOL
    } catch {
      // Treasury might not exist yet on chain
    }

    // Try to get USDC balance (devnet USDC mint)
    let usdcBalance = 0;
    try {
      const { getAssociatedTokenAddress } = await import("@solana/spl-token");
      // Devnet USDC mint
      const USDC_MINT = new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
      );
      const ata = await getAssociatedTokenAddress(USDC_MINT, treasuryPubkey, true);
      const tokenBalance = await connection.getTokenAccountBalance(ata);
      usdcBalance = parseFloat(tokenBalance.value.uiAmountString || "0");
    } catch {
      // No USDC ATA — that's fine
    }

    return NextResponse.json({
      solBalance,
      usdcBalance,
      treasuryAddress: community.treasuryPubkey,
    });
  } catch (error) {
    console.error("Treasury fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch treasury balance" },
      { status: 500 }
    );
  }
}
