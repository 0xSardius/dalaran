"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/warcraftcn/button";

export function LoginButton() {
  const { ready, authenticated, login, logout, user } = useAuth();

  if (!ready) {
    return (
      <Button disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-parchment-dark">
          {user?.email?.address ?? "Adventurer"}
        </span>
        <Button onClick={logout}>
          Leave
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={login}>
      Enter Dalaran
    </Button>
  );
}
