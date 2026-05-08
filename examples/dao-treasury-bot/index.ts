/**
 * DAO Treasury Bot — integration example
 *
 * Shows how a DAO treasury tool can use the ProofMesh Guard SDK to evaluate a
 * proposal payout, produce a trust permit, and decide whether to execute.
 *
 * This example runs locally without RPC, wallets, or .env files.
 *
 * Usage:
 *   pnpm example:dao-bot
 */

import { PublicKey } from "@solana/web3.js";
import {
  DEFAULT_GUARD_POLICY,
  buildProofBundle,
  evaluatePayoutIntent,
  guardScenarios,
  issueTrustPermit,
  verifyTrustPermit,
  type PayoutIntent,
  type GuardPolicy
} from "@proofmesh/guard-sdk";

const PROGRAM_ID = "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk";

// DAO-specific policy: higher cap for larger DAO payouts.
const daoPolicyConfig: GuardPolicy = {
  ...DEFAULT_GUARD_POLICY,
  policyId: "dao-treasury-policy-v1",
  maxReleaseLamports: "2000000000" // 2 SOL cap for DAO payouts
};

interface ProposalPayout {
  proposalId: string;
  recipientWallet: string;
  amountSol: number;
  description: string;
}

/**
 * Simulates a DAO treasury bot processing a proposal payout.
 *
 * The bot:
 * 1. Converts the proposal into a PayoutIntent
 * 2. Builds a deterministic proof bundle
 * 3. Evaluates policy to get a guard decision
 * 4. Issues a trust permit
 * 5. Verifies the permit before deciding whether to execute
 */
function processProposalPayout(
  proposal: ProposalPayout,
  scenario: "clean" | "oversized" | "risky"
) {
  const guardScenario = guardScenarios[
    scenario === "clean" ? "release" : scenario === "oversized" ? "cap" : "block"
  ];

  // Step 1: Build PayoutIntent from proposal
  const intent: PayoutIntent = {
    ...guardScenario.intent,
    id: `dao-proposal-${proposal.proposalId}`,
    treasury: "dao-treasury-multisig",
    recipient: proposal.recipientWallet,
    requestedAmountLamports: (proposal.amountSol * 1_000_000_000).toString(),
    metadata: {
      invoiceId: proposal.proposalId,
      vendorId: proposal.recipientWallet,
      description: proposal.description
    },
    nonce: `dao-${proposal.proposalId}-${Date.now()}`
  };

  // Step 2: Build proof bundle
  const bundle = buildProofBundle(
    intent,
    guardScenario.proofs,
    guardScenario.generatedAt
  );

  // Step 3: Evaluate policy
  const decision = evaluatePayoutIntent(intent, bundle, daoPolicyConfig);

  // Step 4: Issue trust permit
  const permit = issueTrustPermit(intent, bundle, decision, {
    issuer: "dao-treasury-bot",
    issuedAt: new Date().toISOString()
  });

  // Step 5: Verify permit
  const verification = verifyTrustPermit(permit, intent, bundle);

  // Step 6: Derive PDA
  const [permitPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("permit"), Buffer.from(bundle.intentHash, "hex")],
    new PublicKey(PROGRAM_ID)
  );

  // Step 7: Decision output
  const shouldExecute =
    verification.valid &&
    (decision.decision === "RELEASE" || decision.decision === "CAP");

  return {
    proposalId: proposal.proposalId,
    decision: decision.decision,
    requestedSol: proposal.amountSol,
    approvedSol: Number(decision.approvedAmountLamports) / 1_000_000_000,
    permitId: permit.permitId.slice(0, 16) + "...",
    permitPda: permitPda.toBase58(),
    verified: verification.valid,
    shouldExecute,
    reasons: decision.reasons,
    action: shouldExecute
      ? `✅ Execute ${Number(decision.approvedAmountLamports) / 1_000_000_000} SOL payout`
      : `🛑 ${decision.decision === "BLOCK" ? "Block" : "Hold"} — do not execute`
  };
}

// --- Run demo scenarios ---

console.log("\n🏛️  DAO Treasury Bot — ProofMesh Guard Integration\n");
console.log("Policy:", daoPolicyConfig.policyId);
console.log(
  "Cap:",
  Number(daoPolicyConfig.maxReleaseLamports) / 1_000_000_000,
  "SOL\n"
);

const proposals: Array<{
  proposal: ProposalPayout;
  scenario: "clean" | "oversized" | "risky";
}> = [
  {
    proposal: {
      proposalId: "PROP-042",
      recipientWallet: "contributor-alice",
      amountSol: 0.5,
      description: "Retroactive grant for documentation"
    },
    scenario: "clean"
  },
  {
    proposal: {
      proposalId: "PROP-043",
      recipientWallet: "contractor-bob",
      amountSol: 5.0,
      description: "Development milestone payment"
    },
    scenario: "oversized"
  },
  {
    proposal: {
      proposalId: "PROP-044",
      recipientWallet: "unknown-entity",
      amountSol: 1.0,
      description: "Marketing campaign budget"
    },
    scenario: "risky"
  }
];

const results = proposals.map(({ proposal, scenario }) =>
  processProposalPayout(proposal, scenario)
);

console.log(JSON.stringify({ daoTreasuryBot: results }, null, 2));
