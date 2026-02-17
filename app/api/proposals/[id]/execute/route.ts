import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getDatabase, schema } from "@/lib/db";
import { getConnection } from "@/lib/solana/connection";
import { getServerKeypair } from "@/lib/solana/server-wallet";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: proposalId } = await context.params;
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

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

    // Verify state
    if (proposal.state !== "succeeded") {
      return NextResponse.json(
        { error: "Only passed proposals can be executed" },
        { status: 400 }
      );
    }

    // Verify type is funding
    if (proposal.type !== "funding") {
      return NextResponse.json(
        { error: "Only funding proposals can be executed" },
        { status: 400 }
      );
    }

    // Verify user is archmage or councilor
    const member = await db.query.members.findFirst({
      where: and(
        eq(schema.members.communityId, proposal.communityId),
        eq(schema.members.privyUserId, authUser.privyUserId)
      ),
    });
    if (!member) {
      return NextResponse.json(
        { error: "You must be a member" },
        { status: 403 }
      );
    }
    if (!["archmage", "councilor"].includes(member.role)) {
      return NextResponse.json(
        { error: "Only Archmages and Councilors can execute proposals" },
        { status: 403 }
      );
    }

    // Validate amount and recipient
    if (!proposal.amount || !proposal.recipientAddress) {
      return NextResponse.json(
        { error: "Proposal missing amount or recipient" },
        { status: 400 }
      );
    }

    const amountSol = parseFloat(proposal.amount);
    const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
    const recipientPubkey = new PublicKey(proposal.recipientAddress);

    // Get community for treasury address
    const community = await db.query.communities.findFirst({
      where: eq(schema.communities.id, proposal.communityId),
    });
    if (!community?.treasuryPubkey) {
      return NextResponse.json(
        { error: "Community treasury not found" },
        { status: 400 }
      );
    }

    const connection = getConnection();
    const serverKeypair = getServerKeypair();
    const treasuryPubkey = new PublicKey(community.treasuryPubkey);

    // For hackathon: direct SOL transfer from server wallet as a simplified
    // execution model. In production, this would go through SPL Governance's
    // ExecuteTransaction instruction with the treasury PDA.
    //
    // Check treasury balance first
    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    if (treasuryBalance < lamports) {
      // Fallback: transfer from server wallet if treasury is underfunded (devnet demo)
      const serverBalance = await connection.getBalance(serverKeypair.publicKey);
      if (serverBalance < lamports + 5000) {
        return NextResponse.json(
          {
            error: `Insufficient funds. Treasury has ${treasuryBalance / LAMPORTS_PER_SOL} SOL, server has ${serverBalance / LAMPORTS_PER_SOL} SOL. Need ${amountSol} SOL.`,
          },
          { status: 400 }
        );
      }

      // Transfer from server wallet (devnet hack)
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: serverKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      );

      const signature = await sendAndConfirmTransaction(connection, tx, [
        serverKeypair,
      ]);

      // Update proposal state
      await db
        .update(schema.proposals)
        .set({ state: "completed" })
        .where(eq(schema.proposals.id, proposalId));

      // Log transaction
      await db.insert(schema.transactions).values({
        communityId: proposal.communityId,
        proposalId,
        type: "withdrawal",
        amount: proposal.amount,
        signature,
        description: `Executed proposal: "${proposal.title}" — ${amountSol} SOL to ${proposal.recipientAddress}`,
      });

      return NextResponse.json({
        signature,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      });
    }

    // If treasury has funds, this would use SPL Governance ExecuteTransaction.
    // For hackathon simplicity, we still use server wallet.
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: serverKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [
      serverKeypair,
    ]);

    // Update proposal state
    await db
      .update(schema.proposals)
      .set({ state: "completed" })
      .where(eq(schema.proposals.id, proposalId));

    // Log transaction
    await db.insert(schema.transactions).values({
      communityId: proposal.communityId,
      proposalId,
      type: "withdrawal",
      amount: proposal.amount,
      signature,
      description: `Executed proposal: "${proposal.title}" — ${amountSol} SOL to ${proposal.recipientAddress}`,
    });

    return NextResponse.json({
      signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error) {
    console.error("Proposal execution failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to execute proposal",
      },
      { status: 500 }
    );
  }
}
