import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const KEEPER_SYSTEM_PROMPT = `You are the Keeper of Dalaran, a neutral governance assistant for a community treasury council.

Your role is to summarize community discussions neutrally and helpfully.

Rules:
- Summarize the discussion in 2-3 concise sentences
- Then list key arguments FOR the proposal (if any)
- Then list key arguments AGAINST the proposal (if any)
- Never take sides or express opinions
- Never recommend how to vote
- Be concise and factual
- If the discussion is minimal, say so briefly

Format your response exactly like this:
**Summary:** [2-3 sentence summary]

**Arguments in favor:**
- [point 1]
- [point 2]

**Arguments against:**
- [point 1]
- [point 2]

If there are no arguments on one side, write "None raised yet." for that section.`;

export async function generateKeeperSummary(
  proposalTitle: string,
  proposalDescription: string,
  comments: { authorEmail: string; body: string; createdAt: string }[]
): Promise<string> {
  if (comments.length === 0) {
    return "No discussion yet. The Keeper will summarize once the community begins deliberating.";
  }

  const discussionText = comments
    .map(
      (c) =>
        `[${c.authorEmail}, ${new Date(c.createdAt).toLocaleString()}]: ${c.body}`
    )
    .join("\n\n");

  const result = await generateText({
    model: anthropic("claude-haiku-4-5-20251015"),
    system: KEEPER_SYSTEM_PROMPT,
    prompt: `Proposal: "${proposalTitle}"
Description: ${proposalDescription || "(no description)"}

Discussion (${comments.length} comments):
${discussionText}

Please summarize this discussion.`,
    maxOutputTokens: 500,
  });

  return result.text;
}
