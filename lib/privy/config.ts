import type { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email"],
  appearance: {
    theme: "dark",
    accentColor: "#C9A959",
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    solana: {
      createOnLogin: "all-users",
    },
  },
};
