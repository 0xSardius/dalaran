export type Role = "archmage" | "councilor" | "citizen";

export interface CommunityConfig {
  name: string;
  description: string;
  creatorSolanaAddress: string;
  quorumPercent?: number; // default 60
  votingPeriodHours?: number; // default 72
}

export interface CommunityRecord {
  id: string;
  name: string;
  description: string;
  realmPubkey: string;
  communityMint: string;
  councilMint: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
}

export interface MemberRecord {
  id: string;
  communityId: string;
  privyUserId: string;
  solanaAddress: string;
  role: Role;
  tokenOwnerRecordPubkey: string | null;
  joinedAt: Date;
}

export interface ProposalInput {
  title: string;
  description: string;
  amount: number; // in dollars (USDC)
  recipientAddress?: string;
}

export type ProposalState =
  | "draft"
  | "discussing"
  | "voting"
  | "succeeded"
  | "defeated"
  | "executing"
  | "completed"
  | "cancelled";

export interface ProposalRecord {
  id: string;
  communityId: string;
  title: string;
  description: string;
  amount: number;
  recipientAddress: string | null;
  proposalPubkey: string | null;
  governancePubkey: string | null;
  state: ProposalState;
  createdBy: string;
  createdAt: Date;
  votingEndsAt: Date | null;
}

export type VoteChoice = "yes" | "no" | "abstain";

export interface VoteRecord {
  memberId: string;
  proposalId: string;
  choice: VoteChoice;
  votedAt: Date;
}

export interface VoteResult {
  yes: number;
  no: number;
  abstain: number;
  quorumReached: boolean;
  passed: boolean;
}

export interface ExecutionResult {
  success: boolean;
  transactionSignature: string | null;
  error: string | null;
}

export interface TreasuryBalance {
  usdcBalance: number;
  solBalance: number;
  treasuryAddress: string;
}

export interface TransactionRecord {
  id: string;
  communityId: string;
  proposalId: string | null;
  type: "deposit" | "withdrawal" | "realm_creation" | "member_join";
  amount: number | null;
  signature: string;
  createdAt: Date;
}

/**
 * GovernanceProvider is the central abstraction layer.
 * All governance operations go through this interface.
 * For the hackathon, only RealmsGovernance is implemented.
 */
export interface GovernanceProvider {
  createCommunity(config: CommunityConfig): Promise<CommunityRecord>;

  addMember(
    communityId: string,
    privyUserId: string,
    solanaAddress: string,
    role?: Role
  ): Promise<MemberRecord>;

  createProposal(
    communityId: string,
    creatorId: string,
    input: ProposalInput
  ): Promise<ProposalRecord>;

  castVote(
    proposalId: string,
    memberId: string,
    choice: VoteChoice
  ): Promise<VoteRecord>;

  finalizeVote(proposalId: string): Promise<VoteResult>;

  executeProposal(proposalId: string): Promise<ExecutionResult>;

  getTreasuryBalance(communityId: string): Promise<TreasuryBalance>;

  getMembers(communityId: string): Promise<MemberRecord[]>;

  getProposals(communityId: string): Promise<ProposalRecord[]>;
}
