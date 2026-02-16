import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";
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

  const inviteUrl = `/invite/${community.inviteCode}`;

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="fantasy text-4xl font-bold text-gold mb-2">
          {community.name}
        </h1>
        {community.description && (
          <p className="text-parchment-dark">{community.description}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invite Card */}
        <Card>
          <CardHeader>
            <CardTitle className="fantasy text-lg text-gold">
              Invite Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Share this link to invite members to your council.
            </p>
            <CopyInviteLink inviteUrl={inviteUrl} />
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardHeader>
            <CardTitle className="fantasy text-lg text-gold">
              Council Members ({membersList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
