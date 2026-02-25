"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent } from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";
import { Input } from "@/components/ui/warcraftcn/input";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

const COMMUNITY_TYPES = [
  { value: "club", label: "Club or Group", icon: "🏰" },
  { value: "dao", label: "DAO", icon: "⚔️" },
  { value: "team", label: "Team or Org", icon: "🛡️" },
  { value: "other", label: "Other", icon: "🔮" },
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const { authenticated, login } = useAuth();
  const { getAccessToken } = usePrivy();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [communityType, setCommunityType] = useState("club");
  const [quorumPercent, setQuorumPercent] = useState(60);
  const [votingPeriodHours, setVotingPeriodHours] = useState(72);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 px-8 text-center">
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
        body: JSON.stringify({
          name,
          description,
          quorumPercent,
          votingPeriodHours,
        }),
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-parchment mb-6 inline-block"
        >
          &larr; Back to home
        </Link>

        <Card>
          <CardContent className="pt-8 pb-6 px-8">
            <h1 className="fantasy text-2xl text-gold text-center mb-6">
              Found a New Council
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Community Name */}
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

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-parchment"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="What is your community about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-md border border-border bg-dark-surface px-3 py-2 text-sm text-parchment placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
              </div>

              {/* Community Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-parchment">
                  Community Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMMUNITY_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setCommunityType(ct.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm transition-colors ${
                        communityType === ct.value
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-border bg-dark-surface text-parchment-dark hover:border-gold/50"
                      }`}
                    >
                      <span>{ct.icon}</span>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Governance Settings */}
              <div className="space-y-4 border-t border-border/50 pt-4">
                <p className="text-sm font-medium text-parchment">
                  Governance Settings
                </p>

                {/* Quorum */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="quorum"
                      className="text-xs text-muted-foreground"
                    >
                      Quorum (% of members needed to vote)
                    </label>
                    <span className="text-sm text-gold fantasy">
                      {quorumPercent}%
                    </span>
                  </div>
                  <input
                    id="quorum"
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={quorumPercent}
                    onChange={(e) => setQuorumPercent(Number(e.target.value))}
                    className="w-full accent-[#C9A959]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Voting Period */}
                <div className="space-y-2">
                  <label
                    htmlFor="votingPeriod"
                    className="text-xs text-muted-foreground"
                  >
                    Voting Period
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { hours: 24, label: "1 Day" },
                      { hours: 72, label: "3 Days" },
                      { hours: 168, label: "7 Days" },
                    ].map((opt) => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => setVotingPeriodHours(opt.hours)}
                        className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                          votingPeriodHours === opt.hours
                            ? "border-gold bg-gold/15 text-gold"
                            : "border-border bg-dark-surface text-parchment-dark hover:border-gold/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                  Setting up your treasury and governance on Solana. This may take a moment...
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
