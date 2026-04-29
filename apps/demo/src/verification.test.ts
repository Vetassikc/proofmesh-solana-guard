import assert from "node:assert/strict";
import test from "node:test";

import { getScenario, programEvidence, scenarios } from "./evidence.js";
import {
  buildEvidencePack,
  deriveExpectedPermitPda,
  verifyCapturedEvidence,
  verifyScenarioEvidence
} from "./verification.js";

test("captured RELEASE, CAP, and BLOCK evidence verifies", () => {
  const verification = verifyCapturedEvidence();

  assert.equal(verification.ok, true);
  assert.deepEqual(
    verification.scenarios.map((result) => [result.scenario.id, result.ok]),
    [
      ["release", true],
      ["cap", true],
      ["block", true]
    ]
  );
});

test("permit PDA is recomputed from program id and intent hash", () => {
  const release = getScenario("release");

  assert.equal(
    deriveExpectedPermitPda({
      intentHash: release.intentHash,
      programId: programEvidence.programId
    }),
    release.permitPda
  );
});

test("BLOCK intentionally has no execute transaction", () => {
  const block = verifyScenarioEvidence(getScenario("block"));
  const executeRule = block.checks.find(
    (check) => check.id === "block-execute-signature"
  );

  assert.equal(block.ok, true);
  assert.equal(executeRule?.ok, true);
  assert.match(executeRule?.detail ?? "", /no execute transaction/i);
});

test("tampered PDA fails verification", () => {
  const release = getScenario("release");
  const verification = verifyScenarioEvidence({
    ...release,
    permitPda: getScenario("cap").permitPda
  });

  assert.equal(verification.ok, false);
  assert.equal(
    verification.checks.find((check) => check.id === "release-permit-pda")?.ok,
    false
  );
});

test("invalid amount invariants fail verification", () => {
  const release = verifyScenarioEvidence({
    ...getScenario("release"),
    approvedAmountLamports: "1"
  });
  const cap = verifyScenarioEvidence({
    ...getScenario("cap"),
    approvedAmountLamports: getScenario("cap").requestedAmountLamports
  });
  const block = verifyScenarioEvidence({
    ...getScenario("block"),
    approvedAmountLamports: "1"
  });

  assert.equal(
    release.checks.find((check) => check.id === "release-amount-invariant")?.ok,
    false
  );
  assert.equal(
    cap.checks.find((check) => check.id === "cap-amount-invariant")?.ok,
    false
  );
  assert.equal(
    block.checks.find((check) => check.id === "block-amount-invariant")?.ok,
    false
  );
});

test("evidence pack includes program, scenarios, links, and status", () => {
  const pack = buildEvidencePack();
  const parsed = JSON.parse(pack.json) as {
    program: { verificationStatus: string };
    scenarios: Array<{ scenario: string; verificationStatus: string }>;
  };

  assert.equal(parsed.program.verificationStatus, "PASS");
  assert.deepEqual(
    parsed.scenarios.map((scenario) => scenario.scenario),
    scenarios.map((scenario) => scenario.id)
  );
  assert.match(pack.markdown, /ProofMesh Guard Evidence Pack/);
  assert.match(pack.markdown, /No execute transaction by design/);
});
