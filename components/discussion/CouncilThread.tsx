"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { useAuth } from "@/hooks/use-auth";
import { CommentInput } from "./CommentInput";

interface Comment {
  id: string;
  proposalId: string;
  parentId: string | null;
  authorId: string;
  authorEmail: string;
  authorRole: string;
  body: string;
  reactions: Record<string, string[]>;
  createdAt: string;
}

interface CouncilThreadProps {
  proposalId: string;
  communityId: string;
}

const ROLE_LABELS: Record<string, string> = {
  archmage: "Archmage",
  councilor: "Councilor",
  citizen: "Citizen",
};

const REACTION_OPTIONS = ["⚔️", "🛡️", "🤔", "❤️"];

export function CouncilThread({ proposalId, communityId }: CouncilThreadProps) {
  const { authenticated } = useAuth();
  const { getAccessToken } = usePrivy();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?proposalId=${proposalId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch { /* ignore */ }
  }, [proposalId]);

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 15000);
    return () => clearInterval(interval);
  }, [fetchComments]);

  async function handlePostComment(body: string, parentId?: string) {
    if (!authenticated) return;
    const token = await getAccessToken();
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ proposalId, parentId, body }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setReplyingTo(null);
    }
  }

  async function handleReaction(commentId: string, reaction: string) {
    if (!authenticated) return;
    const token = await getAccessToken();
    const res = await fetch(`/api/comments/${commentId}/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reaction }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, reactions: data.reactions } : c
        )
      );
    }
  }

  // Build threaded structure
  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);
  const repliesByParent: Record<string, Comment[]> = {};
  for (const r of replies) {
    if (!repliesByParent[r.parentId!]) repliesByParent[r.parentId!] = [];
    repliesByParent[r.parentId!].push(r);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="fantasy text-lg text-gold">
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comments list */}
        <div className="space-y-4 mb-6">
          {topLevel.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Start the discussion.
            </p>
          )}
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentBubble
                comment={comment}
                onReply={() =>
                  setReplyingTo(
                    replyingTo === comment.id ? null : comment.id
                  )
                }
                onReaction={(reaction) =>
                  handleReaction(comment.id, reaction)
                }
                authenticated={authenticated}
              />

              {/* Replies */}
              {repliesByParent[comment.id]?.map((reply) => (
                <div key={reply.id} className="ml-8 mt-2">
                  <CommentBubble
                    comment={reply}
                    onReply={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                    onReaction={(reaction) =>
                      handleReaction(reply.id, reaction)
                    }
                    authenticated={authenticated}
                  />
                </div>
              ))}

              {/* Inline reply input */}
              {replyingTo === comment.id && authenticated && (
                <div className="ml-8 mt-2">
                  <CommentInput
                    onSubmit={(body) => handlePostComment(body, comment.id)}
                    placeholder="Write a reply..."
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New comment input */}
        {authenticated ? (
          <CommentInput
            onSubmit={(body) => handlePostComment(body)}
            placeholder="Share your thoughts on this proposal..."
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Log in to join the discussion.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CommentBubble({
  comment,
  onReply,
  onReaction,
  authenticated,
}: {
  comment: Comment;
  onReply: () => void;
  onReaction: (reaction: string) => void;
  authenticated: boolean;
}) {
  const timeAgo = getTimeAgo(comment.createdAt);

  return (
    <div className="bg-dark-surface rounded-lg p-3 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-parchment font-medium">
          {comment.authorEmail}
        </span>
        <Badge size="sm" variant="outline">
          {ROLE_LABELS[comment.authorRole] || comment.authorRole}
        </Badge>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>
      <p className="text-sm text-parchment-dark whitespace-pre-wrap">
        {comment.body}
      </p>

      {/* Reactions + reply */}
      <div className="flex items-center gap-2 mt-2">
        {/* Existing reactions */}
        {Object.entries(comment.reactions).map(([emoji, memberIds]) => {
          const ids = memberIds as string[];
          if (ids.length === 0) return null;
          return (
            <button
              key={emoji}
              onClick={() => authenticated && onReaction(emoji)}
              className="text-xs bg-dark-lighter rounded-full px-2 py-0.5 border border-border/50 hover:border-gold/50 transition-colors"
            >
              {emoji} {ids.length}
            </button>
          );
        })}

        {/* Add reaction buttons */}
        {authenticated && (
          <div className="flex gap-1 ml-auto">
            {REACTION_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReaction(emoji)}
                className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={onReply}
              className="text-xs text-muted-foreground hover:text-parchment ml-2"
            >
              Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
