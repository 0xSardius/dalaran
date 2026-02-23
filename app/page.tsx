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
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";

interface MyCommunity {
  id: string;
  name: string;
  description: string;
  role: string;
}

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl w-full">
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

          {authenticated && communities.length > 0 && (
            <div className="w-full max-w-md space-y-3 mt-4">
              <h2 className="fantasy text-lg text-parchment">
                Your Communities
              </h2>
              {communities.map((c) => (
                <Link key={c.id} href={`/community/${c.id}`}>
                  <Card className="cursor-pointer hover:border-gold/50 transition-colors">
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div className="text-left">
                        <p className="font-medium text-parchment">{c.name}</p>
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
              <Button variant="frame">
                {communities.length > 0
                  ? "Create Another Community"
                  : "Create a Community"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
