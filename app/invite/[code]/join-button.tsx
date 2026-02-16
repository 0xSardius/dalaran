"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/warcraftcn/button";

interface JoinButtonProps {
  communityId: string;
  communityName: string;
}

export function JoinButton({ communityId, communityName }: JoinButtonProps) {
  const router = useRouter();
  const { ready, authenticated, login } = useAuth();
  const { getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return <Button disabled className="w-full">Loading...</Button>;
  }

  if (!authenticated) {
    return (
      <div className="space-y-2">
        <Button onClick={login} className="w-full">
          Log in to Join
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Sign in with your email to join {communityName}
        </p>
      </div>
    );
  }

  async function handleJoin() {
    setError(null);
    setLoading(true);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/realms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ communityId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join community");
      }

      router.push(`/community/${communityId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleJoin}
        disabled={loading}
        className="w-full"
        variant="frame"
      >
        {loading ? "Joining..." : "Join the Council"}
      </Button>

      {loading && (
        <p className="text-xs text-center text-muted-foreground">
          Setting up your membership. This may take a moment...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded p-3">
          {error}
        </p>
      )}
    </div>
  );
}
