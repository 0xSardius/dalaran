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
  { label: "Dashboard", path: "", icon: "📋" },
  { label: "Proposals", path: "/proposals", icon: "📜" },
  { label: "Treasury", path: "/treasury", icon: "💰" },
];

export function CommunityNav({ communityId, communityName }: CommunityNavProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const basePath = `/community/${communityId}`;

  function isActive(itemPath: string) {
    if (itemPath === "") {
      return pathname === basePath;
    }
    return pathname.startsWith(`${basePath}${itemPath}`);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-dark-surface border-r border-border/50 flex flex-col z-10">
      {/* Community name */}
      <div className="p-4 border-b border-border/50">
        <Link
          href={basePath}
          className="fantasy text-lg text-gold hover:text-gold-light transition-colors block truncate"
        >
          {communityName}
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.path} href={`${basePath}${item.path}`}>
            <Button
              variant={isActive(item.path) ? "default" : "frame"}
              className={`w-full justify-start gap-3 text-sm ${
                isActive(item.path) ? "text-gold" : ""
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User + logout at bottom */}
      <div className="p-3 border-t border-border/50 space-y-2">
        <div className="text-xs text-muted-foreground truncate px-1">
          {user?.email?.address ?? ""}
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1"
          >
            <Button variant="frame" className="w-full text-xs">
              Home
            </Button>
          </Link>
          <Button variant="frame" className="flex-1 text-xs" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
