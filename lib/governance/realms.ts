import type {
  GovernanceProvider,
  CommunityConfig,
  CommunityRecord,
  MemberRecord,
  ProposalInput,
  ProposalRecord,
  VoteChoice,
  VoteRecord,
  VoteResult,
  ExecutionResult,
  TreasuryBalance,
  Role,
} from "./types";

/**
 * RealmsGovernance implements GovernanceProvider using SPL Governance (Realms).
 * Methods are implemented incrementally across milestones.
 */
export class RealmsGovernance implements GovernanceProvider {
  async createCommunity(config: CommunityConfig): Promise<CommunityRecord> {
    throw new Error("Not implemented — see M4");
  }

  async addMember(
    communityId: string,
    privyUserId: string,
    solanaAddress: string,
    role: Role = "citizen"
  ): Promise<MemberRecord> {
    throw new Error("Not implemented — see M5");
  }

  async createProposal(
    communityId: string,
    creatorId: string,
    input: ProposalInput
  ): Promise<ProposalRecord> {
    throw new Error("Not implemented — Phase 2");
  }

  async castVote(
    proposalId: string,
    memberId: string,
    choice: VoteChoice
  ): Promise<VoteRecord> {
    throw new Error("Not implemented — Phase 2");
  }

  async finalizeVote(proposalId: string): Promise<VoteResult> {
    throw new Error("Not implemented — Phase 2");
  }

  async executeProposal(proposalId: string): Promise<ExecutionResult> {
    throw new Error("Not implemented — Phase 2");
  }

  async getTreasuryBalance(communityId: string): Promise<TreasuryBalance> {
    throw new Error("Not implemented — Phase 2");
  }

  async getMembers(communityId: string): Promise<MemberRecord[]> {
    throw new Error("Not implemented — see M5");
  }

  async getProposals(communityId: string): Promise<ProposalRecord[]> {
    throw new Error("Not implemented — Phase 2");
  }
}
