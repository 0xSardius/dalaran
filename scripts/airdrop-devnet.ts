/**
 * Devnet airdrop script — airdrops SOL to server wallet and optionally a treasury PDA.
 *
 * Usage:
 *   npx tsx scripts/airdrop-devnet.ts [treasury-pubkey]
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";

async function main() {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  // Load server wallet
  const walletPath = process.env.SERVER_WALLET_PATH || path.join(process.cwd(), "server-wallet.json");

  let serverKeypair: Keypair;
  try {
    const raw = fs.readFileSync(walletPath, "utf-8");
    const secretKey = Uint8Array.from(JSON.parse(raw));
    serverKeypair = Keypair.fromSecretKey(secretKey);
  } catch {
    console.error(`Failed to load server wallet from ${walletPath}`);
    console.error("Generate one with: solana-keygen new -o server-wallet.json");
    process.exit(1);
  }

  console.log(`Server wallet: ${serverKeypair.publicKey.toBase58()}`);

  // Airdrop to server wallet
  console.log("Airdropping 2 SOL to server wallet...");
  try {
    const sig = await connection.requestAirdrop(serverKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig);
    console.log(`  Done! Signature: ${sig}`);
  } catch (err) {
    console.error("  Airdrop failed (rate limited?):", (err as Error).message);
  }

  const serverBalance = await connection.getBalance(serverKeypair.publicKey);
  console.log(`  Server wallet balance: ${serverBalance / LAMPORTS_PER_SOL} SOL`);

  // Optionally airdrop to treasury PDA
  const treasuryArg = process.argv[2];
  if (treasuryArg) {
    const treasuryPubkey = new PublicKey(treasuryArg);
    console.log(`\nAirdropping 2 SOL to treasury: ${treasuryPubkey.toBase58()}`);
    try {
      const sig = await connection.requestAirdrop(treasuryPubkey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig);
      console.log(`  Done! Signature: ${sig}`);
    } catch (err) {
      console.error("  Airdrop failed:", (err as Error).message);
    }

    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    console.log(`  Treasury balance: ${treasuryBalance / LAMPORTS_PER_SOL} SOL`);
  }

  console.log("\nDone!");
}

main().catch(console.error);
