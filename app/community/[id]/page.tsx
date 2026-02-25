import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { Button } from "@/components/ui/warcraftcn/button";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { CopyInviteLink } from "./copy-invite-link";
import { TechDetails } from "./tech-details";

interface Props {
  params: Promise<{ id: string }>;
}

const ROLE_LABELS: Record<string, string> = {
  archmage: "Archmage",
  councilor: "Councilor",
  citizen: "Citizen",
};

export default async function CommunityDashboardPage({ params }: Props) {
  const { id } = await params;
  const db = getDatabase();

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.id, id),
  });

  if (!community) {
    notFound();
  }

  const membersList = await db.query.members.findMany({
    where: eq(schema.members.communityId, id),
  });

  // Fetch recent proposals (limit 3)
  const recentProposals = await db
    .select({
      id: schema.proposals.id,
      title: schema.proposals.title,
      type: schema.proposals.type,
      state: schema.proposals.state,
      amount: schema.proposals.amount,
      createdBy: schema.proposals.createdBy,
      createdAt: schema.proposals.createdAt,
      votingEndsAt: schema.proposals.votingEndsAt,
      yesVotes:
        sql<number>`coalesce(sum(case when ${schema.votes.choice} = 'yes' then 1 else 0 end), 0)::int`,
      noVotes:
        sql<number>`coalesce(sum(case when ${schema.votes.choice} = 'no' then 1 else 0 end), 0)::int`,
      abstainVotes:
        sql<number>`coalesce(sum(case when ${schema.votes.choice} = 'abstain' then 1 else 0 end), 0)::int`,
    })
    .from(schema.proposals)
    .leftJoin(schema.votes, eq(schema.proposals.id, schema.votes.proposalId))
    .where(eq(schema.proposals.communityId, id))
    .groupBy(schema.proposals.id)
    .orderBy(desc(schema.proposals.createdAt))
    .limit(3);

  // Get creator emails for proposals
  const memberIds = [...new Set(recentProposals.map((p) => p.createdBy))];
  const membersMap: Record<string, string> = {};
  if (memberIds.length > 0) {
    const memberRows = await db.query.members.findMany({
      where: sql`${schema.members.id} IN (${sql.join(
        memberIds.map((mid) => sql`${mid}`),
        sql`, `
      )})`,
    });
    for (const m of memberRows) {
      membersMap[m.id] = m.email || "Community member";
    }
  }

  const inviteUrl = `/invite/${community.inviteCode}`;

  // Compute stats
  const totalProposals = recentProposals.length;
  const activeVotes = recentProposals.filter((p) => p.state === "voting").length;
  const passedProposals = recentProposals.filter((p) => p.state === "succeeded" || p.state === "completed").length;

  return (
    <div className="px-6 py-8 max-w-5xl">
      {/* Hero banner */}
      <div className="mb-8">
        <h1 className="fantasy text-3xl font-bold text-gold mb-2">
          {community.name}
        </h1>
        {community.description && (
          <p className="text-parchment-dark mb-4">{community.description}</p>
        )}
        <p className="text-sm text-parchment/60 italic">
          Pool funds, debate proposals, and decide together.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 pb-4 px-6 text-center">
            <p className="fantasy text-2xl text-gold">{membersList.length}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-4 px-6 text-center">
            <p className="fantasy text-2xl text-gold">{activeVotes}</p>
            <p className="text-xs text-muted-foreground">Active Votes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-4 px-6 text-center">
            <p className="fantasy text-2xl text-gold">{passedProposals}</p>
            <p className="text-xs text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Treasury Summary Card */}
        <Link href={`/community/${id}/treasury`}>
          <Card className="hover:border-gold/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-8 pb-6 px-8 flex flex-col items-center text-center">
              <h3 className="fantasy text-lg text-gold mb-2">War Chest</h3>
              <p className="text-muted-foreground text-sm mb-3">
                View your community treasury and transaction history.
              </p>
              <span className="text-sm text-gold">View treasury &rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Invite Card */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center pt-8 pb-6 px-8">
            <h3 className="fantasy text-lg text-gold mb-2">
              Invite Members
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Share this link to invite members to your council.
            </p>
            <CopyInviteLink inviteUrl={inviteUrl} />
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="fantasy text-xl text-gold">Recent Proposals</h2>
            <div className="flex gap-2">
              <Link href={`/community/${id}/proposals`}>
                <Button variant="frame" className="px-6 text-center">View All</Button>
              </Link>
              <Link href={`/community/${id}/proposals/new`}>
                <Button>New Proposal</Button>
              </Link>
            </div>
          </div>
          {recentProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-6 px-8 text-center">
                <p className="text-muted-foreground">
                  No proposals yet. Create the first one!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  id={p.id}
                  communityId={id}
                  title={p.title}
                  type={p.type}
                  state={p.state}
                  amount={p.amount}
                  yesVotes={p.yesVotes}
                  noVotes={p.noVotes}
                  abstainVotes={p.abstainVotes}
                  totalVotes={p.yesVotes + p.noVotes + p.abstainVotes}
                  votingEndsAt={p.votingEndsAt?.toISOString() || null}
                  createdByEmail={membersMap[p.createdBy] || "Community member"}
                  createdAt={p.createdAt.toISOString()}
                />
              ))}
            </div>
          )}
        </div>

        {/* Members Card */}
        <Card className="md:col-span-2">
          <CardContent className="pt-8 pb-6 px-8">
            <h3 className="fantasy text-lg text-gold mb-4">
              Council Members ({membersList.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {membersList.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-parchment">
                    {member.email || "Community member"}
                  </span>
                  <Badge>
                    {ROLE_LABELS[member.role] || member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical details — collapsed by default, for judges/devs */}
        <div className="md:col-span-2">
          <TechDetails
            realmPubkey={community.realmPubkey}
            communityMint={community.communityMint}
            councilMint={community.councilMint}
            governancePubkey={community.governancePubkey}
            treasuryPubkey={community.treasuryPubkey}
          />
        </div>
      </div>
    </div>
  );
}
