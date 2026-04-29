import assert from "node:assert/strict";
import test from "node:test";

import {
  DEVNET_RPC_URL,
  PROOFMESH_GUARD_PROGRAM_ID,
  buildLiveRunPreview,
  getLiveScenarioCommand,
  getWalletUnavailableMessage,
  liveFlowSteps,
  modeOptions
} from "./liveFlow.js";

test("Evidence Mode remains the default demo mode", () => {
  assert.equal(modeOptions[0]?.id, "evidence");
  assert.equal(modeOptions[0]?.label, "Evidence Mode");
  assert.equal(modeOptions[1]?.label, "Ledger / Verify");
  assert.equal(modeOptions[2]?.label, "Live Wallet Mode");
});

test("Live Wallet Mode exposes the required stepper labels", () => {
  assert.deepEqual(liveFlowSteps, [
    "Connect wallet",
    "Build permit",
    "Issue permit",
    "Execute or block",
    "Evidence"
  ]);
});

test("wallet unavailable state is clear and recoverable", () => {
  assert.match(getWalletUnavailableMessage(0), /No Solana wallet detected/);
  assert.match(getWalletUnavailableMessage(0), /Evidence Mode/);
});

test("live flow commands match RELEASE, CAP, and BLOCK behavior", () => {
  assert.equal(getLiveScenarioCommand("release").requiresExecute, true);
  assert.equal(getLiveScenarioCommand("cap").requiresExecute, true);
  assert.equal(getLiveScenarioCommand("block").requiresExecute, false);
  assert.match(getLiveScenarioCommand("block").label, /No execute transaction/);
});

test("live preview generates devnet permit and explorer links", async () => {
  const preview = await buildLiveRunPreview({
    runId: "test-run-001",
    scenarioId: "release",
    walletPublicKey: "4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ"
  });

  assert.equal(DEVNET_RPC_URL, "https://api.devnet.solana.com");
  assert.equal(
    PROOFMESH_GUARD_PROGRAM_ID,
    "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk"
  );
  assert.equal(preview.decision.decision, "RELEASE");
  assert.match(preview.permitUrl, /cluster=devnet/);
  assert.match(preview.issueUrl("abc123"), /cluster=devnet/);
  assert.match(preview.executeUrl("def456"), /cluster=devnet/);
});
