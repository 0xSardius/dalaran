import { NextRequest, NextResponse } from "next/server";
import {
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
} from "@solana/spl-token";
import { SplGovernance } from "governance-idl-sdk";
import BN from "bn.js";
import { eq, and } from "drizzle-orm";

import { verifyAuth } from "@/lib/privy/verify-auth";
import { getConnection } from "@/lib/solana/connection";
import { getServerKeypair } from "@/lib/solana/server-wallet";
import { getDatabase, schema } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify auth
    const authUser = await verifyAuth(
      request.headers.get("authorization")
    );

    if (!authUser.solanaAddress) {
      return NextResponse.json(
        { error: "Account setup incomplete. Please log out and log back in." },
        { status: 400 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { communityId } = body as { communityId: string };

    if (!communityId) {
      return NextResponse.json(
        { error: "Missing communityId" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 3. Look up community
    const community = await db.query.communities.findFirst({
      where: eq(schema.communities.id, communityId),
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    if (!community.realmPubkey || !community.communityMint) {
      return NextResponse.json(
        { error: "This community is still being set up. Please try again shortly." },
        { status: 400 }
      );
    }

    // 4. Check not already a member
    const existingMember = await db.query.members.findFirst({
      where: and(
        eq(schema.members.communityId, communityId),
        eq(schema.members.privyUserId, authUser.privyUserId)
      ),
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this community" },
        { status: 409 }
      );
    }

    // 5. On-chain: mint 1 community token + deposit governing tokens
    const connection = getConnection();
    const serverKeypair = getServerKeypair();
    const governance = new SplGovernance(connection);

    const realmPubkey = new PublicKey(community.realmPubkey);
    const communityMint = new PublicKey(community.communityMint);
    const memberPubkey = new PublicKey(authUser.solanaAddress);

    // Create ATA owned by SERVER so it can sign the deposit transfer.
    // memberPubkey is set as governing token owner in the Realm (can vote).
    const ata = await getAssociatedTokenAddress(communityMint, serverKeypair.publicKey);

    const tx = new Transaction();

    // Create ATA for server (idempotent — already exists after first member joins)
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        serverKeypair.publicKey, // payer
        ata,
        serverKeypair.publicKey, // ATA owner = server
        communityMint
      )
    );

    // Mint 1 community token to the server's ATA
    tx.add(
      createMintToInstruction(
        communityMint,
        ata,
        serverKeypair.publicKey, // mint authority = server
        1
      )
    );

    // Deposit the governing token into the Realm
    // SPL Governance requires governingTokenOwner to SIGN the deposit.
    // Server wallet is the on-chain owner; voting is Postgres-backed.
    const depositIx = await governance.depositGoverningTokensInstruction(
      realmPubkey,
      communityMint,
      ata, // token source (server's ATA)
      serverKeypair.publicKey, // governing token owner = server (must sign)
      serverKeypair.publicKey, // transfer authority (server owns the ATA)
      serverKeypair.publicKey, // payer
      new BN(1)
    );

    tx.add(depositIx);

    const signature = await sendAndConfirmTransaction(connection, tx, [
      serverKeypair,
    ]);

    // 6. Derive TokenOwnerRecord PDA (server is on-chain owner)
    const tokenOwnerRecordPubkey = governance.pda.tokenOwnerRecordAccount({
      realmAccount: realmPubkey,
      governingTokenMintAccount: communityMint,
      governingTokenOwner: serverKeypair.publicKey,
    }).publicKey;

    // 7. Store member in Postgres
    const [member] = await db
      .insert(schema.members)
      .values({
        communityId,
        privyUserId: authUser.privyUserId,
        solanaAddress: authUser.solanaAddress,
        email: authUser.email,
        role: "citizen",
        tokenOwnerRecordPubkey: tokenOwnerRecordPubkey.toBase58(),
      })
      .returning();

    // Log the transaction
    await db.insert(schema.transactions).values({
      communityId,
      type: "member_join",
      signature,
      description: `${authUser.email || authUser.solanaAddress} joined the community`,
    });

    return NextResponse.json({
      memberId: member.id,
      tokenOwnerRecordPubkey: tokenOwnerRecordPubkey.toBase58(),
    });
  } catch (error) {
    console.error("Join community failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to join community",
      },
      { status: 500 }
    );
  }
}
