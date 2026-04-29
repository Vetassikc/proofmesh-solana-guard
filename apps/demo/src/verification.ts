import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

import {
  programEvidence,
  scenarios,
  type ProgramEvidence,
  type ScenarioEvidence
} from "./evidence.js";
import { PROOFMESH_GUARD_PROGRAM_ID } from "./liveFlow.js";

export type VerificationScope = "Program" | "RELEASE" | "CAP" | "BLOCK";

export interface VerificationCheck {
  id: string;
  scope: VerificationScope;
  label: string;
  ok: boolean;
  detail: string;
}

export interface ScenarioVerification {
  scenario: ScenarioEvidence;
  expectedPermitPda: string | null;
  checks: readonly VerificationCheck[];
  ok: boolean;
}

export interface LedgerVerification {
  checks: readonly VerificationCheck[];
  scenarios: readonly ScenarioVerification[];
  ok: boolean;
}

export interface EvidencePack {
  json: string;
  markdown: string;
}

export function deriveExpectedPermitPda(args: {
  programId: string;
  intentHash: string;
}): string {
  if (!isBytes32Hex(args.intentHash)) {
    throw new Error("Intent hash must be a 32-byte hex string");
  }

  const [permitPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("permit"), Buffer.from(args.intentHash, "hex")],
    new PublicKey(args.programId)
  );

  return permitPda.toBase58();
}

export function verifyCapturedEvidence(args: {
  program?: ProgramEvidence;
  scenarioList?: readonly ScenarioEvidence[];
} = {}): LedgerVerification {
  const program = args.program ?? programEvidence;
  const scenarioList = args.scenarioList ?? scenarios;
  const programChecks: VerificationCheck[] = [
    {
      detail:
        program.programId === PROOFMESH_GUARD_PROGRAM_ID
          ? `Program id matches ${PROOFMESH_GUARD_PROGRAM_ID}`
          : `Expected ${PROOFMESH_GUARD_PROGRAM_ID}, got ${program.programId}`,
      id: "program-id",
      label: "Program id matches deployed devnet program",
      ok: program.programId === PROOFMESH_GUARD_PROGRAM_ID,
      scope: "Program"
    },
    {
      detail: program.deployUrl,
      id: "deploy-transaction",
      label: "Deploy transaction is explorer-verifiable",
      ok: isDevnetExplorerUrl(program.deployUrl) && program.deploySignature.length > 0,
      scope: "Program"
    }
  ];

  const scenarioResults = scenarioList.map((scenario) =>
    verifyScenarioEvidence(scenario, program.programId)
  );
  const checks = [
    ...programChecks,
    ...scenarioResults.flatMap((result) => result.checks)
  ];

  return {
    checks,
    ok: checks.every((check) => check.ok),
    scenarios: scenarioResults
  };
}

export function verifyScenarioEvidence(
  scenario: ScenarioEvidence,
  programId = PROOFMESH_GUARD_PROGRAM_ID
): ScenarioVerification {
  let expectedPermitPda: string | null = null;

  try {
    expectedPermitPda = deriveExpectedPermitPda({
      intentHash: scenario.intentHash,
      programId
    });
  } catch {
    expectedPermitPda = null;
  }

  const amountCheck = verifyAmountInvariant(scenario);
  const checks: VerificationCheck[] = [
    {
      detail: scenario.intentHash,
      id: `${scenario.id}-intent-hash`,
      label: `${scenario.decision} intent hash is 32 bytes`,
      ok: isBytes32Hex(scenario.intentHash),
      scope: scenario.decision
    },
    {
      detail: scenario.proofRoot,
      id: `${scenario.id}-proof-root`,
      label: `${scenario.decision} proof root is 32 bytes`,
      ok: isBytes32Hex(scenario.proofRoot),
      scope: scenario.decision
    },
    {
      detail:
        expectedPermitPda === null
          ? "Unable to derive permit PDA from captured intent hash"
          : `Expected ${expectedPermitPda}`,
      id: `${scenario.id}-permit-pda`,
      label: `${scenario.decision} permit PDA matches seeds`,
      ok: expectedPermitPda !== null && expectedPermitPda === scenario.permitPda,
      scope: scenario.decision
    },
    {
      detail: amountCheck.detail,
      id: `${scenario.id}-amount-invariant`,
      label: `${scenario.decision} approved amount invariant`,
      ok: amountCheck.ok,
      scope: scenario.decision
    },
    {
      detail:
        scenario.decision === "BLOCK"
          ? "BLOCK intentionally has no execute transaction"
          : "RELEASE and CAP must include execute signatures",
      id: `${scenario.id}-execute-signature`,
      label: `${scenario.decision} execute transaction rule`,
      ok:
        scenario.decision === "BLOCK"
          ? scenario.executeSignature === null && scenario.executeUrl === null
          : Boolean(scenario.executeSignature && scenario.executeUrl),
      scope: scenario.decision
    },
    {
      detail: scenario.issueUrl,
      id: `${scenario.id}-issue-link`,
      label: `${scenario.decision} issue link is devnet explorer`,
      ok: isDevnetExplorerUrl(scenario.issueUrl),
      scope: scenario.decision
    },
    {
      detail: scenario.permitUrl,
      id: `${scenario.id}-permit-link`,
      label: `${scenario.decision} permit link is devnet explorer`,
      ok: isDevnetExplorerUrl(scenario.permitUrl),
      scope: scenario.decision
    }
  ];

  if (scenario.executeUrl) {
    checks.push({
      detail: scenario.executeUrl,
      id: `${scenario.id}-execute-link`,
      label: `${scenario.decision} execute link is devnet explorer`,
      ok: isDevnetExplorerUrl(scenario.executeUrl),
      scope: scenario.decision
    });
  }

  return {
    checks,
    expectedPermitPda,
    ok: checks.every((check) => check.ok),
    scenario
  };
}

export function buildEvidencePack(
  verification = verifyCapturedEvidence()
): EvidencePack {
  const status = verification.ok ? "PASS" : "FAIL";
  const payload = {
    program: {
      deployTransaction: programEvidence.deployUrl,
      explorer: programEvidence.explorerUrl,
      programId: programEvidence.programId,
      verificationStatus: status
    },
    scenarios: verification.scenarios.map((result) => ({
      approvedAmountLamports: result.scenario.approvedAmountLamports,
      decision: result.scenario.decision,
      execute: result.scenario.executeUrl,
      issue: result.scenario.issueUrl,
      permitPda: result.scenario.permitPda,
      requestedAmountLamports: result.scenario.requestedAmountLamports,
      scenario: result.scenario.id,
      verificationStatus: result.ok ? "PASS" : "FAIL"
    }))
  };

  const markdown = [
    "# ProofMesh Guard Evidence Pack",
    "",
    `Verification status: ${status}`,
    "",
    `Program: ${programEvidence.programId}`,
    `Program Explorer: ${programEvidence.explorerUrl}`,
    `Deploy Transaction: ${programEvidence.deployUrl}`,
    "",
    ...verification.scenarios.flatMap((result) => [
      `## ${result.scenario.decision}`,
      "",
      `Status: ${result.ok ? "PASS" : "FAIL"}`,
      `Permit PDA: ${result.scenario.permitPda}`,
      `Issue: ${result.scenario.issueUrl}`,
      `Execute: ${
        result.scenario.executeUrl ?? "No execute transaction by design"
      }`,
      ""
    ])
  ].join("\n");

  return {
    json: JSON.stringify(payload, null, 2),
    markdown
  };
}

function verifyAmountInvariant(scenario: ScenarioEvidence): {
  detail: string;
  ok: boolean;
} {
  const requested = BigInt(scenario.requestedAmountLamports);
  const approved = BigInt(scenario.approvedAmountLamports);

  if (scenario.decision === "RELEASE") {
    return {
      detail: `${approved.toString()} approved / ${requested.toString()} requested`,
      ok: approved === requested
    };
  }

  if (scenario.decision === "CAP") {
    return {
      detail: `${approved.toString()} approved / ${requested.toString()} requested`,
      ok: approved > 0n && approved < requested
    };
  }

  return {
    detail: `${approved.toString()} approved for blocked payout`,
    ok: approved === 0n
  };
}

function isBytes32Hex(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}

function isDevnetExplorerUrl(value: string): boolean {
  return /^https:\/\/explorer\.solana\.com\/(address|tx)\/[1-9A-HJ-NP-Za-km-z]+[?]cluster=devnet$/.test(
    value
  );
}
