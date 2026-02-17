"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { Button } from "@/components/ui/warcraftcn/button";
import { useAuth } from "@/hooks/use-auth";

interface KeeperSummaryProps {
  proposalId: string;
  aiSummary: string | null;
  aiSummaryUpdatedAt: string | null;
}

export function KeeperSummary({
  proposalId,
  aiSummary: initialSummary,
  aiSummaryUpdatedAt: initialUpdatedAt,
}: KeeperSummaryProps) {
  const { authenticated } = useAuth();
  const { getAccessToken } = usePrivy();
  const [summary, setSummary] = useState(initialSummary);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [loading, setLoading] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);

  // Auto-fetch summary on mount if authenticated and no summary exists
  useEffect(() => {
    if (authenticated && !summary && !autoFetched) {
      setAutoFetched(true);
      handleRefresh();
    }
  }, [authenticated, summary, autoFetched]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRefresh() {
    if (!authenticated) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposalId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setUpdatedAt(data.updatedAt);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  if (!summary && !loading) return null;

  const timeAgo = updatedAt ? getTimeAgo(updatedAt) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="fantasy text-lg text-gold">
              Keeper&apos;s Summary
            </CardTitle>
            <Badge size="sm" variant="outline">
              AI
            </Badge>
          </div>
          {authenticated && (
            <Button
              variant="frame"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Refresh"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !summary ? (
          <p className="text-sm text-muted-foreground">
            The Keeper is analyzing the discussion...
          </p>
        ) : (
          <>
            <div className="text-sm text-parchment-dark whitespace-pre-wrap leading-relaxed">
              {formatSummary(summary || "")}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              {timeAgo && <span>Updated {timeAgo}</span>}
              <span>This summary is AI-generated</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatSummary(text: string) {
  // Simple markdown-like rendering for bold headers
  return text.split("\n").map((line, i) => {
    const boldMatch = line.match(/^\*\*(.+?)\*\*\s*(.*)/);
    if (boldMatch) {
      return (
        <p key={i} className="mt-2 first:mt-0">
          <strong className="text-parchment">{boldMatch[1]}</strong>{" "}
          {boldMatch[2]}
        </p>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <p key={i} className="ml-4">
          {line}
        </p>
      );
    }
    if (line.trim() === "") return null;
    return <p key={i}>{line}</p>;
  });
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
