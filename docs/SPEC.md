# ProofMesh Guard Hackathon Spec

## Summary

`ProofMesh Guard` is a Solana-native trust-permit primitive for guarded agent
and DAO payouts.

One-liner: `Every risky Solana payout should carry a trust permit.`

Judge pitch: autonomous agents and DAO treasuries can sign transactions, but
they still need to prove why a payout is safe. ProofMesh Guard turns a payout
intent into an inspectable proof bundle, maps it to `RELEASE`, `CAP`, or
`BLOCK`, anchors a `TrustPermit` on Solana devnet, and exposes the flow through
an open-source TypeScript SDK and judge demo.

Core MVP uses deterministic, inspectable proof bundles. Live external proof
providers are post-MVP or stretch only.

## Project Positioning

ProofMesh Guard is not a payment app, a generic AI agent platform, a
dashboard-only product, a custody system, an escrow system, a full
compliance/KYC workflow, or a multi-chain product.

The project is a Solana-native primitive for payout gating. The product object
is a `TrustPermit`: a verifiable artifact created before a risky payout,
anchored on Solana devnet, and consumed by SDK and demo flows.

## Winning One-Liner And Judge Pitch

Winning one-liner:

`Every risky Solana payout should carry a trust permit.`

Thirty-second judge pitch:

Autonomous agents can initiate Solana payments, but capital still needs a
machine-verifiable trust check before it moves. ProofMesh Guard turns a payout
intent into an inspectable proof bundle, maps it to `RELEASE`, `CAP`, or
`BLOCK`, anchors a `TrustPermit` on Solana devnet, and gives builders a
TypeScript SDK to verify the permit before execution.

Judges should remember this:

- trust permits before autonomous payments
- Solana devnet permit accounts, not a static dashboard
- open-source SDK plus a clear hosted API business path

## MVP Scope

- Three judge scenarios:
  - clean payout maps to `RELEASE`
  - excessive payout maps to `CAP`
  - risky recipient or proof failure maps to `BLOCK`
- Deterministic, inspectable proof bundles for the core demo.
- Anchor PDA permit registry on Solana devnet.
- Guarded devnet SOL payout for `RELEASE` and `CAP`.
- Blocked permit anchoring without payout execution for `BLOCK`.
- Ledger page with permit account, decision, proof root, transaction signature,
  and explorer links.
- Open-source TypeScript SDK with a README integration example.

`HOLD` remains in the SDK and data model for missing or expired proof bundles,
but it should not complicate the primary judge demo.

## Non-Goals

- No generic AI agent platform.
- No dashboard-only product.
- No custody, escrow, full compliance/KYC, or multi-chain flow.
- No Arc/Circle positioning.
- No required live external proof-provider dependency for MVP.
- No SPL token support until the devnet SOL path is stable.

## Technical Architecture

Core flow:

`PayoutIntent -> deterministic ProofBundle -> GuardDecision -> TrustPermit -> Solana devnet anchor -> guarded payout or blocked evidence`

Subsystems:

- `packages/sdk`: canonical types, hashing, proof-root generation,
  deterministic policy evaluation, permit verification, and transaction
  builders.
- `programs/proofmesh_guard`: Anchor program for PDA permit accounts and
  guarded devnet payout execution.
- `apps/demo`: judge UX with scenario runner, wallet/devnet transaction flow,
  and ledger.
- `fixtures`: deterministic proof bundles for clean, capped, and blocked payout
  scenarios.
- `docs`: spec, architecture, SDK usage, demo script, and submission copy.

On-chain storage should keep compact permit metadata only:

- intent hash
- proof root
- decision
- requested amount
- approved amount
- treasury
- recipient
- expiry
- execution status

## Solana-Native Component Options

Recommended core:

- Anchor PDA permit accounts for queryable, composable trust permits.
- Guarded devnet SOL payout instruction to prove funds move only through a
  verified permit path.
- Explorer-verifiable transaction signatures in the judge ledger.

Fallback:

- Memo-only devnet anchoring if Anchor deployment blocks submission timing.

Stretch:

- Solana Actions/Blinks only if permit registry, guarded payout, and ledger are
  stable by Day 8.
- SPL token support only after devnet SOL execution is reliable.
- Live external proof providers only after deterministic proof fixtures are
  stable and fully inspectable.

Cut:

- Compressed proofs or large on-chain proof storage for MVP.
- Compliance-heavy workflows.
- Multi-chain flows.

## Demo Flow

1. Judge opens the demo and immediately sees:
   `Trust permits before Solana agent payouts`.
2. Judge selects one of three scenarios: `RELEASE`, `CAP`, or `BLOCK`.
3. Demo shows the payout intent, deterministic proof bundle, policy result, and
   generated `TrustPermit`.
4. For `RELEASE` or `CAP`, the app builds a guarded devnet SOL payout.
5. For `BLOCK`, no payout transaction is offered; only the blocked permit is
   anchored.
6. The ledger shows permit account, transaction signature, decision, proof root,
   and Solana explorer link.

The judge should understand the product in 30 seconds without reading a long
dashboard.

## SDK/API Surface

Primary SDK package:

`@proofmesh/guard-sdk`

Minimum SDK API:

```ts
createPayoutIntent(input): PayoutIntent
hashPayoutIntent(intent): string
buildProofBundle(intent, proofs): ProofBundle
evaluatePayoutIntent(intent, bundle, policy): GuardDecision
issueTrustPermit(intent, bundle, decision): TrustPermit
verifyTrustPermit(permit, intent, bundle): VerificationResult
derivePermitPda(programId, intentHash): PublicKey
buildIssuePermitInstruction(args): TransactionInstruction
buildExecutePayoutInstruction(args): TransactionInstruction
```

Planned demo/API routes:

- `POST /api/guard/evaluate`
- `GET /api/permits/:permitId`
- Optional stretch: `GET /api/actions/payout/:scenario`
- Optional stretch: `POST /api/actions/payout/:scenario`

## Data And Proof Model

`PayoutIntent`:

- treasury
- recipient
- asset
- requested amount
- invoice or vendor metadata
- nonce
- expiry

`Proof`:

- kind
- source
- subject
- status
- observations
- evidence hash
- timestamps

`ProofBundle`:

- intent hash
- proofs
- proof root
- bundle hash

`GuardDecision`:

- decision: `RELEASE`, `CAP`, `HOLD`, or `BLOCK`
- approved amount
- reasons
- policy id

`TrustPermit`:

- permit id
- intent hash
- proof root
- decision
- requested amount
- approved amount
- issuer
- expiry
- Solana account
- transaction signature

Decision rules:

- `RELEASE`: required proofs pass and requested amount is within policy.
- `CAP`: recipient is acceptable but requested amount exceeds policy cap.
- `HOLD`: proof is missing or expired.
- `BLOCK`: recipient, proof, or policy check fails.

## Repo Structure

```text
apps/demo/
packages/sdk/
programs/proofmesh_guard/
fixtures/
docs/
scripts/
README.md
AGENTS.md
package.json
pnpm-workspace.yaml
tsconfig.base.json
```

No `.env`, private keys, secrets, generated wallets, or runtime credentials
should be committed.

## Business Model

ProofMesh Guard is open-source infrastructure with a commercial hosted service.

The SDK is free and open source so Solana builders can integrate trust permits
directly into agent wallets, DAO treasury tools, payment bots, and autonomous
payment flows.

The paid hosted Guard API is for teams that need:

- higher rate limits
- managed proof bundles
- audit retention
- monitoring
- team-level operational support

The wedge is narrow: guarded Solana payouts before risky agent or DAO treasury
transfers.

## 13-Day Execution Plan

- Day 1, Apr 28: commit docs/spec scaffold only: `docs/SPEC.md`,
  `docs/ARCHITECTURE.md`, `README.md`, package scaffold, and empty workspaces.
- Day 2, Apr 29: implement SDK types, hashing, proof bundle, policy engine, and
  unit tests.
- Day 3, Apr 30: create Anchor program account model and `issue_permit` tests.
- Day 4, May 1: add guarded SOL payout instruction and local validator tests.
- Day 5, May 2: deploy to devnet and anchor sample permits.
- Day 6, May 3: build demo first fold and three scenario walkthroughs.
- Day 7, May 4: connect wallet/devnet transaction flow.
- Day 8, May 5: add `/ledger`, explorer links, and permit verification UI;
  decide Actions/Blinks cutoff.
- Day 9, May 6: add SDK docs and integration example.
- Day 10, May 7: add Actions/Blinks only if the core flow is stable.
- Day 11, May 8: harden tests, error states, empty states, and mobile layout.
- Day 12, May 9: write submission docs, demo script, and screenshots.
- Day 13, May 10: final polish, deploy, record video, and freeze scope.
- May 11: submission only, no new features.

## Risks And Scope Cuts

- If Anchor deployment slows down, ship local Anchor tests plus memo-only devnet
  anchoring as fallback.
- If guarded payout is unstable, ship permit registry plus transaction builder
  first.
- If wallet UX takes too long, keep a deterministic devnet transaction runner
  and explorer evidence.
- If Actions/Blinks miss the Day 8 stability cutoff, skip them.
- Cut SPL tokens, live proof providers, dashboards, escrow, and compliance
  claims before cutting the core permit path.

## First Implementation Step

Create and commit scaffold/spec only:

1. Move this approved spec into `docs/SPEC.md`.
2. Create `docs/ARCHITECTURE.md`, `README.md`, root package scaffolding, and
   empty workspace folders.
3. Do not implement runtime logic in SDK, demo, or Anchor program until the
   scaffold/spec commit exists or runtime implementation is explicitly approved.

## Assumptions

- `/Users/vitaliiradionov/Code/proofmesh-solana-guard/AGENTS.md` exists and is
  canonical.
- Core MVP must work without secrets, `.env`, private keys, generated wallets,
  or live provider credentials.
- Deterministic proof bundles are the default MVP evidence path.
- Live providers and Solana Actions/Blinks are stretch features.
