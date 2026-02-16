"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // The first Solana wallet is typically the Privy embedded wallet
  const embeddedWallet = wallets[0] ?? null;
  const solanaAddress = embeddedWallet?.address ?? null;

  return {
    ready,
    authenticated,
    user,
    login,
    logout,
    solanaAddress,
    embeddedWallet,
  };
}
