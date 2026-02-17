"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";

interface WarChestProps {
  communityId: string;
}

export function WarChest({ communityId }: WarChestProps) {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [treasuryAddress, setTreasuryAddress] = useState<string | null>(null);
  const [showAddress, setShowAddress] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_treasury() {
      try {
        const res = await fetch(`/api/treasury/${communityId}`);
        if (res.ok) {
          const data = await res.json();
          setSolBalance(data.solBalance);
          setUsdcBalance(data.usdcBalance);
          setTreasuryAddress(data.treasuryAddress);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetch_treasury();
  }, [communityId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading treasury...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="fantasy text-2xl text-gold">War Chest</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main balance display */}
          <div className="bg-dark-lighter rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Treasury Balance
            </p>
            <p className="text-4xl font-bold text-gold">
              {solBalance !== null ? solBalance.toFixed(4) : "0.0000"} SOL
            </p>
            {usdcBalance > 0 && (
              <p className="text-lg text-parchment-dark mt-1">
                ${usdcBalance.toFixed(2)} USDC
              </p>
            )}
          </div>

          {/* Technical details toggle */}
          {treasuryAddress && (
            <div>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-xs text-muted-foreground hover:text-parchment-dark transition-colors"
              >
                {showAddress ? "Hide" : "Show"} technical details
              </button>
              {showAddress && (
                <p className="mt-1 text-xs font-mono text-parchment-dark break-all">
                  Treasury: {treasuryAddress}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
