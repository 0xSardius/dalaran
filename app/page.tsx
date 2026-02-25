"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/warcraftcn/button";
import {
  Card,
  CardContent,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";

interface MyCommunity {
  id: string;
  name: string;
  description: string;
  role: string;
}

const PILLARS = [
  {
    icon: "💰",
    title: "Pool",
    description: "Combine resources into a shared war chest that the community controls together.",
  },
  {
    icon: "💬",
    title: "Discuss",
    description: "Debate proposals in threaded discussions with reactions and AI-powered summaries.",
  },
  {
    icon: "🗳️",
    title: "Decide",
    description: "Vote on how funds are spent. One member, one vote. Quorum ensures legitimacy.",
  },
  {
    icon: "⚡",
    title: "Act",
    description: "Execute passed proposals and transfer funds directly from the treasury.",
  },
];

export default function Home() {
  const { authenticated } = useAuth();
  const { getAccessToken } = usePrivy();
  const [communities, setCommunities] = useState<MyCommunity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      setCommunities([]);
      return;
    }
    setLoading(true);
    getAccessToken().then((token) =>
      fetch("/api/communities", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCommunities(data.communities || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    );
  }, [authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl w-full">
          <p className="text-sm text-gold/70 tracking-widest uppercase mb-4">
            Collective Treasury & Governance
          </p>
          <h1 className="fantasy text-6xl md:text-7xl font-bold text-gold mb-6">
            Dalaran
          </h1>
          <p className="text-lg text-parchment-dark max-w-lg mx-auto mb-8 leading-relaxed">
            Pool funds, debate proposals, and vote on how your community
            spends its money. No crypto knowledge required.
          </p>

          <div className="flex flex-col items-center gap-4">
            <LoginButton />

            {authenticated && communities.length > 0 && (
              <div className="w-full max-w-md space-y-3 mt-4">
                <h2 className="fantasy text-lg text-parchment">
                  Your Communities
                </h2>
                {communities.map((c) => (
                  <Link key={c.id} href={`/community/${c.id}`}>
                    <Card className="cursor-pointer hover:border-gold/50 transition-colors">
                      <CardContent className="flex items-center justify-between pt-6 pb-4 px-6">
                        <div className="text-left">
                          <p className="font-medium text-parchment fantasy">
                            {c.name}
                          </p>
                          {c.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {c.description}
                            </p>
                          )}
                        </div>
                        <Badge size="sm" variant="outline">
                          {c.role}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {authenticated && !loading && (
              <Link href="/create">
                <Button variant="frame" className="px-6">
                  {communities.length > 0
                    ? "Create Another Community"
                    : "Create a Community"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="fantasy text-2xl text-gold text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PILLARS.map((pillar) => (
              <Card key={pillar.title}>
                <CardContent className="pt-8 pb-6 px-5 text-center">
                  <span className="text-3xl mb-3 block">{pillar.icon}</span>
                  <h3 className="fantasy text-lg text-gold mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          Built on Realms. Powered by Solana. Usable by everyone.
        </p>
      </footer>
    </div>
  );
}
