import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import { Button } from "@/components/ui/warcraftcn/button";
import { ProposalCard } from "@/components/proposals/ProposalCard";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProposalsListPage({ params }: Props) {
  const { id } = await params;
  const db = getDatabase();

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.id, id),
  });
  if (!community) {
    notFound();
  }

  const proposalRows = await db
    .select({
      id: schema.proposals.id,
      title: schema.proposals.title,
      description: schema.proposals.description,
      type: schema.proposals.type,
      amount: schema.proposals.amount,
      recipientAddress: schema.proposals.recipientAddress,
      state: schema.proposals.state,
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
    .orderBy(desc(schema.proposals.createdAt));

  // Get creator emails
  const memberIds = [...new Set(proposalRows.map((p) => p.createdBy))];
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

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/community/${id}`}
            className="text-sm text-muted-foreground hover:text-parchment"
          >
            &larr; {community.name}
          </Link>
          <h1 className="fantasy text-3xl font-bold text-gold mt-1">
            Proposals
          </h1>
        </div>
        <Link href={`/community/${id}/proposals/new`}>
          <Button>New Proposal</Button>
        </Link>
      </div>

      {proposalRows.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No proposals yet. Be the first to submit one.
          </p>
          <Link href={`/community/${id}/proposals/new`}>
            <Button>Create Proposal</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposalRows.map((p) => (
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
  );
}
