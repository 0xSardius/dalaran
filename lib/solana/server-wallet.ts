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
 *
 * Loads from SERVER_WALLET_SECRET env var (JSON array of bytes)
 * for Vercel, or falls back to file-based loading for local dev.
 */
export function getServerKeypair(): Keypair {
  if (serverKeypair) return serverKeypair;

  // Prefer env var (works on Vercel serverless)
  // Accepts base64-encoded JSON array or raw JSON array
  const secretEnv = process.env.SERVER_WALLET_SECRET;
  if (secretEnv) {
    try {
      const json = secretEnv.startsWith("[")
        ? secretEnv
        : Buffer.from(secretEnv, "base64").toString("utf-8");
      const secretKey = Uint8Array.from(JSON.parse(json));
      serverKeypair = Keypair.fromSecretKey(secretKey);
      return serverKeypair;
    } catch {
      throw new Error(
        "Failed to parse SERVER_WALLET_SECRET. Use base64-encoded JSON array or raw JSON array [1,2,3,...]"
      );
    }
  }

  // Fallback: file-based loading (local dev)
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
      `Failed to load server wallet. Set SERVER_WALLET_SECRET env var ` +
        `or create ${walletPath} with: solana-keygen new -o server-wallet.json`
    );
  }
}
