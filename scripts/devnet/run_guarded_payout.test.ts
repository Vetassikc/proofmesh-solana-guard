import * as anchor from "@coral-xyz/anchor";
import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGuardedPayoutPlan,
  parseCliArgs,
  validateRuntimeConfig
} from "./run_guarded_payout.js";

const { PublicKey } = anchor.web3;

test("parseCliArgs accepts a positional dry-run scenario", () => {
  assert.deepEqual(parseCliArgs(["release", "--dry-run"]), {
    dryRun: true,
    scenario: "release"
  });
});

test("parseCliArgs ignores a pnpm argument separator", () => {
  assert.deepEqual(parseCliArgs(["release", "--", "--run-id", "demo-001"]), {
    dryRun: false,
    runId: "demo-001",
    scenario: "release"
  });
});

test("parseCliArgs rejects unsupported scenarios", () => {
  assert.throws(
    () => parseCliArgs(["hold"]),
    /Scenario must be one of: release, cap, block/
  );
});

test("validateRuntimeConfig fails clearly when program id is missing", () => {
  assert.throws(
    () =>
      validateRuntimeConfig(
        {
          ANCHOR_PROVIDER_URL: "https://api.devnet.solana.com",
          ANCHOR_WALLET: "/tmp/missing-proofmesh-wallet.json"
        },
        () => true
      ),
    /PROOFMESH_GUARD_PROGRAM_ID is required/
  );
});

test("validateRuntimeConfig fails clearly when wallet file is missing", () => {
  assert.throws(
    () =>
      validateRuntimeConfig(
        {
          ANCHOR_PROVIDER_URL: "https://api.devnet.solana.com",
          ANCHOR_WALLET: "/tmp/missing-proofmesh-wallet.json",
          PROOFMESH_GUARD_PROGRAM_ID:
            "Guard111111111111111111111111111111111111111"
        },
        () => false
      ),
    /ANCHOR_WALLET points to a missing file/
  );
});

test("buildGuardedPayoutPlan skips execution for BLOCK", async () => {
  const plan = await buildGuardedPayoutPlan({
    programId: new PublicKey("Guard111111111111111111111111111111111111111"),
    runId: "test-run",
    scenario: "block",
    treasury: new PublicKey("11111111111111111111111111111111")
  });

  assert.equal(plan.decision.decision, "BLOCK");
  assert.equal(plan.shouldExecute, false);
  assert.equal(plan.approvedAmountLamports, "0");
  assert.match(plan.permitPda.toBase58(), /^[1-9A-HJ-NP-Za-km-z]+$/);
});
