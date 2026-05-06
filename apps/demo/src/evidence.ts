export type ScenarioId = "release" | "cap" | "block";
export type Decision = "RELEASE" | "CAP" | "BLOCK";
export type LedgerKind = "Program" | "Deploy" | "Permit" | "Issue" | "Execute";

export interface ProgramEvidence {
  programId: string;
  upgradeAuthority: string;
  deploySignature: string;
  explorerUrl: string;
  deployUrl: string;
  programDataAddress: string;
  lastDeployedSlot: string;
}

export interface ScenarioEvidence {
  id: ScenarioId;
  label: string;
  summary: string;
  result: string;
  decision: Decision;
  requestedAmountLamports: string;
  approvedAmountLamports: string;
  permitPda: string;
  proofRoot: string;
  issueSignature: string;
  issueUrl: string;
  executeSignature: string | null;
  executeUrl: string | null;
  permitUrl: string;
  intentHash: string;
  recipient: string;
  treasury: string;
}

export interface LedgerRow {
  scenario: "PROGRAM" | Decision;
  kind: LedgerKind;
  label: string;
  url: string;
}

export interface ScenarioPresentation {
  impactLabel: string;
  statusLabel: string;
}

export const flowSteps = [
  "Payout Intent",
  "Proof Bundle",
  "Guard Decision",
  "Trust Permit",
  "Solana Evidence",
  "Payout Result"
] as const;

export const programEvidence: ProgramEvidence = {
  deploySignature:
    "3YeX1Y418UAZcsQHddJ5VX6VZ53zGf6JxaTbYD81BEoc48JwWTeaYVN3ituJUrxcE9Y3pBRZ4MV1hPvCJKaUYbPa",
  deployUrl:
    "https://explorer.solana.com/tx/3YeX1Y418UAZcsQHddJ5VX6VZ53zGf6JxaTbYD81BEoc48JwWTeaYVN3ituJUrxcE9Y3pBRZ4MV1hPvCJKaUYbPa?cluster=devnet",
  explorerUrl:
    "https://explorer.solana.com/address/5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk?cluster=devnet",
  lastDeployedSlot: "458875799",
  programDataAddress: "29MtZLBSPuKmaeErXXZ4WaKpZQtWSF16H6sjhYZ58DYZ",
  programId: "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk",
  upgradeAuthority: "4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ"
};

export const scenarios: readonly ScenarioEvidence[] = [
  {
    approvedAmountLamports: "500000000",
    decision: "RELEASE",
    executeSignature:
      "2KAyBgLb1dZ65jyq264k27kQvSpNbTZk92MuMYP671jue9bpmqsQjwQVtRF7jy3SX2n5yfXqa5rFT27XmGNBZqDF",
    executeUrl:
      "https://explorer.solana.com/tx/2KAyBgLb1dZ65jyq264k27kQvSpNbTZk92MuMYP671jue9bpmqsQjwQVtRF7jy3SX2n5yfXqa5rFT27XmGNBZqDF?cluster=devnet",
    id: "release",
    intentHash:
      "0656ac753926b129a5ef4616c524d927954912604c3f792fcf29bb137a65c324",
    issueSignature:
      "3Ez5afKC74VG4mBq8827M3V8oVAtnVHTpcSqg4ucZ2Us4cj5TcTc6YBedeD2gMYW1be8wUr4v1p43ebtY7y85mHk",
    issueUrl:
      "https://explorer.solana.com/tx/3Ez5afKC74VG4mBq8827M3V8oVAtnVHTpcSqg4ucZ2Us4cj5TcTc6YBedeD2gMYW1be8wUr4v1p43ebtY7y85mHk?cluster=devnet",
    label: "Clean payout",
    permitPda: "gQEKK4ivQ8NnA2wEHLZPZGfJFrzThHhgBiVCidHsBWF",
    permitUrl:
      "https://explorer.solana.com/address/gQEKK4ivQ8NnA2wEHLZPZGfJFrzThHhgBiVCidHsBWF?cluster=devnet",
    proofRoot:
      "61720ec0afa4453773906e08e53b45c1fa669f6e3c114bae09d9b48533f1eb8b",
    recipient: "7rH1q9pnbCb96971UanCNAk4pUkD7D5mkt4Mn3rEMhyA",
    requestedAmountLamports: "500000000",
    result: "Permit issued and payout executed for the full requested amount.",
    summary: "Required proofs passed and amount is inside policy.",
    treasury: programEvidence.upgradeAuthority
  },
  {
    approvedAmountLamports: "1000000000",
    decision: "CAP",
    executeSignature:
      "5Wy9UeCpAyM1zBMnLqjn5qCmbVMNM28CqdT8Hoz1wp26jXxSNhMEJmKboXVnjpgXP7M8bdgnMsveR3uYdKDgbDxd",
    executeUrl:
      "https://explorer.solana.com/tx/5Wy9UeCpAyM1zBMnLqjn5qCmbVMNM28CqdT8Hoz1wp26jXxSNhMEJmKboXVnjpgXP7M8bdgnMsveR3uYdKDgbDxd?cluster=devnet",
    id: "cap",
    intentHash:
      "b9bad1d710144e8e9ecbf89fafcb9cfa27baa6bacca04d201ba00bdfb213cfed",
    issueSignature:
      "2Lo7a2o8N74rkRnf5zyoecvRv8LYJRTyYLq2qoGLJjgjvEpij5mKAfpFcb8QShz8Vmb7g5AAJnPD2MtEBECyWMvC",
    issueUrl:
      "https://explorer.solana.com/tx/2Lo7a2o8N74rkRnf5zyoecvRv8LYJRTyYLq2qoGLJjgjvEpij5mKAfpFcb8QShz8Vmb7g5AAJnPD2MtEBECyWMvC?cluster=devnet",
    label: "Oversized payout",
    permitPda: "DpPzEAsPjMRACw6yHNZVaGucit8CHZjxJSwuNBKp2ZxC",
    permitUrl:
      "https://explorer.solana.com/address/DpPzEAsPjMRACw6yHNZVaGucit8CHZjxJSwuNBKp2ZxC?cluster=devnet",
    proofRoot:
      "f43cb469ea93c4e531a5d3eae34c03977a710ceab8b493180934633f7e2cdd02",
    recipient: "D5VRJrq5GZRc2AntDBmziZ1FjVGYWpRAAv4Ur1dk4JzS",
    requestedAmountLamports: "1500000000",
    result: "Permit issued and only the capped approved amount was executed.",
    summary: "Recipient is acceptable, but requested amount exceeds policy.",
    treasury: programEvidence.upgradeAuthority
  },
  {
    approvedAmountLamports: "0",
    decision: "BLOCK",
    executeSignature: null,
    executeUrl: null,
    id: "block",
    intentHash:
      "e6cc2936e986b64efde096d8a7772391893e907443ea98c8213c7ea1282b485f",
    issueSignature:
      "2pU33nosKpNvSvCzJzxDTcnjBRCaPB7pY4T6oEWUncYq9JqikFwAZbF7Rz885Yket5Ap5nxN8opjneAoMYNAg1eb",
    issueUrl:
      "https://explorer.solana.com/tx/2pU33nosKpNvSvCzJzxDTcnjBRCaPB7pY4T6oEWUncYq9JqikFwAZbF7Rz885Yket5Ap5nxN8opjneAoMYNAg1eb?cluster=devnet",
    label: "Risky payout",
    permitPda: "mYQKtUJbkC3FCVzy7vfquqMjLx1ShBxui9SP2jkLaAT",
    permitUrl:
      "https://explorer.solana.com/address/mYQKtUJbkC3FCVzy7vfquqMjLx1ShBxui9SP2jkLaAT?cluster=devnet",
    proofRoot:
      "312111a6c62d354e1170f6f0b576b9e02a3bd65bf10f27114aa2df080ceefdb2",
    recipient: "7jBHAnw1Ta53QFkWC12h5JQ6pz8KbAozQw416kxyR49Z",
    requestedAmountLamports: "500000000",
    result: "Permit issued as blocked evidence; payout was intentionally not executed.",
    summary: "Risk proof failed and approved amount is zero.",
    treasury: programEvidence.upgradeAuthority
  }
];

export const ledgerRows: readonly LedgerRow[] = [
  {
    kind: "Program",
    label: "ProofMesh Guard program",
    scenario: "PROGRAM",
    url: programEvidence.explorerUrl
  },
  {
    kind: "Deploy",
    label: "Program deployment transaction",
    scenario: "PROGRAM",
    url: programEvidence.deployUrl
  },
  ...scenarios.flatMap((scenario) => {
    const rows: LedgerRow[] = [
      {
        kind: "Permit",
        label: `${scenario.decision} permit PDA`,
        scenario: scenario.decision,
        url: scenario.permitUrl
      },
      {
        kind: "Issue",
        label: `${scenario.decision} issue transaction`,
        scenario: scenario.decision,
        url: scenario.issueUrl
      }
    ];

    if (scenario.executeUrl) {
      rows.push({
        kind: "Execute",
        label: `${scenario.decision} execute transaction`,
        scenario: scenario.decision,
        url: scenario.executeUrl
      });
    }

    return rows;
  })
];

export function getScenario(id: ScenarioId): ScenarioEvidence {
  const fallback = scenarios[0];

  if (!fallback) {
    throw new Error("Demo scenarios are not configured");
  }

  return scenarios.find((scenario) => scenario.id === id) ?? fallback;
}

export function getScenarioPresentation(
  scenario: ScenarioEvidence
): ScenarioPresentation {
  switch (scenario.decision) {
    case "RELEASE":
      return {
        impactLabel: "Release full payout",
        statusLabel: "Executed"
      };
    case "CAP":
      return {
        impactLabel: "Cap to policy limit",
        statusLabel: "Capped execution"
      };
    case "BLOCK":
      return {
        impactLabel: "Stop payout before funds move",
        statusLabel: "Blocked"
      };
  }
}

export function formatLamports(lamports: string): string {
  const value = Number(lamports) / 1_000_000_000;

  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1
  })} SOL`;
}

export function shortHash(value: string): string {
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}
