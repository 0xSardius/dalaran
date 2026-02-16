import { PrivyClient } from "@privy-io/server-auth";

let privyClient: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
  if (!privyClient) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error("Missing Privy environment variables");
    }
    privyClient = new PrivyClient(appId, appSecret);
  }
  return privyClient;
}

export interface AuthUser {
  privyUserId: string;
  solanaAddress: string | null;
  email: string | null;
}

export async function verifyAuth(
  authHeader: string | null
): Promise<AuthUser> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  const client = getPrivyClient();
  const verifiedClaims = await client.verifyAuthToken(token);

  const user = await client.getUser(verifiedClaims.userId);

  // Find the Solana embedded wallet
  let solanaAddress: string | null = null;
  let email: string | null = null;

  for (const account of user.linkedAccounts) {
    if (account.type === "wallet" && "chainType" in account) {
      const walletAccount = account as { type: "wallet"; chainType: string; address: string };
      if (walletAccount.chainType === "solana") {
        solanaAddress = walletAccount.address;
      }
    }
    if (account.type === "email" && "address" in account) {
      email = (account as { type: "email"; address: string }).address;
    }
  }

  return {
    privyUserId: verifiedClaims.userId,
    solanaAddress,
    email,
  };
}
