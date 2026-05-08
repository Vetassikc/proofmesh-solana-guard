import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_GUARD_POLICY,
  buildProofBundle,
  evaluatePayoutIntent,
  guardScenarios,
  issueTrustPermit,
  verifyTrustPermit,
  type GuardPolicy,
  type PayoutIntent,
  type Proof
} from "../src/index.js";

// ---------------------------------------------------------------------------
// Expired proofs
// ---------------------------------------------------------------------------

test("expired proof triggers HOLD decision", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const expiredProofs: readonly Proof[] = proofs.map((proof) =>
    proof.kind === "wallet_risk"
      ? { ...proof, status: "EXPIRED" as const }
      : proof
  );
  const bundle = buildProofBundle(intent, expiredProofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "HOLD");
  assert.equal(decision.approvedAmountLamports, "0");
  assert.ok(decision.reasons.some((r) => r.includes("Expired")));
});

test("proof with past expiresAt triggers HOLD", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const pastExpiry: readonly Proof[] = proofs.map((proof) =>
    proof.kind === "invoice_integrity"
      ? { ...proof, expiresAt: "2020-01-01T00:00:00.000Z" }
      : proof
  );
  const bundle = buildProofBundle(intent, pastExpiry, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "HOLD");
  assert.ok(decision.reasons.some((r) => r.includes("Expired")));
});

// ---------------------------------------------------------------------------
// Tampered intent hash
// ---------------------------------------------------------------------------

test("tampered intent hash blocks the payout", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const tamperedIntent: PayoutIntent = {
    ...intent,
    requestedAmountLamports: "999999999999"
  };
  const decision = evaluatePayoutIntent(
    tamperedIntent,
    bundle,
    DEFAULT_GUARD_POLICY
  );

  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.approvedAmountLamports, "0");
  assert.ok(decision.reasons.some((r) => r.includes("Intent hash")));
});

// ---------------------------------------------------------------------------
// Amount edge cases
// ---------------------------------------------------------------------------

test("zero-amount intent still evaluates to RELEASE", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const zeroIntent: PayoutIntent = {
    ...intent,
    requestedAmountLamports: "0",
    nonce: "zero-amount-test"
  };
  const bundle = buildProofBundle(zeroIntent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(
    zeroIntent,
    bundle,
    DEFAULT_GUARD_POLICY
  );

  assert.equal(decision.decision, "RELEASE");
  assert.equal(decision.approvedAmountLamports, "0");
});

test("amount exactly at cap evaluates to RELEASE not CAP", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const atCapIntent: PayoutIntent = {
    ...intent,
    requestedAmountLamports: DEFAULT_GUARD_POLICY.maxReleaseLamports,
    nonce: "at-cap-test"
  };
  const bundle = buildProofBundle(atCapIntent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(
    atCapIntent,
    bundle,
    DEFAULT_GUARD_POLICY
  );

  assert.equal(decision.decision, "RELEASE");
  assert.equal(
    decision.approvedAmountLamports,
    DEFAULT_GUARD_POLICY.maxReleaseLamports
  );
});

test("amount one lamport over cap evaluates to CAP", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const overCapAmount = (
    BigInt(DEFAULT_GUARD_POLICY.maxReleaseLamports) + 1n
  ).toString();
  const overCapIntent: PayoutIntent = {
    ...intent,
    requestedAmountLamports: overCapAmount,
    nonce: "over-cap-test"
  };
  const bundle = buildProofBundle(overCapIntent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(
    overCapIntent,
    bundle,
    DEFAULT_GUARD_POLICY
  );

  assert.equal(decision.decision, "CAP");
  assert.equal(
    decision.approvedAmountLamports,
    DEFAULT_GUARD_POLICY.maxReleaseLamports
  );
});

// ---------------------------------------------------------------------------
// Multiple failures
// ---------------------------------------------------------------------------

test("multiple failed proofs lists all failures", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const allFailed: readonly Proof[] = proofs.map((proof) => ({
    ...proof,
    status: "FAIL" as const,
    observations: ["Fixture forced fail"]
  }));
  const bundle = buildProofBundle(intent, allFailed, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.approvedAmountLamports, "0");
  assert.equal(decision.reasons.length, 3);
});

// ---------------------------------------------------------------------------
// Double permit issuance (deterministic — same inputs = same permit)
// ---------------------------------------------------------------------------

test("issuing the same permit twice produces identical permit ids", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);
  const issueArgs = {
    issuer: "proofmesh-demo-issuer",
    issuedAt: generatedAt
  };

  const permit1 = issueTrustPermit(intent, bundle, decision, issueArgs);
  const permit2 = issueTrustPermit(intent, bundle, decision, issueArgs);

  assert.equal(permit1.permitId, permit2.permitId);
  assert.equal(permit1.intentHash, permit2.intentHash);
});

// ---------------------------------------------------------------------------
// Custom policy
// ---------------------------------------------------------------------------

test("custom policy with lower cap produces CAP at custom threshold", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const tightPolicy: GuardPolicy = {
    ...DEFAULT_GUARD_POLICY,
    policyId: "tight-policy-v1",
    maxReleaseLamports: "100000000"
  };
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, tightPolicy);

  assert.equal(decision.decision, "CAP");
  assert.equal(decision.approvedAmountLamports, "100000000");
  assert.equal(decision.policyId, "tight-policy-v1");
});
