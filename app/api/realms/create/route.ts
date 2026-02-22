import { NextRequest, NextResponse } from "next/server";
import {
  Keypair,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMint2Instruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { SplGovernance } from "governance-idl-sdk";
import BN from "bn.js";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

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
    const { name, description } = body as {
      name: string;
      description: string;
    };

    if (!name || name.length < 2 || name.length > 32) {
      return NextResponse.json(
        { error: "Community name must be 2-32 characters" },
        { status: 400 }
      );
    }

    // On-chain realm name gets a short suffix to avoid PDA collisions on devnet
    const realmName = `${name}-${nanoid(4)}`;

    const connection = getConnection();
    const serverKeypair = getServerKeypair();

    // 3. Create community token mint (for Citizens — 1 member = 1 token = 1 vote)
    const communityMintKeypair = Keypair.generate();
    const councilMintKeypair = Keypair.generate();

    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    // Build transaction: create both mints + create Realm
    const tx = new Transaction();

    // Create community mint account
    tx.add(
      ...createMintInstructions(
        serverKeypair.publicKey,
        communityMintKeypair.publicKey,
        serverKeypair.publicKey, // mint authority = server
        mintRent
      )
    );

    // Create council mint account
    tx.add(
      ...createMintInstructions(
        serverKeypair.publicKey,
        councilMintKeypair.publicKey,
        serverKeypair.publicKey, // mint authority = server
        mintRent
      )
    );

    // 4. Create Realm instruction via governance-idl-sdk
    const governance = new SplGovernance(connection);

    const createRealmIx = await governance.createRealmInstruction(
      realmName,
      communityMintKeypair.publicKey,
      new BN(1), // minCommunityWeightToCreateGovernance = 1 token
      serverKeypair.publicKey, // payer
      { type: "supplyFraction", amount: new BN(Math.pow(10, 10)) }, // 100% supply
      councilMintKeypair.publicKey,
      "membership", // community tokens are membership (non-withdrawable)
      "membership" // council tokens are membership
    );

    tx.add(createRealmIx);

    // 5. Send transaction
    const realmPubkey = governance.pda.realmAccount({ name: realmName }).publicKey;

    const signature = await sendAndConfirmTransaction(connection, tx, [
      serverKeypair,
      communityMintKeypair,
      councilMintKeypair,
    ]);

    // 6. Now create a Governance account for the Realm
    // We need to deposit a council token for the creator first,
    // then create governance. For hackathon, we'll do this in a second tx.

    // Mint 1 council token to creator + deposit
    const creatorPubkey = new PublicKey(authUser.solanaAddress);

    const {
      signature: depositSig,
      tokenOwnerRecordPubkey,
    } = await mintAndDepositGovernanceToken(
      connection,
      governance,
      serverKeypair,
      realmPubkey,
      councilMintKeypair.publicKey,
      creatorPubkey
    );

    // 7. Create Governance account (treasury config)
    const governanceSeed = Keypair.generate().publicKey;
    const createGovIx = await governance.createGovernanceInstruction(
      {
        communityVoteThreshold: { yesVotePercentage: [60] },
        minCommunityWeightToCreateProposal: new BN(1),
        minTransactionHoldUpTime: 0,
        votingBaseTime: 259200, // 72 hours
        communityVoteTipping: { strict: {} },
        councilVoteThreshold: { yesVotePercentage: [60] },
        councilVetoVoteThreshold: { disabled: {} },
        communityVetoVoteThreshold: { disabled: {} },
        councilVoteTipping: { strict: {} },
        minCouncilWeightToCreateProposal: new BN(1),
        depositExemptProposalCount: 10,
        votingCoolOffTime: 0,
      } as any,
      realmPubkey,
      serverKeypair.publicKey, // realm authority (server for now)
      tokenOwnerRecordPubkey,
      serverKeypair.publicKey, // payer
      governanceSeed
    );

    const govTx = new Transaction().add(createGovIx);
    const govSig = await sendAndConfirmTransaction(connection, govTx, [
      serverKeypair,
    ]);

    const governancePubkey = governance.pda.governanceAccount({
      realmAccount: realmPubkey,
      seed: governanceSeed,
    }).publicKey;

    // Create native treasury for the governance
    const createTreasuryIx =
      await governance.createNativeTreasuryInstruction(
        governancePubkey,
        serverKeypair.publicKey
      );
    const treasuryTx = new Transaction().add(createTreasuryIx);
    await sendAndConfirmTransaction(connection, treasuryTx, [serverKeypair]);

    const treasuryPubkey = governance.pda.nativeTreasuryAccount({
      governanceAccount: governancePubkey,
    }).publicKey;

    // 8. Store in Postgres
    const db = getDatabase();
    const inviteCode = nanoid(10);

    const [community] = await db
      .insert(schema.communities)
      .values({
        name,
        description: description || "",
        realmPubkey: realmPubkey.toBase58(),
        communityMint: communityMintKeypair.publicKey.toBase58(),
        councilMint: councilMintKeypair.publicKey.toBase58(),
        governancePubkey: governancePubkey.toBase58(),
        treasuryPubkey: treasuryPubkey.toBase58(),
        inviteCode,
        createdBy: authUser.privyUserId,
      })
      .returning();

    // Add creator as archmage
    await db.insert(schema.members).values({
      communityId: community.id,
      privyUserId: authUser.privyUserId,
      solanaAddress: authUser.solanaAddress,
      email: authUser.email,
      role: "archmage",
      tokenOwnerRecordPubkey: tokenOwnerRecordPubkey.toBase58(),
    });

    // Log the transaction
    await db.insert(schema.transactions).values({
      communityId: community.id,
      type: "realm_creation",
      signature,
      description: `Created realm "${name}"`,
    });

    return NextResponse.json({
      communityId: community.id,
      realmPubkey: realmPubkey.toBase58(),
      inviteCode,
      governancePubkey: governancePubkey.toBase58(),
      treasuryPubkey: treasuryPubkey.toBase58(),
    });
  } catch (error) {
    console.error("Realm creation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create community",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: create SystemProgram + InitializeMint2 instructions
 */
function createMintInstructions(
  payer: PublicKey,
  mintPubkey: PublicKey,
  mintAuthority: PublicKey,
  lamports: number
) {
  const { SystemProgram } = require("@solana/web3.js");
  return [
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintPubkey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(
      mintPubkey,
      0, // 0 decimals — 1 token = 1 vote
      mintAuthority,
      null, // no freeze authority
      TOKEN_PROGRAM_ID
    ),
  ];
}

/**
 * Helper: Mint 1 governance token and deposit it into the Realm
 * Returns the token owner record PDA
 */
async function mintAndDepositGovernanceToken(
  connection: import("@solana/web3.js").Connection,
  governance: SplGovernance,
  serverKeypair: Keypair,
  realmPubkey: PublicKey,
  mintPubkey: PublicKey,
  ownerPubkey: PublicKey
): Promise<{
  signature: string;
  tokenOwnerRecordPubkey: PublicKey;
}> {
  const {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createMintToInstruction,
  } = await import("@solana/spl-token");

  // Create ATA owned by SERVER so it can sign the transfer.
  // The ownerPubkey is set as governing token owner in the Realm (can vote),
  // but doesn't need to sign the deposit transaction.
  const ata = await getAssociatedTokenAddress(mintPubkey, serverKeypair.publicKey);

  const tx = new Transaction();

  // Create ATA for server
  tx.add(
    createAssociatedTokenAccountInstruction(
      serverKeypair.publicKey, // payer
      ata,
      serverKeypair.publicKey, // ATA owner = server
      mintPubkey
    )
  );

  // Mint 1 token to the server's ATA
  tx.add(
    createMintToInstruction(
      mintPubkey,
      ata,
      serverKeypair.publicKey, // mint authority
      1
    )
  );

  // Deposit the governing token into the Realm
  // SPL Governance requires governingTokenOwner to SIGN the deposit instruction.
  // Since we don't have the user's Privy wallet private key on the server,
  // we use the server wallet as the on-chain governing token owner.
  // Voting is Postgres-backed for the hackathon, so on-chain ownership is cosmetic.
  const depositIx = await governance.depositGoverningTokensInstruction(
    realmPubkey,
    mintPubkey,
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

  // Store the on-chain TokenOwnerRecord PDA (server is the on-chain owner)
  const tokenOwnerRecordPubkey = governance.pda.tokenOwnerRecordAccount({
    realmAccount: realmPubkey,
    governingTokenMintAccount: mintPubkey,
    governingTokenOwner: serverKeypair.publicKey,
  }).publicKey;

  return { signature, tokenOwnerRecordPubkey };
}
