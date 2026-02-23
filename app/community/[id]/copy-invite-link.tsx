"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/warcraftcn/button";

export function CopyInviteLink({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(inviteUrl);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${inviteUrl}`);
  }, [inviteUrl]);

  async function handleCopy() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 bg-dark-lighter rounded px-3 py-2 text-sm text-parchment break-all">
        {fullUrl}
      </code>
      <Button onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
