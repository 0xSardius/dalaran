import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/warcraftcn/card";
import { JoinButton } from "./join-button";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { code } = await params;
  const db = getDatabase();

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.inviteCode, code),
  });

  if (!community) {
    notFound();
  }

  const membersList = await db.query.members.findMany({
    where: eq(schema.members.communityId, community.id),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            You have been invited to join
          </p>
          <CardTitle className="fantasy text-3xl text-gold">
            {community.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {community.description && (
            <p className="text-sm text-parchment-dark text-center">
              {community.description}
            </p>
          )}

          <div className="flex justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gold">
                {membersList.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {membersList.length === 1 ? "Member" : "Members"}
              </p>
            </div>
          </div>

          <JoinButton communityId={community.id} communityName={community.name} />
        </CardContent>
      </Card>
    </div>
  );
}
