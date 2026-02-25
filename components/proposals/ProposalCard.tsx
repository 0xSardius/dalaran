import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";

interface ProposalCardProps {
  id: string;
  communityId: string;
  title: string;
  type: string;
  state: string;
  amount: string | null;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalVotes: number;
  votingEndsAt: string | null;
  createdByEmail: string;
  createdAt: string;
}

const STATE_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  voting: { label: "Voting", variant: "default" },
  succeeded: { label: "Passed", variant: "secondary" },
  defeated: { label: "Failed", variant: "destructive" },
  completed: { label: "Executed", variant: "outline" },
  draft: { label: "Draft", variant: "outline" },
};

const TYPE_LABELS: Record<string, string> = {
  funding: "Funding",
  policy: "Policy",
  general: "General",
};

export function ProposalCard({
  id,
  communityId,
  title,
  type,
  state,
  amount,
  yesVotes,
  noVotes,
  totalVotes,
  votingEndsAt,
  createdByEmail,
  createdAt,
}: ProposalCardProps) {
  const stateStyle = STATE_STYLES[state] || STATE_STYLES.draft;
  const totalYesNo = yesVotes + noVotes;
  const approvalPct = totalYesNo > 0 ? Math.round((yesVotes / totalYesNo) * 100) : 0;

  const timeRemaining = votingEndsAt ? getTimeRemaining(votingEndsAt) : null;

  return (
    <Link href={`/community/${communityId}/proposals/${id}`}>
      <Card className="hover:border-gold/50 transition-colors cursor-pointer">
        <CardContent className="pt-8 pb-6 px-8">
          {/* Proposed by */}
          <p className="text-xs text-parchment/70 mb-2">
            by {createdByEmail}
          </p>

          {/* Title */}
          <h3 className="text-base text-parchment leading-snug font-medium break-words mb-2">
            {title}
          </h3>

          {/* Badges */}
          <div className="flex gap-1.5 mb-3">
            <Badge size="sm" variant="outline">
              {TYPE_LABELS[type] || type}
            </Badge>
            <Badge size="sm" variant={stateStyle.variant}>
              {stateStyle.label}
            </Badge>
          </div>

          {type === "funding" && amount && (
            <p className="text-gold font-medium text-sm mb-2">
              {parseFloat(amount).toFixed(3)} SOL
            </p>
          )}

          {/* Vote progress bar */}
          {totalVotes > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Support: {approvalPct}%</span>
                <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-1.5 bg-dark-lighter rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${approvalPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Time remaining / date */}
          <div className="text-xs text-muted-foreground">
            {state === "voting" && timeRemaining && (
              <span>{timeRemaining}</span>
            )}
            {state !== "voting" && (
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTimeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Voting ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  return `${hours}h ${mins}m remaining`;
}
