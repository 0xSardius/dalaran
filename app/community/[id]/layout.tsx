import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import { CommunityNav } from "./community-nav";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export default async function CommunityLayout({ params, children }: Props) {
  const { id } = await params;
  const db = getDatabase();

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.id, id),
  });

  if (!community) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <CommunityNav communityId={id} communityName={community.name} />
      <main className="ml-56">
        {children}
      </main>
    </div>
  );
}
