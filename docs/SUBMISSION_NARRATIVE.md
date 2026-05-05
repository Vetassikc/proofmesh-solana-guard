# Submission Narrative

This document keeps the Colosseum submission story concise and consistent.

## One-Liner

Every risky Solana payout should carry a trust permit.

## Short Description

ProofMesh Guard is a Solana-native trust-permit primitive for agent and DAO
treasury payouts. Before funds move, a payout intent is checked against an
inspectable proof bundle, mapped to `RELEASE`, `CAP`, or `BLOCK`, anchored as a
permit PDA on Solana devnet, and surfaced through an open-source TypeScript SDK
plus a judge-facing demo.

## Problem

Autonomous agents, DAO treasury bots, and payment workflows can prepare and sign
transactions, but the safety decision behind a payout is often hidden in an app,
chat, or off-chain policy engine. That creates a weak operating model:

- clean payouts and risky payouts look the same at signing time
- oversized payouts are either fully allowed or manually reviewed
- blocked decisions are rarely anchored as reusable evidence
- other Solana apps cannot easily verify why a payout was allowed

As agent-driven treasury activity grows, Solana builders need a compact,
composable way to prove the decision before capital moves.

## Solution

ProofMesh Guard turns payout risk checks into a reusable `TrustPermit`.

The flow is:

`PayoutIntent -> ProofBundle -> GuardDecision -> TrustPermit -> permit PDA -> guarded payout or blocked evidence`

The MVP proves three scenarios:

- `RELEASE`: required proofs pass and the payout amount is inside policy
- `CAP`: required proofs pass, but the requested amount is reduced to a policy
  cap
- `BLOCK`: a required proof fails, so a blocked permit is issued and no payout
  execution path is offered

The permit is not a dashboard claim. It is an inspectable artifact that binds
the intent hash, proof root, decision, requested amount, approved amount,
treasury, recipient, expiry, and execution status.

## Why Solana

ProofMesh Guard is intentionally Solana-native:

- Anchor PDA accounts make permits queryable and composable.
- Devnet transactions prove the permit path is not a static UI.
- Guarded native SOL payout execution shows capital only moves for executable
  `RELEASE` and `CAP` permits.
- Explorer links make the demo easy for judges and builders to verify.
- A TypeScript SDK gives other Solana teams a practical integration surface.

The project is not a generic AI agent platform, custody product, escrow system,
KYC suite, or multi-chain compliance dashboard. The narrow primitive is trust
permits before risky Solana payouts.

## What Is Built

The current MVP includes:

- Anchor program deployed on Solana devnet
- PDA permit registry derived from `["permit", intentHash]`
- guarded SOL payout execution for `RELEASE` and `CAP`
- blocked permit anchoring for `BLOCK`
- deterministic TypeScript SDK for hashing, proof bundles, policy decisions,
  trust permit issuance, and verification
- runnable SDK integration example
- judge demo with Evidence Mode, Ledger / Verify, and optional Live Wallet Mode
- captured devnet evidence for program deployment and all three scenarios
- founder-reported Phantom devnet wallet smoke evidence

## Demo Path

The safest judge path does not require a wallet:

1. Open the demo.
2. Keep `Evidence Mode` selected.
3. Show `RELEASE`, `CAP`, and `BLOCK`.
4. Switch to `Ledger / Verify`.
5. Show `All checks pass`.
6. Open one permit PDA and one transaction in Solana Explorer.
7. Mention that `Live Wallet Mode` can run fresh devnet flows with Phantom.

The key message is simple: ProofMesh Guard does not just describe a policy. It
anchors and verifies the decision before payout execution.

## Evidence

Core evidence:

- Program:
  `https://explorer.solana.com/address/5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk?cluster=devnet`
- Captured devnet evidence: [DEVNET_EVIDENCE.md](./DEVNET_EVIDENCE.md)
- Ledger verification: [LEDGER_VERIFICATION.md](./LEDGER_VERIFICATION.md)
- Manual wallet smoke evidence: [WALLET_SMOKE.md](./WALLET_SMOKE.md)
- SDK integration guide: [SDK_INTEGRATION.md](./SDK_INTEGRATION.md)

## Open-Source And Composability

The TypeScript SDK is the main open-source surface. Builders can:

- create a payout intent
- build a deterministic proof bundle
- evaluate policy locally
- issue and verify a trust permit
- derive the expected Anchor PDA
- use the permit decision before constructing a payout

This makes ProofMesh Guard useful beyond the demo. A treasury tool, payment bot,
or agent wallet can integrate the permit step before moving funds.

## Business Path

The open-source SDK stays free. The commercial path is a hosted Guard API for
teams that want:

- managed proof bundles
- higher rate limits
- audit retention
- monitoring and alerting
- team-level policy configuration
- operational support for agent or DAO treasury workflows

The wedge is narrow and monetizable: payment risk checks before autonomous or
semi-autonomous treasury execution.

## Differentiation

ProofMesh Guard is different from a dashboard because the permit is the product
object. The project does not ask the judge to trust a UI. It shows a policy
decision, anchors a compact permit on Solana devnet, verifies the permit PDA,
and executes or blocks payout behavior according to the permit.

The strongest sentence for judges:

ProofMesh Guard makes payout safety composable: a Solana app can verify the
trust permit before it lets capital move.

## Submission Copy Blocks

### 280 Characters

ProofMesh Guard issues trust permits before Solana agent and DAO payouts. It
checks a payout intent, maps it to RELEASE/CAP/BLOCK, anchors a permit PDA on
devnet, and exposes the flow through a TypeScript SDK, demo, ledger verifier,
and wallet smoke evidence.

### 500 Characters

ProofMesh Guard is a Solana-native trust-permit primitive for agent and DAO
treasury payouts. Before funds move, it checks a payout intent against an
inspectable proof bundle, maps the result to RELEASE, CAP, or BLOCK, anchors a
permit PDA on devnet, and allows only executable permits to move SOL. The MVP
includes an Anchor program, TypeScript SDK, judge demo, ledger verification,
captured devnet evidence, and Phantom wallet smoke evidence.

### Longer Description

ProofMesh Guard helps Solana builders add a verifiable safety step before risky
agent or DAO treasury payouts. The SDK turns a payout intent and proof bundle
into a deterministic guard decision. The Anchor program anchors that decision as
a permit PDA and executes native devnet SOL payouts only for valid `RELEASE` or
`CAP` permits. `BLOCK` permits are anchored as evidence but have no execute
path. The demo shows all three scenarios, verifies captured devnet evidence, and
supports optional Phantom-based live devnet runs.

## Scope Boundaries

Current MVP intentionally does not include:

- mainnet execution
- SPL token support
- custody or escrow
- live external proof providers
- multi-chain support
- full compliance/KYC workflows
- generic AI agent orchestration

These cuts keep the hackathon submission focused on a working Solana-native
primitive.

## Near-Term Roadmap

Before submission:

- harden demo copy, empty states, and mobile layout
- prepare screenshots and a short demo video
- freeze scope before May 11, 2026

After submission:

- browser-safe transaction builders in the SDK
- SPL token payout support
- policy configuration surface
- hosted proof bundle API
- monitoring and audit retention
- optional Solana Actions/Blinks if the core permit flow remains stable
