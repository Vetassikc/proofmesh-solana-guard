import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import { Buffer } from "buffer";

import type { ScenarioId } from "./evidence.js";

type GuardDecisionKind = "RELEASE" | "CAP" | "HOLD" | "BLOCK";
type ProofStatus = "PASS" | "FAIL" | "MISSING" | "EXPIRED";

interface PayoutIntent {
  id: string;
  treasury: string;
  recipient: string;
  asset: "SOL";
  requestedAmountLamports: string;
  metadata: {
    invoiceId: string;
    vendorId: string;
    description: string;
  };
  nonce: string;
  expiresAt: string;
}

interface Proof {
  kind: "recipient_identity" | "wallet_risk" | "invoice_integrity";
  source: string;
  subject: string;
  status: ProofStatus;
  observations: readonly string[];
  evidenceHash: string;
  issuedAt: string;
  expiresAt?: string;
}

interface GuardScenario {
  intent: PayoutIntent;
  proofs: readonly Proof[];
  generatedAt: string;
}

interface ProofBundle {
  intentHash: string;
  proofs: readonly Proof[];
  proofRoot: string;
}

interface GuardDecision {
  decision: GuardDecisionKind;
  approvedAmountLamports: string;
  reasons: readonly string[];
  policyId: string;
}

export type DemoMode = "evidence" | "live";

export interface ModeOption {
  id: DemoMode;
  label: string;
  summary: string;
}

export interface LiveScenarioCommand {
  label: string;
  requiresExecute: boolean;
}

export interface LiveRunPreview {
  approvedAmountLamports: string;
  decision: GuardDecision;
  executeUrl: (signature: string) => string;
  intent: PayoutIntent;
  intentHash: string;
  issueUrl: (signature: string) => string;
  permitPda: PublicKey;
  permitUrl: string;
  proofRoot: string;
  recipient: PublicKey;
  requestedAmountLamports: string;
  runId: string;
  scenarioId: ScenarioId;
  shouldExecute: boolean;
  treasury: PublicKey;
}

export const DEVNET_RPC_URL = "https://api.devnet.solana.com";
export const PROOFMESH_GUARD_PROGRAM_ID =
  "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk";

export const modeOptions: readonly ModeOption[] = [
  {
    id: "evidence",
    label: "Evidence Mode",
    summary: "Captured devnet evidence, no wallet required."
  },
  {
    id: "live",
    label: "Live Wallet Mode",
    summary: "Connect a devnet wallet and run a fresh guarded payout."
  }
];

export const liveFlowSteps = [
  "Connect wallet",
  "Build permit",
  "Issue permit",
  "Execute or block",
  "Evidence"
] as const;

const ISSUE_PERMIT_DISCRIMINATOR = Uint8Array.from([
  68, 63, 134, 74, 231, 77, 204, 24
]);
const EXECUTE_PAYOUT_DISCRIMINATOR = Uint8Array.from([
  12, 35, 52, 7, 95, 19, 169, 21
]);
const DEFAULT_POLICY = {
  maxReleaseLamports: "1000000000",
  policyId: "proofmesh-default-v1",
  requiredProofKinds: [
    "recipient_identity",
    "wallet_risk",
    "invoice_integrity"
  ] as const
};
const baseProofs: readonly Proof[] = [
  {
    evidenceHash: "fixture-recipient-identity-pass",
    expiresAt: "2026-05-12T00:00:00.000Z",
    issuedAt: "2026-04-29T00:00:00.000Z",
    kind: "recipient_identity",
    observations: ["Recipient profile matches payout metadata"],
    source: "proofmesh-fixture",
    status: "PASS",
    subject: "vendor-clean"
  },
  {
    evidenceHash: "fixture-wallet-risk-pass",
    expiresAt: "2026-05-12T00:00:00.000Z",
    issuedAt: "2026-04-29T00:00:00.000Z",
    kind: "wallet_risk",
    observations: ["Wallet risk fixture is below policy threshold"],
    source: "proofmesh-fixture",
    status: "PASS",
    subject: "vendor-clean"
  },
  {
    evidenceHash: "fixture-invoice-integrity-pass",
    expiresAt: "2026-05-12T00:00:00.000Z",
    issuedAt: "2026-04-29T00:00:00.000Z",
    kind: "invoice_integrity",
    observations: ["Invoice amount and vendor metadata are internally consistent"],
    source: "proofmesh-fixture",
    status: "PASS",
    subject: "invoice-clean"
  }
];
const liveGuardScenarios: Record<ScenarioId, GuardScenario> = {
  block: {
    generatedAt: "2026-04-29T00:00:00.000Z",
    intent: {
      asset: "SOL",
      expiresAt: "2026-05-12T00:00:00.000Z",
      id: "intent-block-001",
      metadata: {
        description: "Blocked recipient payout fixture",
        invoiceId: "invoice-risky",
        vendorId: "vendor-risky"
      },
      nonce: "block-001",
      recipient: "vendor-risky",
      requestedAmountLamports: "500000000",
      treasury: "demo-treasury-block"
    },
    proofs: baseProofs.map((proof) =>
      proof.kind === "wallet_risk"
        ? {
            ...proof,
            evidenceHash: "fixture-wallet-risk-fail",
            observations: ["Wallet risk fixture fails policy threshold"],
            status: "FAIL",
            subject: "vendor-risky"
          }
        : {
            ...proof,
            subject:
              proof.kind === "invoice_integrity"
                ? "invoice-risky"
                : "vendor-risky"
          }
    )
  },
  cap: {
    generatedAt: "2026-04-29T00:00:00.000Z",
    intent: {
      asset: "SOL",
      expiresAt: "2026-05-12T00:00:00.000Z",
      id: "intent-cap-001",
      metadata: {
        description: "Oversized vendor payout fixture",
        invoiceId: "invoice-large",
        vendorId: "vendor-large"
      },
      nonce: "cap-001",
      recipient: "vendor-large",
      requestedAmountLamports: "1500000000",
      treasury: "demo-treasury-cap"
    },
    proofs: baseProofs.map((proof) => ({
      ...proof,
      subject:
        proof.kind === "invoice_integrity" ? "invoice-large" : "vendor-large"
    }))
  },
  release: {
    generatedAt: "2026-04-29T00:00:00.000Z",
    intent: {
      asset: "SOL",
      expiresAt: "2026-05-12T00:00:00.000Z",
      id: "intent-release-001",
      metadata: {
        description: "Clean vendor payout fixture",
        invoiceId: "invoice-clean",
        vendorId: "vendor-clean"
      },
      nonce: "release-001",
      recipient: "vendor-clean",
      requestedAmountLamports: "500000000",
      treasury: "demo-treasury-release"
    },
    proofs: baseProofs
  }
};

export function getWalletUnavailableMessage(walletCount: number): string {
  if (walletCount === 0) {
    return "No Solana wallet detected. Evidence Mode remains fully available.";
  }

  return "Choose an installed Solana wallet to run a fresh devnet flow.";
}

export function getLiveScenarioCommand(
  scenarioId: ScenarioId
): LiveScenarioCommand {
  if (scenarioId === "block") {
    return {
      label: "Issue BLOCK permit. No execute transaction by design.",
      requiresExecute: false
    };
  }

  return {
    label:
      scenarioId === "cap"
        ? "Issue CAP permit, then execute capped payout."
        : "Issue RELEASE permit, then execute payout.",
    requiresExecute: true
  };
}

export function makeRunId(scenarioId: ScenarioId): string {
  return `live-${scenarioId}-${Date.now().toString(36)}`;
}

export async function buildLiveRunPreview(args: {
  runId: string;
  scenarioId: ScenarioId;
  walletPublicKey: string;
}): Promise<LiveRunPreview> {
  const treasury = new PublicKey(args.walletPublicKey);
  const scenario = liveGuardScenarios[args.scenarioId];
  const recipient = await PublicKey.createWithSeed(
    treasury,
    `pmg-${args.scenarioId}`,
    SystemProgram.programId
  );
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const intent: PayoutIntent = {
    ...scenario.intent,
    expiresAt,
    nonce: `${scenario.intent.nonce}-${args.runId}`,
    recipient: recipient.toBase58(),
    treasury: treasury.toBase58()
  };
  const bundle = await buildProofBundle(intent, scenario.proofs);
  const decision = await evaluatePayoutIntent(intent, bundle);
  const permitPda = derivePermitPda(bundle.intentHash);

  return {
    approvedAmountLamports: decision.approvedAmountLamports,
    decision,
    executeUrl: explorerTxUrl,
    intent,
    intentHash: bundle.intentHash,
    issueUrl: explorerTxUrl,
    permitPda,
    permitUrl: explorerAddressUrl(permitPda),
    proofRoot: bundle.proofRoot,
    recipient,
    requestedAmountLamports: intent.requestedAmountLamports,
    runId: args.runId,
    scenarioId: args.scenarioId,
    shouldExecute: getLiveScenarioCommand(args.scenarioId).requiresExecute,
    treasury
  };
}

export function buildIssuePermitTransaction(plan: LiveRunPreview): Transaction {
  return new Transaction().add(
    new TransactionInstruction({
      data: encodeIssuePermitData(plan),
      keys: [
        { isSigner: false, isWritable: true, pubkey: plan.permitPda },
        { isSigner: true, isWritable: true, pubkey: plan.treasury },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId }
      ],
      programId: new PublicKey(PROOFMESH_GUARD_PROGRAM_ID)
    })
  );
}

export function buildExecutePayoutTransaction(plan: LiveRunPreview): Transaction {
  return new Transaction().add(
    new TransactionInstruction({
      data: Buffer.from(EXECUTE_PAYOUT_DISCRIMINATOR),
      keys: [
        { isSigner: false, isWritable: true, pubkey: plan.permitPda },
        { isSigner: true, isWritable: true, pubkey: plan.treasury },
        { isSigner: false, isWritable: true, pubkey: plan.recipient },
        { isSigner: false, isWritable: false, pubkey: SystemProgram.programId }
      ],
      programId: new PublicKey(PROOFMESH_GUARD_PROGRAM_ID)
    })
  );
}

function derivePermitPda(intentHash: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("permit"), hexToBytes(intentHash)],
    new PublicKey(PROOFMESH_GUARD_PROGRAM_ID)
  )[0];
}

function encodeIssuePermitData(plan: LiveRunPreview): Buffer {
  return Buffer.concat([
    Buffer.from(ISSUE_PERMIT_DISCRIMINATOR),
    Buffer.from(hexToBytes(plan.intentHash)),
    Buffer.from(hexToBytes(plan.proofRoot)),
    Buffer.from([decisionIndex(plan.decision.decision)]),
    u64(plan.requestedAmountLamports),
    u64(plan.approvedAmountLamports),
    Buffer.from(plan.treasury.toBytes()),
    Buffer.from(plan.recipient.toBytes()),
    i64(Math.floor(Date.parse(plan.intent.expiresAt) / 1000).toString())
  ]);
}

function decisionIndex(decision: GuardDecision["decision"]): number {
  switch (decision) {
    case "RELEASE":
      return 0;
    case "CAP":
      return 1;
    case "HOLD":
      return 2;
    case "BLOCK":
      return 3;
  }
}

async function buildProofBundle(
  intent: PayoutIntent,
  proofs: readonly Proof[]
): Promise<ProofBundle> {
  const intentHash = await hashCanonicalJson(intent);
  const proofRoot = await generateProofRoot(proofs);

  return {
    intentHash,
    proofRoot,
    proofs
  };
}

async function evaluatePayoutIntent(
  intent: PayoutIntent,
  bundle: ProofBundle
): Promise<GuardDecision> {
  const proofRoot = await generateProofRoot(bundle.proofs);
  const intentHash = await hashCanonicalJson(intent);

  if (bundle.intentHash !== intentHash || bundle.proofRoot !== proofRoot) {
    return {
      approvedAmountLamports: "0",
      decision: "BLOCK",
      policyId: DEFAULT_POLICY.policyId,
      reasons: ["Bundle integrity failed"]
    };
  }

  const proofsByKind = new Map<Proof["kind"], Proof>(
    bundle.proofs.map((proof) => [proof.kind, proof])
  );

  for (const requiredKind of DEFAULT_POLICY.requiredProofKinds) {
    const proof = proofsByKind.get(requiredKind);

    if (!proof || proof.status === "MISSING" || proof.status === "EXPIRED") {
      return {
        approvedAmountLamports: "0",
        decision: "HOLD",
        policyId: DEFAULT_POLICY.policyId,
        reasons: [`Missing or expired required proof: ${requiredKind}`]
      };
    }
  }

  const failedProof = bundle.proofs.find((proof) => proof.status === "FAIL");

  if (failedProof) {
    return {
      approvedAmountLamports: "0",
      decision: "BLOCK",
      policyId: DEFAULT_POLICY.policyId,
      reasons: [`Required proof failed: ${failedProof.kind}`]
    };
  }

  if (BigInt(intent.requestedAmountLamports) > BigInt(DEFAULT_POLICY.maxReleaseLamports)) {
    return {
      approvedAmountLamports: DEFAULT_POLICY.maxReleaseLamports,
      decision: "CAP",
      policyId: DEFAULT_POLICY.policyId,
      reasons: ["Requested amount exceeds policy cap"]
    };
  }

  return {
    approvedAmountLamports: intent.requestedAmountLamports,
    decision: "RELEASE",
    policyId: DEFAULT_POLICY.policyId,
    reasons: ["All required proofs passed"]
  };
}

async function generateProofRoot(proofs: readonly Proof[]): Promise<string> {
  const proofHashes = await Promise.all(
    proofs.map((proof) => hashCanonicalJson(proof))
  );

  return hashCanonicalJson({
    proofHashes: proofHashes.sort()
  });
}

async function hashCanonicalJson(value: unknown): Promise<string> {
  const encoded = new TextEncoder().encode(canonicalJson(value));
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(normalizeForCanonicalJson(value));
}

function normalizeForCanonicalJson(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Cannot canonicalize non-finite numbers");
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeForCanonicalJson(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, entryValue]) => [key, normalizeForCanonicalJson(entryValue)])
    );
  }

  throw new TypeError(`Cannot canonicalize value of type ${typeof value}`);
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("Expected a 32-byte hex string");
  }

  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function u64(value: string): Buffer {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
  return Buffer.from(bytes);
}

function i64(value: string): Buffer {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
  return Buffer.from(bytes);
}

function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

function explorerAddressUrl(address: PublicKey): string {
  return `https://explorer.solana.com/address/${address.toBase58()}?cluster=devnet`;
}
