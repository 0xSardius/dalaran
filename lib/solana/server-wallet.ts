import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";

let serverKeypair: Keypair | null = null;

/**
 * Get the server keypair for signing transactions.
 * This is a devnet-only keypair used to:
 * - Create mints (as mint authority)
 * - Create Realms (as payer)
 * - Mint governance tokens to new members
 *
 * TRADEOFF: Centralized signing for speed. In production,
 * users would sign with their own embedded wallets.
 */
export function getServerKeypair(): Keypair {
  if (serverKeypair) return serverKeypair;

  const walletPath =
    process.env.SERVER_WALLET_PATH ||
    path.join(process.cwd(), "server-wallet.json");

  try {
    const raw = fs.readFileSync(walletPath, "utf-8");
    const secretKey = Uint8Array.from(JSON.parse(raw));
    serverKeypair = Keypair.fromSecretKey(secretKey);
    return serverKeypair;
  } catch {
    throw new Error(
      `Failed to load server wallet from ${walletPath}. ` +
        `Generate one with: solana-keygen new -o server-wallet.json`
    );
  }
}
