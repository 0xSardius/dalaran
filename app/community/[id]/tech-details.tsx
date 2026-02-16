"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/warcraftcn/card";

interface TechDetailsProps {
  realmPubkey: string | null;
  communityMint: string | null;
  councilMint: string | null;
  governancePubkey: string | null;
  treasuryPubkey: string | null;
}

export function TechDetails(props: TechDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-muted-foreground hover:text-parchment-dark transition-colors cursor-pointer"
      >
        {open ? "Hide" : "Show"} technical details
      </button>

      {open && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm font-mono">
              <InfoRow label="Realm" value={props.realmPubkey} />
              <InfoRow label="Community Mint" value={props.communityMint} />
              <InfoRow label="Council Mint" value={props.councilMint} />
              <InfoRow label="Governance" value={props.governancePubkey} />
              <InfoRow label="Treasury" value={props.treasuryPubkey} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-muted-foreground w-36 shrink-0">{label}:</span>
      <span className="text-parchment break-all">{value}</span>
    </div>
  );
}
