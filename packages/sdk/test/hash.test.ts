import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProofBundle,
  canonicalJson,
  generateProofRoot,
  guardScenarios,
  hashCanonicalJson,
  hashPayoutIntent
} from "../src/index.js";

test("canonicalJson sorts object keys recursively", () => {
  const left = {
    z: "last",
    a: {
      y: 2,
      x: 1
    }
  };
  const right = {
    a: {
      x: 1,
      y: 2
    },
    z: "last"
  };

  assert.equal(canonicalJson(left), canonicalJson(right));
  assert.equal(
    canonicalJson(left),
    "{\"a\":{\"x\":1,\"y\":2},\"z\":\"last\"}"
  );
});

test("hashCanonicalJson is stable for equivalent values", () => {
  const left = { amount: "1000", recipient: "vendor-clean", tags: ["a", "b"] };
  const right = { tags: ["a", "b"], recipient: "vendor-clean", amount: "1000" };

  assert.equal(hashCanonicalJson(left), hashCanonicalJson(right));
  assert.match(hashCanonicalJson(left), /^[a-f0-9]{64}$/);
});

test("hashPayoutIntent is deterministic for the release fixture", () => {
  const { intent } = guardScenarios.release;
  const shuffledIntent = {
    expiresAt: intent.expiresAt,
    nonce: intent.nonce,
    metadata: intent.metadata,
    requestedAmountLamports: intent.requestedAmountLamports,
    asset: intent.asset,
    recipient: intent.recipient,
    treasury: intent.treasury,
    id: intent.id
  };

  assert.equal(hashPayoutIntent(intent), hashPayoutIntent(shuffledIntent));
  assert.match(hashPayoutIntent(intent), /^[a-f0-9]{64}$/);
});

test("generateProofRoot is independent of proof ordering", () => {
  const { proofs } = guardScenarios.release;
  const reversed = [...proofs].reverse();

  assert.equal(generateProofRoot(proofs), generateProofRoot(reversed));
  assert.match(generateProofRoot(proofs), /^[a-f0-9]{64}$/);
});

test("generateProofRoot changes when proof evidence changes", () => {
  const { proofs } = guardScenarios.release;
  const changedProofs = proofs.map((proof, index) =>
    index === 0
      ? { ...proof, evidenceHash: `${proof.evidenceHash}-changed` }
      : proof
  );

  assert.notEqual(generateProofRoot(proofs), generateProofRoot(changedProofs));
});

test("buildProofBundle binds intent hash and proof root", () => {
  const { intent, proofs, generatedAt } = guardScenarios.release;
  const bundle = buildProofBundle(intent, proofs, generatedAt);

  assert.equal(bundle.intentHash, hashPayoutIntent(intent));
  assert.equal(bundle.proofRoot, generateProofRoot(proofs));
  assert.match(bundle.bundleHash, /^[a-f0-9]{64}$/);
});
