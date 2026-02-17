"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";
import { Input } from "@/components/ui/warcraftcn/input";
import { useAuth } from "@/hooks/use-auth";

const PROPOSAL_TYPES = [
  {
    value: "funding",
    label: "Request Funding",
    description: "Request funds from the community treasury",
  },
  {
    value: "policy",
    label: "Policy Change",
    description: "Propose a change to community rules or operations",
  },
  {
    value: "general",
    label: "General Vote",
    description: "Put a question to the community for a vote",
  },
] as const;

export default function CreateProposalPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { authenticated, login } = useAuth();
  const { getAccessToken } = usePrivy();

  const [type, setType] = useState<string>("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-parchment mb-4">
              You must be logged in to create a proposal.
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
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          communityId,
          title,
          description,
          type,
          amount: type === "funding" ? amount : undefined,
          recipientAddress: type === "funding" ? recipientAddress : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create proposal");
      }

      router.push(`/community/${communityId}/proposals/${data.proposalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/community/${communityId}/proposals`)}
        className="text-sm text-muted-foreground hover:text-parchment mb-6 inline-block"
      >
        &larr; Back to proposals
      </button>

      <Card>
        <CardHeader>
          <CardTitle className="fantasy text-2xl text-gold text-center">
            New Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-parchment">
                Proposal Type
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {PROPOSAL_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setType(pt.value)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      type === pt.value
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-dark-surface text-parchment-dark hover:border-gold/50"
                    }`}
                  >
                    <span className="block text-sm font-medium">
                      {pt.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {pt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-parchment"
              >
                Title
              </label>
              <Input
                id="title"
                placeholder="What are you proposing?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
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
                placeholder="Explain your proposal in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-border bg-dark-surface px-3 py-2 text-sm text-parchment placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-y"
              />
            </div>

            {/* Funding-specific fields */}
            {type === "funding" && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium text-parchment"
                  >
                    Amount (SOL)
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount to transfer from the community treasury.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="recipient"
                    className="text-sm font-medium text-parchment"
                  >
                    Recipient
                  </label>
                  <Input
                    id="recipient"
                    placeholder="Recipient wallet address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The address that will receive the funds if approved.
                  </p>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded p-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || title.length < 2}
              className="w-full"
            >
              {loading ? "Submitting proposal..." : "Submit Proposal"}
            </Button>

            {loading && (
              <p className="text-xs text-center text-muted-foreground">
                Your proposal will go directly to a community vote.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
