"use client";

import { useState } from "react";
import { Button } from "@/components/ui/warcraftcn/button";

interface CommentInputProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentInput({
  onSubmit,
  placeholder = "Share your thoughts...",
  autoFocus = false,
}: CommentInputProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        rows={2}
        autoFocus={autoFocus}
        className="flex-1 rounded-md border border-border bg-dark-surface px-3 py-2 text-sm text-parchment placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
      />
      <Button type="submit" disabled={submitting || !body.trim()}>
        {submitting ? "..." : "Post"}
      </Button>
    </form>
  );
}
