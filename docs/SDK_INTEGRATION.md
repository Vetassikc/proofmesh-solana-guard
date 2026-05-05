# SDK Integration Guide

ProofMesh Guard is a reusable Solana trust-permit primitive. The SDK lets an
agent wallet, DAO treasury tool, or payment bot create a verifiable permit
before a payout is allowed to move funds.

The hackathon SDK is intentionally small. It focuses on deterministic,
inspectable proof bundles and locally verifiable permit integrity.

## Core Concepts

- `PayoutIntent`: the proposed SOL payout, including treasury, recipient,
  requested amount, metadata, nonce, and expiry.
- `Proof`: an inspectable fact used by policy evaluation. The MVP uses fixture
  proofs for recipient identity, wallet risk, and invoice integrity.
- `ProofBundle`: the deterministic commitment to the intent and proofs. It
  includes the intent hash, proof root, bundle hash, and generated timestamp.
- `GuardDecision`: the policy result: `RELEASE`, `CAP`, `HOLD`, or `BLOCK`.
- `TrustPermit`: the off-chain permit artifact that binds intent hash, proof
  root, decision, requested amount, approved amount, issuer, and expiry.
- Anchor permit PDA: the on-chain devnet account derived from
  `["permit", intentHash]`.

## Minimal TypeScript Example

```ts
import { PublicKey } from "@solana/web3.js";
import {
  DEFAULT_GUARD_POLICY,
  buildProofBundle,
  evaluatePayoutIntent,
  guardScenarios,
  issueTrustPermit,
  verifyTrustPermit
} from "@proofmesh/guard-sdk";

const programId = "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk";
const scenario = guardScenarios.release;

const intent = {
  ...scenario.intent,
  treasury: "agent-or-dao-treasury-public-key",
  recipient: "recipient-public-key",
  nonce: "unique-agent-payout-nonce"
};

const bundle = buildProofBundle(intent, scenario.proofs, scenario.generatedAt);
const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);
const permit = issueTrustPermit(intent, bundle, decision, {
  issuer: "agent-policy-engine",
  issuedAt: new Date().toISOString()
});
const verification = verifyTrustPermit(permit, intent, bundle);
const [permitPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("permit"), Buffer.from(bundle.intentHash, "hex")],
  new PublicKey(programId)
);

console.log({
  decision: decision.decision,
  approvedAmountLamports: decision.approvedAmountLamports,
  permitId: permit.permitId,
  permitPda: permitPda.toBase58(),
  verified: verification.valid
});
```

Запусти included local example:

```bash
pnpm example:integration
```

The example does not use RPC, wallet files, `.env`, private keys, or
transactions. It prints a local permit and evaluation summary for `RELEASE`,
`CAP`, and `BLOCK`.

## Decision Behavior

`RELEASE` means all required proofs pass and the requested amount is within the
policy cap. A builder can issue the permit and execute the full approved payout.

`CAP` means the recipient and proofs are acceptable, but the requested amount is
too high. A builder can issue the permit and execute only
`approvedAmountLamports`.

`BLOCK` means a required proof or policy check failed. A builder can anchor the
blocked permit as evidence, but must not execute a payout.

`HOLD` remains part of the SDK model for missing or expired proofs. It is not a
primary judge scenario for the MVP demo.

## Mapping To The Anchor Program

The SDK produces the fields that the Anchor program anchors:

- `intentHash` -> `Permit.intent_hash`
- `proofRoot` -> `Permit.proof_root`
- `decision` -> `Permit.decision`
- `intent.requestedAmountLamports` -> `Permit.requested_amount_lamports`
- `decision.approvedAmountLamports` -> `Permit.approved_amount_lamports`
- `intent.treasury` -> `Permit.treasury`
- `intent.recipient` -> `Permit.recipient`
- `issuer` -> `Permit.issuer`
- `intent.expiresAt` -> `Permit.expires_at`

The permit PDA is derived as:

```ts
PublicKey.findProgramAddressSync(
  [Buffer.from("permit"), Buffer.from(intentHash, "hex")],
  programId
);
```

On devnet, the program accepts `issue_permit` for all valid decision/amount
combinations. It accepts `execute_payout` only when:

- decision is `RELEASE` or `CAP`
- treasury matches the permit
- recipient matches the permit
- permit is not expired
- permit execution status is `NotExecuted`
- transfer amount equals `approved_amount_lamports`

`BLOCK` and `HOLD` permits are not executable.

## Deterministic And Locally Verifiable

The following are deterministic and can be checked locally:

- canonical JSON encoding
- payout intent hash
- proof hashes
- proof root
- proof bundle hash
- policy decision for the fixture policy
- trust permit id
- trust permit integrity verification
- permit PDA derivation from program id and intent hash

This is the core infrastructure story: another Solana builder can verify the
permit before moving funds, without trusting a dashboard.

## Hackathon Mock Boundaries

The MVP intentionally uses deterministic fixture proofs instead of live external
proof providers. This keeps the demo inspectable, reproducible, and judge-safe.

The SDK example intentionally does not sign transactions. Browser wallet signing
is covered by Live Wallet Mode, and script-based devnet execution is documented
in [DEVNET_RUNBOOK.md](./DEVNET_RUNBOOK.md).

Post-MVP extensions can replace fixture proofs with managed proof bundles,
hosted audit retention, monitoring, SPL token support, and live provider
integrations.
