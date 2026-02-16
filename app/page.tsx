"use client";

import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/warcraftcn/button";

export default function Home() {
  const { authenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="fantasy text-5xl md:text-6xl font-bold text-gold mb-4">
          Dalaran
        </h1>
        <p className="text-lg text-parchment-dark mb-2">
          Collective Treasury & Governance
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Pool funds, debate proposals, and vote on how your community spends
          its money. No crypto knowledge required.
        </p>

        <div className="flex flex-col items-center gap-4">
          <LoginButton />
          {authenticated && (
            <Link href="/create">
              <Button variant="frame">
                Create a Community
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
