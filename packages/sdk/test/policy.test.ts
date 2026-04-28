import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_GUARD_POLICY,
  buildProofBundle,
  evaluatePayoutIntent,
  guardScenarios,
  issueTrustPermit,
  verifyTrustPermit
} from "../src/index.js";

test("clean fixture evaluates to RELEASE", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "RELEASE");
  assert.equal(decision.approvedAmountLamports, intent.requestedAmountLamports);
  assert.deepEqual(decision.reasons, ["All required proofs passed"]);
});

test("oversized fixture evaluates to CAP", () => {
  const { intent, proofs, generatedAt } = guardScenarios.cap;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "CAP");
  assert.equal(
    decision.approvedAmountLamports,
    DEFAULT_GUARD_POLICY.maxReleaseLamports
  );
  assert.ok(decision.reasons.some((reason) => reason.includes("exceeds cap")));
});

test("risky fixture evaluates to BLOCK", () => {
  const { intent, proofs, generatedAt } = guardScenarios.block;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.approvedAmountLamports, "0");
  assert.ok(decision.reasons.some((reason) => reason.includes("failed")));
});

test("missing required proof evaluates to HOLD", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const incompleteProofs = proofs.filter(
    (proof) => proof.kind !== "invoice_integrity"
  );
  const bundle = buildProofBundle(intent, incompleteProofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);

  assert.equal(decision.decision, "HOLD");
  assert.equal(decision.approvedAmountLamports, "0");
  assert.ok(
    decision.reasons.includes("Missing required proof: invoice_integrity")
  );
});

test("issued permit verifies against matching intent and bundle", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);
  const permit = issueTrustPermit(intent, bundle, decision, {
    issuer: "proofmesh-demo-issuer",
    issuedAt: generatedAt
  });

  const result = verifyTrustPermit(permit, intent, bundle);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.intentHash, bundle.intentHash);
  assert.equal(result.proofRoot, bundle.proofRoot);
});

test("permit verification rejects mismatched proof bundles", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const bundle = buildProofBundle(intent, proofs, generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);
  const permit = issueTrustPermit(intent, bundle, decision, {
    issuer: "proofmesh-demo-issuer",
    issuedAt: generatedAt
  });
  const changedBundle = buildProofBundle(
    intent,
    proofs.map((proof, index) =>
      index === 0
        ? { ...proof, evidenceHash: `${proof.evidenceHash}-changed` }
        : proof
    ),
    generatedAt
  );

  const result = verifyTrustPermit(permit, intent, changedBundle);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Proof root does not match permit"));
});
