"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/warcraftcn/button";

interface CommunityNavProps {
  communityId: string;
  communityName: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", path: "" },
  { label: "Proposals", path: "/proposals" },
  { label: "Treasury", path: "/treasury" },
];

export function CommunityNav({ communityId, communityName }: CommunityNavProps) {
  const pathname = usePathname();
  const { authenticated, logout, user } = useAuth();
  const basePath = `/community/${communityId}`;

  function isActive(itemPath: string) {
    if (itemPath === "") {
      return pathname === basePath;
    }
    return pathname.startsWith(`${basePath}${itemPath}`);
  }

  return (
    <nav className="border-b border-border/50 bg-dark-surface/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link
            href={basePath}
            className="fantasy text-lg text-gold hover:text-gold-light transition-colors"
          >
            {communityName}
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={`${basePath}${item.path}`}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive(item.path)
                    ? "bg-gold/15 text-gold"
                    : "text-muted-foreground hover:text-parchment hover:bg-dark-lighter"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {authenticated && (
              <>
                <span className="ml-3 text-xs text-muted-foreground">
                  {user?.email?.address ?? ""}
                </span>
                <Button variant="frame" onClick={logout}>
                  Leave
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
