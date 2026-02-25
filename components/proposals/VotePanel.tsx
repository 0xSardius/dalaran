"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
} from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { useAuth } from "@/hooks/use-auth";

interface VotePanelProps {
  proposalId: string;
  communityId: string;
  state: string;
  votingEndsAt: string | null;
  quorumPercent: number;
  totalMembers: number;
}

interface TallyData {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  totalMembers: number;
  quorumReached: boolean;
  quorumPercent: number;
  userVote: string | null;
  state: string;
}

export function VotePanel({
  proposalId,
  communityId,
  state: initialState,
  votingEndsAt,
  quorumPercent,
  totalMembers: initialTotalMembers,
}: VotePanelProps) {
  const { authenticated } = useAuth();
  const { getAccessToken } = usePrivy();

  const [tally, setTally] = useState<TallyData>({
    yes: 0,
    no: 0,
    abstain: 0,
    total: 0,
    totalMembers: initialTotalMembers,
    quorumReached: false,
    quorumPercent,
    userVote: null,
    state: initialState,
  });
  const [voting, setVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const fetchTally = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (authenticated) {
        try {
          const token = await getAccessToken();
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch { /* ignore */ }
      }
      const res = await fetch(`/api/proposals/${proposalId}/tally`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setTally(data);
      }
    } catch { /* ignore */ }
  }, [proposalId, authenticated, getAccessToken]);

  // Fetch tally on mount + poll every 10s
  useEffect(() => {
    fetchTally();
    const interval = setInterval(fetchTally, 10000);
    return () => clearInterval(interval);
  }, [fetchTally]);

  // Countdown timer
  useEffect(() => {
    if (!votingEndsAt) return;
    function update() {
      const diff = new Date(votingEndsAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Voting ended");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setTimeLeft(`${d}d ${h % 24}h ${m}m remaining`);
      } else {
        setTimeLeft(`${h}h ${m}m ${s}s remaining`);
      }
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [votingEndsAt]);

  async function castVote(choice: string) {
    if (!authenticated) return;
    setVoting(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/proposals/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposalId, choice }),
      });
      if (res.ok) {
        const data = await res.json();
        setTally((prev) => ({ ...prev, ...data, userVote: choice }));
      }
    } catch { /* ignore */ }
    setVoting(false);
  }

  const isVoting = tally.state === "voting";
  const votingEnded = votingEndsAt
    ? new Date(votingEndsAt).getTime() < Date.now()
    : false;
  const canVote = isVoting && !votingEnded && authenticated;

  const totalYesNo = tally.yes + tally.no;
  const approvalPct =
    totalYesNo > 0 ? Math.round((tally.yes / totalYesNo) * 100) : 0;
  const participationPct =
    tally.totalMembers > 0
      ? Math.round((tally.total / tally.totalMembers) * 100)
      : 0;

  return (
    <Card>
      <CardContent className="pt-8 pb-6 px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="fantasy text-lg text-gold">Vote</h3>
          <div className="flex items-center gap-2">
            {tally.state === "succeeded" && (
              <Badge variant="secondary">Passed</Badge>
            )}
            {tally.state === "defeated" && (
              <Badge variant="destructive">Failed</Badge>
            )}
            {tally.state === "completed" && (
              <Badge variant="outline">Executed</Badge>
            )}
            {isVoting && (
              <span className="text-sm text-muted-foreground">{timeLeft}</span>
            )}
          </div>
        </div>
        {/* Vote buttons */}
        {canVote && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => castVote("yes")}
              disabled={voting}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                tally.userVote === "yes"
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-border bg-dark-surface text-parchment-dark hover:border-gold/50"
              }`}
            >
              {tally.userVote === "yes" ? "Supported" : "Support"}
            </button>
            <button
              onClick={() => castVote("no")}
              disabled={voting}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                tally.userVote === "no"
                  ? "border-red-500 bg-red-500/20 text-red-300"
                  : "border-border bg-dark-surface text-parchment-dark hover:border-red-500/50"
              }`}
            >
              {tally.userVote === "no" ? "Opposed" : "Oppose"}
            </button>
            <button
              onClick={() => castVote("abstain")}
              disabled={voting}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                tally.userVote === "abstain"
                  ? "border-muted bg-muted/20 text-muted-foreground"
                  : "border-border bg-dark-surface text-parchment-dark hover:border-muted"
              }`}
            >
              Abstain
            </button>
          </div>
        )}

        {!authenticated && isVoting && (
          <p className="text-sm text-muted-foreground mb-4">
            Log in to vote on this proposal.
          </p>
        )}

        {/* Progress bars */}
        <div className="space-y-3">
          {/* Approval bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>
                Approval: {approvalPct}% ({tally.yes} support / {tally.no}{" "}
                oppose)
              </span>
            </div>
            <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${approvalPct}%` }}
              />
            </div>
          </div>

          {/* Participation / quorum bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>
                Participation: {participationPct}% ({tally.total} of{" "}
                {tally.totalMembers})
              </span>
              <span>Quorum: {tally.quorumPercent}%</span>
            </div>
            <div className="relative h-2 bg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-parchment-dark rounded-full transition-all"
                style={{ width: `${participationPct}%` }}
              />
              {/* Quorum threshold line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gold"
                style={{ left: `${tally.quorumPercent}%` }}
              />
            </div>
            {tally.quorumReached && (
              <p className="text-xs text-gold mt-1">Quorum reached</p>
            )}
          </div>

          {/* Abstain count */}
          {tally.abstain > 0 && (
            <p className="text-xs text-muted-foreground">
              {tally.abstain} abstained
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

