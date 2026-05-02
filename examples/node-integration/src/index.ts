import { PublicKey } from "@solana/web3.js";
import {
  DEFAULT_GUARD_POLICY,
  buildProofBundle,
  evaluatePayoutIntent,
  guardScenarios,
  issueTrustPermit,
  verifyTrustPermit
} from "@proofmesh/guard-sdk";

const PROGRAM_ID = "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk";
const ISSUER = "example-agent-wallet";

type ScenarioName = keyof typeof guardScenarios;

interface ScenarioSummary {
  scenario: ScenarioName;
  decision: string;
  requestedAmountLamports: string;
  approvedAmountLamports: string;
  intentHash: string;
  proofRoot: string;
  permitId: string;
  permitPda: string;
  verified: boolean;
  shouldExecute: boolean;
  reasons: readonly string[];
}

function derivePermitPda(programId: string, intentHash: string): string {
  const [permitPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("permit"), Buffer.from(intentHash, "hex")],
    new PublicKey(programId)
  );

  return permitPda.toBase58();
}

function summarizeScenario(name: ScenarioName): ScenarioSummary {
  const scenario = guardScenarios[name];
  const bundle = buildProofBundle(
    scenario.intent,
    scenario.proofs,
    scenario.generatedAt
  );
  const decision = evaluatePayoutIntent(
    scenario.intent,
    bundle,
    DEFAULT_GUARD_POLICY
  );
  const permit = issueTrustPermit(scenario.intent, bundle, decision, {
    issuer: ISSUER,
    issuedAt: scenario.generatedAt
  });
  const verification = verifyTrustPermit(permit, scenario.intent, bundle);

  return {
    scenario: name,
    decision: decision.decision,
    requestedAmountLamports: scenario.intent.requestedAmountLamports,
    approvedAmountLamports: decision.approvedAmountLamports,
    intentHash: bundle.intentHash,
    proofRoot: bundle.proofRoot,
    permitId: permit.permitId,
    permitPda: derivePermitPda(PROGRAM_ID, bundle.intentHash),
    verified: verification.valid,
    shouldExecute: decision.decision === "RELEASE" || decision.decision === "CAP",
    reasons: decision.reasons
  };
}

const summaries = (["release", "cap", "block"] as const).map(summarizeScenario);

console.log(
  JSON.stringify(
    {
      programId: PROGRAM_ID,
      policyId: DEFAULT_GUARD_POLICY.policyId,
      note:
        "Local SDK integration example only. No wallet, RPC, private key, or transaction is used.",
      summaries
    },
    null,
    2
  )
);
