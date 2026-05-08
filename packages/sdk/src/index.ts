import { createHash } from "node:crypto";

/** Guard decision outcome for a payout intent. */
export type GuardDecisionKind = "RELEASE" | "CAP" | "HOLD" | "BLOCK";

/** Status of an individual proof within a proof bundle. */
export type ProofStatus = "PASS" | "FAIL" | "MISSING" | "EXPIRED";

/** A proposed payout from a treasury to a recipient. */
export interface PayoutIntent {
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
  /** Unique nonce to prevent replay. */
  nonce: string;
  /** ISO 8601 expiry timestamp. */
  expiresAt: string;
}

/** An inspectable fact used during policy evaluation. */
export interface Proof {
  kind: "recipient_identity" | "wallet_risk" | "invoice_integrity";
  source: string;
  subject: string;
  status: ProofStatus;
  observations: readonly string[];
  evidenceHash: string;
  issuedAt: string;
  expiresAt?: string;
}

/** Deterministic commitment binding a payout intent to its proofs. */
export interface ProofBundle {
  intentHash: string;
  proofs: readonly Proof[];
  proofRoot: string;
  bundleHash: string;
  generatedAt: string;
}

export interface GuardDecision {
  decision: GuardDecisionKind;
  approvedAmountLamports: string;
  reasons: readonly string[];
  policyId: string;
}

/**
 * The core product object: a verifiable artifact created before a risky payout.
 * Maps to RELEASE, CAP, HOLD, or BLOCK and can be anchored on Solana as a PDA.
 */
export interface TrustPermit {
  permitId: string;
  intentHash: string;
  proofRoot: string;
  decision: GuardDecisionKind;
  requestedAmountLamports: string;
  approvedAmountLamports: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  /** Solana PDA address, set after anchoring. */
  solanaAccount?: string;
  /** Transaction signature, set after anchoring. */
  transactionSignature?: string;
}

export interface TrustPermitCore {
  approvedAmountLamports: string;
  decision: GuardDecisionKind;
  intentHash: string;
  issuer: string;
  proofRoot: string;
  requestedAmountLamports: string;
}

export interface VerificationResult {
  valid: boolean;
  errors: readonly string[];
  intentHash: string;
  proofRoot: string;
}

/** Policy configuration that controls decision thresholds and required proofs. */
export interface GuardPolicy {
  policyId: string;
  /** Maximum amount in lamports for a RELEASE decision; above this triggers CAP. */
  maxReleaseLamports: string;
  /** Proof kinds that must be present and non-failed for RELEASE or CAP. */
  requiredProofKinds: readonly Proof["kind"][];
  evaluatedAt: string;
}

export interface GuardScenario {
  intent: PayoutIntent;
  proofs: readonly Proof[];
  generatedAt: string;
}

/** Default policy: 1 SOL cap, requires all three proof kinds. */
export const DEFAULT_GUARD_POLICY: GuardPolicy = {
  policyId: "proofmesh-default-v1",
  maxReleaseLamports: "1000000000",
  requiredProofKinds: [
    "recipient_identity",
    "wallet_risk",
    "invoice_integrity"
  ],
  evaluatedAt: "2026-04-29T00:00:00.000Z"
};

const baseProofs: readonly Proof[] = [
  {
    kind: "recipient_identity",
    source: "proofmesh-fixture",
    subject: "vendor-clean",
    status: "PASS",
    observations: ["Recipient profile matches payout metadata"],
    evidenceHash: "fixture-recipient-identity-pass",
    issuedAt: "2026-04-29T00:00:00.000Z",
    expiresAt: "2026-05-12T00:00:00.000Z"
  },
  {
    kind: "wallet_risk",
    source: "proofmesh-fixture",
    subject: "vendor-clean",
    status: "PASS",
    observations: ["Wallet risk fixture is below policy threshold"],
    evidenceHash: "fixture-wallet-risk-pass",
    issuedAt: "2026-04-29T00:00:00.000Z",
    expiresAt: "2026-05-12T00:00:00.000Z"
  },
  {
    kind: "invoice_integrity",
    source: "proofmesh-fixture",
    subject: "invoice-clean",
    status: "PASS",
    observations: ["Invoice amount and vendor metadata are internally consistent"],
    evidenceHash: "fixture-invoice-integrity-pass",
    issuedAt: "2026-04-29T00:00:00.000Z",
    expiresAt: "2026-05-12T00:00:00.000Z"
  }
];

export const guardScenarios: Readonly<{
  release: GuardScenario;
  cap: GuardScenario;
  block: GuardScenario;
}> = {
  release: {
    generatedAt: "2026-04-29T00:00:00.000Z",
    intent: {
      id: "intent-release-001",
      treasury: "demo-treasury-release",
      recipient: "vendor-clean",
      asset: "SOL",
      requestedAmountLamports: "500000000",
      metadata: {
        invoiceId: "invoice-clean",
        vendorId: "vendor-clean",
        description: "Clean vendor payout fixture"
      },
      nonce: "release-001",
      expiresAt: "2026-05-12T00:00:00.000Z"
    },
    proofs: baseProofs
  },
  cap: {
    generatedAt: "2026-04-29T00:00:00.000Z",
    intent: {
      id: "intent-cap-001",
      treasury: "demo-treasury-cap",
      recipient: "vendor-large",
      asset: "SOL",
      requestedAmountLamports: "1500000000",
      metadata: {
        invoiceId: "invoice-large",
        vendorId: "vendor-large",
        description: "Oversized vendor payout fixture"
      },
      nonce: "cap-001",
      expiresAt: "2026-05-12T00:00:00.000Z"
    },
    proofs: baseProofs.map((proof) => ({
      ...proof,
      subject:
        proof.kind === "invoice_integrity" ? "invoice-large" : "vendor-large"
    }))
  },
  block: {
    generatedAt: "2026-04-29T00:00:00.000Z",
    intent: {
      id: "intent-block-001",
      treasury: "demo-treasury-block",
      recipient: "vendor-risky",
      asset: "SOL",
      requestedAmountLamports: "500000000",
      metadata: {
        invoiceId: "invoice-risky",
        vendorId: "vendor-risky",
        description: "Blocked recipient payout fixture"
      },
      nonce: "block-001",
      expiresAt: "2026-05-12T00:00:00.000Z"
    },
    proofs: baseProofs.map((proof) =>
      proof.kind === "wallet_risk"
        ? {
            ...proof,
            subject: "vendor-risky",
            status: "FAIL",
            observations: ["Wallet risk fixture fails policy threshold"],
            evidenceHash: "fixture-wallet-risk-fail"
          }
        : {
            ...proof,
            subject:
              proof.kind === "invoice_integrity"
                ? "invoice-risky"
                : "vendor-risky"
          }
    )
  }
};

type CanonicalValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

function normalizeForCanonicalJson(value: unknown): CanonicalValue {
  if (value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "boolean") {
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
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

    return Object.fromEntries(
      entries.map(([key, entryValue]) => [
        key,
        normalizeForCanonicalJson(entryValue)
      ])
    ) as { readonly [key: string]: CanonicalValue };
  }

  throw new TypeError(`Cannot canonicalize value of type ${typeof value}`);
}

/** Serialize a value to deterministic JSON with sorted keys. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalizeForCanonicalJson(value));
}

/** SHA-256 hash of canonical JSON representation. */
export function hashCanonicalJson(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

/** Compute the deterministic hash of a payout intent. */
export function hashPayoutIntent(intent: PayoutIntent): string {
  return hashCanonicalJson(intent);
}

/**
 * Build a deterministic proof bundle from an intent and its proofs.
 * The bundle commits to the intent hash and proof root for verification.
 */
export function buildProofBundle(
  intent: PayoutIntent,
  proofs: readonly Proof[],
  generatedAt: string
): ProofBundle {
  const intentHash = hashPayoutIntent(intent);
  const proofRoot = generateProofRoot(proofs);
  const proofHashes = proofs.map((proof) => hashCanonicalJson(proof)).sort();

  return {
    intentHash,
    proofs,
    proofRoot,
    bundleHash: hashCanonicalJson({
      generatedAt,
      intentHash,
      proofHashes,
      proofRoot
    }),
    generatedAt
  };
}

/**
 * Evaluate a payout intent against a policy to produce a guard decision.
 * Returns RELEASE, CAP, HOLD, or BLOCK based on proof status and amount limits.
 */
export function evaluatePayoutIntent(
  intent: PayoutIntent,
  bundle: ProofBundle,
  policy: GuardPolicy
): GuardDecision {
  const proofRoot = generateProofRoot(bundle.proofs);

  if (bundle.intentHash !== hashPayoutIntent(intent)) {
    return {
      decision: "BLOCK",
      approvedAmountLamports: "0",
      reasons: ["Intent hash does not match proof bundle"],
      policyId: policy.policyId
    };
  }

  if (bundle.proofRoot !== proofRoot) {
    return {
      decision: "BLOCK",
      approvedAmountLamports: "0",
      reasons: ["Proof root does not match proof bundle"],
      policyId: policy.policyId
    };
  }

  const reasons: string[] = [];
  const proofsByKind = new Map<Proof["kind"], Proof>(
    bundle.proofs.map((proof) => [proof.kind, proof])
  );

  for (const requiredKind of policy.requiredProofKinds) {
    const proof = proofsByKind.get(requiredKind);

    if (!proof || proof.status === "MISSING") {
      reasons.push(`Missing required proof: ${requiredKind}`);
      continue;
    }

    if (
      proof.status === "EXPIRED" ||
      (proof.expiresAt && proof.expiresAt < policy.evaluatedAt)
    ) {
      reasons.push(`Expired required proof: ${requiredKind}`);
    }
  }

  if (reasons.length > 0) {
    return {
      decision: "HOLD",
      approvedAmountLamports: "0",
      reasons,
      policyId: policy.policyId
    };
  }

  const failedProofs = bundle.proofs.filter((proof) => proof.status === "FAIL");

  if (failedProofs.length > 0) {
    return {
      decision: "BLOCK",
      approvedAmountLamports: "0",
      reasons: failedProofs.map((proof) => `Required proof failed: ${proof.kind}`),
      policyId: policy.policyId
    };
  }

  if (
    BigInt(intent.requestedAmountLamports) > BigInt(policy.maxReleaseLamports)
  ) {
    return {
      decision: "CAP",
      approvedAmountLamports: policy.maxReleaseLamports,
      reasons: [
        `Requested amount ${intent.requestedAmountLamports} exceeds cap ${policy.maxReleaseLamports}`
      ],
      policyId: policy.policyId
    };
  }

  return {
    decision: "RELEASE",
    approvedAmountLamports: intent.requestedAmountLamports,
    reasons: ["All required proofs passed"],
    policyId: policy.policyId
  };
}

export function buildTrustPermitCore(input: TrustPermitCore): TrustPermitCore {
  return {
    approvedAmountLamports: input.approvedAmountLamports,
    decision: input.decision,
    intentHash: input.intentHash,
    issuer: input.issuer,
    proofRoot: input.proofRoot,
    requestedAmountLamports: input.requestedAmountLamports
  };
}

export function computeTrustPermitId(input: TrustPermitCore): string {
  return hashCanonicalJson(buildTrustPermitCore(input));
}

/**
 * Issue a trust permit binding the intent, proof bundle, and guard decision.
 * The permit ID is deterministic — same inputs always produce the same permit.
 */
export function issueTrustPermit(
  intent: PayoutIntent,
  bundle: ProofBundle,
  decision: GuardDecision,
  options: { issuer: string; issuedAt: string }
): TrustPermit {
  const permitCore = buildTrustPermitCore({
    approvedAmountLamports: decision.approvedAmountLamports,
    decision: decision.decision,
    intentHash: bundle.intentHash,
    issuer: options.issuer,
    proofRoot: bundle.proofRoot,
    requestedAmountLamports: intent.requestedAmountLamports
  });

  return {
    permitId: computeTrustPermitId(permitCore),
    intentHash: bundle.intentHash,
    proofRoot: bundle.proofRoot,
    decision: decision.decision,
    requestedAmountLamports: intent.requestedAmountLamports,
    approvedAmountLamports: decision.approvedAmountLamports,
    issuer: options.issuer,
    issuedAt: options.issuedAt,
    expiresAt: intent.expiresAt
  };
}

/**
 * Verify a trust permit's integrity against its source intent and proof bundle.
 * Checks permit ID, intent hash, proof root, and amount consistency.
 */
export function verifyTrustPermit(
  permit: TrustPermit,
  intent: PayoutIntent,
  bundle: ProofBundle
): VerificationResult {
  const intentHash = hashPayoutIntent(intent);
  const proofRoot = generateProofRoot(bundle.proofs);
  const expectedPermitId = computeTrustPermitId({
    approvedAmountLamports: permit.approvedAmountLamports,
    decision: permit.decision,
    intentHash: permit.intentHash,
    issuer: permit.issuer,
    proofRoot: permit.proofRoot,
    requestedAmountLamports: permit.requestedAmountLamports
  });
  const errors: string[] = [];

  if (permit.permitId !== expectedPermitId) {
    errors.push("Permit id does not match permit fields");
  }

  if (permit.intentHash !== intentHash) {
    errors.push("Intent hash does not match permit");
  }

  if (bundle.intentHash !== intentHash) {
    errors.push("Bundle intent hash does not match intent");
  }

  if (permit.proofRoot !== proofRoot) {
    errors.push("Proof root does not match permit");
  }

  if (bundle.proofRoot !== proofRoot) {
    errors.push("Bundle proof root is invalid");
  }

  if (permit.requestedAmountLamports !== intent.requestedAmountLamports) {
    errors.push("Requested amount does not match permit");
  }

  return {
    valid: errors.length === 0,
    errors,
    intentHash,
    proofRoot
  };
}

export function generateProofRoot(proofs: readonly Proof[]): string {
  const proofHashes = proofs.map((proof) => hashCanonicalJson(proof)).sort();

  return hashCanonicalJson({
    proofHashes
  });
}
