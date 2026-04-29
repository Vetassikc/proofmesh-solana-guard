import assert from "node:assert/strict";
import test from "node:test";

import {
  flowSteps,
  getScenario,
  ledgerRows,
  programEvidence,
  scenarios
} from "./evidence.js";

test("demo evidence includes the deployed devnet program", () => {
  assert.equal(
    programEvidence.programId,
    "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk"
  );
  assert.match(programEvidence.explorerUrl, /cluster=devnet/);
});

test("demo exposes release, cap, and block scenarios", () => {
  assert.deepEqual(
    scenarios.map((scenario) => scenario.id),
    ["release", "cap", "block"]
  );
});

test("block scenario intentionally has no execute transaction", () => {
  const block = getScenario("block");

  assert.equal(block.decision, "BLOCK");
  assert.equal(block.executeSignature, null);
  assert.equal(block.executeUrl, null);
  assert.match(block.result, /not executed/i);
});

test("ledger rows include every judge evidence link", () => {
  assert.equal(ledgerRows.length, 9);
  assert.equal(ledgerRows.filter((row) => row.scenario === "BLOCK").length, 2);
  assert.equal(ledgerRows.every((row) => row.url.includes("cluster=devnet")), true);
});

test("flow copy keeps the required product path intact", () => {
  assert.deepEqual(flowSteps, [
    "Payout Intent",
    "Proof Bundle",
    "Guard Decision",
    "Trust Permit",
    "Solana Evidence",
    "Payout Result"
  ]);
});
