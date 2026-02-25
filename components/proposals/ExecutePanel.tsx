"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
} from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";
import { useAuth } from "@/hooks/use-auth";

interface ExecutePanelProps {
  proposalId: string;
  communityId: string;
  amount: string;
  recipientAddress: string;
  treasuryPubkey: string;
}

export function ExecutePanel({
  proposalId,
  communityId,
  amount,
  recipientAddress,
  treasuryPubkey,
}: ExecutePanelProps) {
  const { authenticated } = useAuth();
  const { getAccessToken } = usePrivy();
  const [confirming, setConfirming] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{
    signature: string;
    explorer: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExecute() {
    setError(null);
    setExecuting(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/proposals/${proposalId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Execution failed");
      }
      setResult(data);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setExecuting(false);
  }

  if (!authenticated) return null;

  if (result) {
    return (
      <Card>
        <CardContent className="pt-8 pb-6 px-8">
          <h3 className="fantasy text-lg text-gold mb-4">
            Funds Transferred
          </h3>
          <div className="bg-dark-lighter rounded-lg p-4">
            <p className="text-sm text-parchment mb-2">
              {parseFloat(amount).toFixed(4)} SOL has been sent to the
              recipient.
            </p>
            <a
              href={result.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold hover:underline break-all"
            >
              View on Solana Explorer
            </a>
            <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
              Tx: {result.signature}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-8 pb-6 px-8">
        <h3 className="fantasy text-lg text-gold mb-4">
          Execute Order
        </h3>
        <div className="bg-dark-lighter rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Transfer</p>
          <p className="text-xl font-bold text-gold">
            {parseFloat(amount).toFixed(4)} SOL
          </p>
          <p className="text-xs text-muted-foreground mt-1 break-all">
            To: {recipientAddress}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded p-3 mb-4">
            {error}
          </p>
        )}

        {!confirming ? (
          <Button onClick={() => setConfirming(true)} className="w-full">
            Execute Order
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-parchment text-center">
              Are you sure? This will transfer funds from the treasury.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleExecute}
                disabled={executing}
                className="flex-1"
              >
                {executing ? "Transferring funds..." : "Confirm Transfer"}
              </Button>
              <Button
                variant="frame"
                onClick={() => setConfirming(false)}
                disabled={executing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
