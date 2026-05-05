# ProofMesh Guard Architecture

## Architecture Summary

ProofMesh Guard is a narrow Solana-native permit path for agent and DAO treasury
payouts.

The core architecture is:

```text
PayoutIntent
  -> deterministic ProofBundle
  -> GuardDecision
  -> TrustPermit
  -> Solana devnet permit account
  -> guarded payout or blocked evidence
```

The MVP should prove that a payout can be evaluated, permitted, anchored, and
inspected without requiring private credentials or live proof-provider access.

## Core Objects

### PayoutIntent

The request to move funds. It contains the treasury, recipient, asset, requested
amount, invoice or vendor metadata, nonce, and expiry.

### ProofBundle

An inspectable set of deterministic proofs used for the judge demo and local
tests. The bundle produces an intent hash, proof root, and bundle hash.

Live external proof providers are stretch integrations. They are not required
for the MVP.

### GuardDecision

The deterministic policy result:

- `RELEASE`: payout can proceed as requested
- `CAP`: payout can proceed at a lower approved amount
- `HOLD`: proof is missing or expired
- `BLOCK`: payout must not proceed

The primary judge demo uses `RELEASE`, `CAP`, and `BLOCK`. `HOLD` remains part
of the SDK/data model but should not complicate the first walkthrough.

### TrustPermit

The verifiable artifact created before a risky payout. It binds the payout
intent, proof root, decision, amounts, issuer, expiry, Solana account, and
transaction signature.

## Planned Workspaces

### `packages/sdk`

The TypeScript SDK owns canonical off-chain types and builders:

- payout intent creation
- intent hashing
- proof bundle hashing
- deterministic policy evaluation
- trust permit issuance and verification
- Solana PDA derivation
- transaction instruction builders

The SDK is the primary composability surface for other Solana builders.

### `programs/proofmesh_guard`

The Solana program owns the devnet anchor path:

- PDA permit account creation
- compact permit metadata storage
- guarded payout execution for approved permits
- execution status tracking

The target implementation is Anchor. Memo-only devnet anchoring is a fallback
only if the Anchor deployment path blocks the submission timeline.

### `apps/demo`

The demo app owns judge-facing UX:

- first-fold product explanation
- scenario runner for `RELEASE`, `CAP`, and `BLOCK`
- proof bundle inspection
- permit issuance and verification display
- guarded payout transaction flow
- ledger and explorer links

The demo must make the product understandable in 30 seconds.

### `fixtures`

Fixtures hold deterministic proof bundles and payout scenarios:

- clean payout
- capped payout
- blocked payout

Fixtures should be readable and reproducible. They should not contain secrets,
private keys, generated wallets, or live provider credentials.

### `docs`

Docs hold the submission-ready project memory:

- product spec
- architecture
- SDK usage
- demo script
- submission copy

## Solana Design

The recommended Solana design is a PDA-backed permit registry plus guarded
devnet SOL payout instruction.

Permit account seeds should be derived from stable permit inputs such as the
intent hash and the program ID. The account should store compact data only:

- intent hash
- proof root
- decision
- requested amount
- approved amount
- treasury
- recipient
- expiry
- execution status

Full proof bundles remain off-chain and inspectable in fixtures, API responses,
or hosted audit storage. The Solana account stores the verifiable commitment.

## API And SDK Boundary

The SDK is the canonical integration layer. The hosted API is a convenience and
commercial path, not the only way to use ProofMesh Guard.

Current SDK surface:

```ts
createPayoutIntent(input): PayoutIntent
hashPayoutIntent(intent): string
buildProofBundle(intent, proofs): ProofBundle
evaluatePayoutIntent(intent, bundle, policy): GuardDecision
issueTrustPermit(intent, bundle, decision): TrustPermit
verifyTrustPermit(permit, intent, bundle): VerificationResult
```

Current transaction construction lives in the demo and devnet script layers.
Browser-safe SDK transaction builders remain a post-submission extension.

Planned hosted API routes:

- `POST /api/guard/evaluate`
- `GET /api/permits/:permitId`

Optional stretch routes:

- `GET /api/actions/payout/:scenario`
- `POST /api/actions/payout/:scenario`

## Stretch Features

Solana Actions/Blinks are only added if the core permit registry, guarded
payout, and ledger are stable by Day 8.

Live external proof providers are post-MVP unless explicitly approved. The
default MVP proof path remains deterministic and inspectable.

SPL token support is deferred until devnet SOL payout execution is stable.

## Security And Secret Handling

The scaffold and MVP should not commit:

- `.env` files
- private keys
- generated wallets
- local credentials
- tool-provided secrets
- live provider credentials

Demo fixtures must be public-safe and deterministic.

## Business Architecture

ProofMesh Guard is open-source infrastructure with a paid hosted Guard API.

The free SDK helps Solana builders integrate trust permits directly. The hosted
service is for teams that need higher rate limits, managed proof bundles, audit
retention, monitoring, and operational support.

Initial users are Solana agent wallets, DAO treasury tools, payment bots, and
hackathon teams building autonomous payment flows.
