import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import { Badge } from "@/components/ui/warcraftcn/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/warcraftcn/card";
import { VotePanel } from "@/components/proposals/VotePanel";
import { ExecutePanel } from "@/components/proposals/ExecutePanel";
import { CouncilThread } from "@/components/discussion/CouncilThread";
import { KeeperSummary } from "@/components/discussion/KeeperSummary";

interface Props {
  params: Promise<{ id: string; proposalId: string }>;
}

const STATE_STYLES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  voting: { label: "Voting", variant: "default" },
  succeeded: { label: "Passed", variant: "secondary" },
  defeated: { label: "Failed", variant: "destructive" },
  completed: { label: "Executed", variant: "outline" },
  draft: { label: "Draft", variant: "outline" },
};

const TYPE_LABELS: Record<string, string> = {
  funding: "Request Funding",
  policy: "Policy Change",
  general: "General Vote",
};

export default async function ProposalDetailPage({ params }: Props) {
  const { id: communityId, proposalId } = await params;
  const db = getDatabase();

  const proposal = await db.query.proposals.findFirst({
    where: eq(schema.proposals.id, proposalId),
  });
  if (!proposal || proposal.communityId !== communityId) {
    notFound();
  }

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.id, communityId),
  });
  if (!community) {
    notFound();
  }

  // Get creator info
  const creator = await db.query.members.findFirst({
    where: eq(schema.members.id, proposal.createdBy),
  });

  // Get total members for quorum calculation
  const memberCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.members)
    .where(eq(schema.members.communityId, communityId));
  const totalMembers = memberCountResult[0]?.count || 0;

  const stateStyle = STATE_STYLES[proposal.state] || STATE_STYLES.draft;

  return (
    <div className="px-6 py-8 max-w-4xl">

      {/* Proposal header */}
      <Card className="mb-6">
        <CardContent className="pt-8 pb-6 px-8">
          {/* Proposed by + date */}
          <div className="flex items-center gap-3 text-sm text-parchment/70 mb-3">
            <span>
              Proposed by {creator?.email || "Community member"}
            </span>
            <span>&middot;</span>
            <span>
              {new Date(proposal.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h1 className="fantasy text-2xl text-gold leading-snug mb-3">
            {proposal.title}
          </h1>

          {/* Badges */}
          <div className="flex gap-1.5 mb-4">
            <Badge size="sm" variant="outline">
              {TYPE_LABELS[proposal.type] || proposal.type}
            </Badge>
            <Badge size="sm" variant={stateStyle.variant}>
              {stateStyle.label}
            </Badge>
          </div>

          {proposal.description && (
            <p className="text-parchment-dark whitespace-pre-wrap mb-4">
              {proposal.description}
            </p>
          )}

          {proposal.type === "funding" && proposal.amount && (
            <div className="bg-dark-lighter rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Requested amount</p>
              <p className="text-2xl font-bold text-gold">
                {parseFloat(proposal.amount).toFixed(3)} SOL
              </p>
              {proposal.recipientAddress && (
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  To: {proposal.recipientAddress}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vote panel */}
      <div className="mb-6">
        <VotePanel
          proposalId={proposalId}
          communityId={communityId}
          state={proposal.state}
          votingEndsAt={proposal.votingEndsAt?.toISOString() || null}
          quorumPercent={community.quorumPercent}
          totalMembers={totalMembers}
        />
      </div>

      {/* Execute panel — only for succeeded funding proposals */}
      {proposal.state === "succeeded" && proposal.type === "funding" && (
        <div className="mb-6">
          <ExecutePanel
            proposalId={proposalId}
            communityId={communityId}
            amount={proposal.amount || "0"}
            recipientAddress={proposal.recipientAddress || ""}
            treasuryPubkey={community.treasuryPubkey || ""}
          />
        </div>
      )}

      {/* AI Keeper Summary */}
      <div className="mb-6">
        <KeeperSummary
          proposalId={proposalId}
          aiSummary={proposal.aiSummary}
          aiSummaryUpdatedAt={proposal.aiSummaryUpdatedAt?.toISOString() || null}
        />
      </div>

      {/* Discussion thread */}
      <CouncilThread
        proposalId={proposalId}
        communityId={communityId}
      />
    </div>
  );
}
