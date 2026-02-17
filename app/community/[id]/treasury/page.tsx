import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { getDatabase, schema } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import { WarChest } from "@/components/treasury/WarChest";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TreasuryPage({ params }: Props) {
  const { id } = await params;
  const db = getDatabase();

  const community = await db.query.communities.findFirst({
    where: eq(schema.communities.id, id),
  });
  if (!community) {
    notFound();
  }

  // Fetch transaction history
  const txHistory = await db.query.transactions.findMany({
    where: eq(schema.transactions.communityId, id),
    orderBy: [desc(schema.transactions.createdAt)],
    limit: 50,
  });

  return (
    <div className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <Link
        href={`/community/${id}`}
        className="text-sm text-muted-foreground hover:text-parchment mb-6 inline-block"
      >
        &larr; {community.name}
      </Link>

      <div className="mb-6">
        <WarChest communityId={id} />
      </div>

      {/* Add funds info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="fantasy text-lg text-gold">
            Add Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This treasury is on Solana devnet. To add test funds:
          </p>
          <ol className="text-sm text-parchment-dark space-y-1 list-decimal list-inside">
            <li>
              Copy the treasury address from &quot;Show technical details&quot;
              above
            </li>
            <li>
              Use the{" "}
              <a
                href="https://faucet.solana.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                Solana devnet faucet
              </a>{" "}
              to airdrop SOL
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle className="fantasy text-lg text-gold">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {txHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div>
                    <p className="text-sm text-parchment">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {tx.amount && (
                    <span className="text-sm text-gold font-medium">
                      {parseFloat(tx.amount).toFixed(4)} SOL
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
