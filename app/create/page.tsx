"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";
import { Input } from "@/components/ui/warcraftcn/input";
import { useAuth } from "@/hooks/use-auth";

export default function CreateCommunityPage() {
  const router = useRouter();
  const { authenticated, login } = useAuth();
  const { getAccessToken } = usePrivy();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-parchment mb-4">
              You must be logged in to create a community.
            </p>
            <Button onClick={login}>Enter Dalaran</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/realms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create community");
      }

      router.push(`/community/${data.communityId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="fantasy text-2xl text-gold text-center">
            Found a New Council
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-parchment"
              >
                Community Name
              </label>
              <Input
                id="name"
                placeholder="e.g. The Silver Hand"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                required
              />
              <p className="text-xs text-muted-foreground">
                2-32 characters. Choose something your members will recognize.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-parchment"
              >
                Description
              </label>
              <Input
                id="description"
                placeholder="What is your community about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded p-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || name.length < 2}
              className="w-full"
            >
              {loading ? "Setting up your council..." : "Create Community"}
            </Button>

            {loading && (
              <p className="text-xs text-center text-muted-foreground">
                Setting up your treasury and governance. This may take a moment...
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
