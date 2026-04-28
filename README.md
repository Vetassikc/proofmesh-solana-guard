# ProofMesh Guard

Trust permits for Solana agent payments.

ProofMesh Guard is a Solana-native open-source primitive for guarded agent and
DAO treasury payouts. Before funds move, a payout intent is checked against an
inspectable proof bundle, mapped to `RELEASE`, `CAP`, `HOLD`, or `BLOCK`,
anchored on Solana devnet, and exposed through a TypeScript SDK plus a
judge-facing demo.

## Positioning

AI agents and DAO treasuries should not just move funds. They should produce a
verifiable trust permit before every risky payout.

ProofMesh Guard is not a generic agent platform, a dashboard-only product, a
custody system, an escrow system, or a compliance suite. The core object is a
`TrustPermit`: a compact, verifiable artifact that another Solana application
can inspect before allowing capital to move.

## MVP Promise

The hackathon MVP is intentionally narrow:

- deterministic, inspectable proof bundles for the core demo
- three judge scenarios: `RELEASE`, `CAP`, and `BLOCK`
- Anchor PDA permit accounts on Solana devnet
- guarded devnet SOL payout path for approved or capped payouts
- ledger view with permit account, decision, proof root, transaction signature,
  and explorer evidence
- free open-source TypeScript SDK for builders

`HOLD` remains part of the SDK and data model, but it is not a primary judge
scenario for the first demo.

## Judging Focus

ProofMesh Guard is optimized for Colosseum Frontier judging criteria:

- functionality: a working permit path, not a static dashboard
- Solana ecosystem impact: a reusable payout guard primitive for agents and DAO
  treasuries
- novelty: trust permits before autonomous payments
- UX: judges should understand the product in 30 seconds
- Solana technology usage: PDA permit accounts, devnet anchoring, guarded payout
  execution, and explorer-verifiable evidence
- open-source composability: SDK-first interfaces and inspectable fixtures
- business plan: free SDK plus paid hosted Guard API for teams needing higher
  rate limits, managed proof bundles, audit retention, and monitoring

## Local Setup

Runtime setup will be added after the scaffold/spec commit. The planned
workspace will use:

- `apps/demo` for the judge-facing web app
- `packages/sdk` for the TypeScript SDK
- `programs/proofmesh_guard` for the Solana program
- `fixtures` for deterministic proof bundles
- `docs` for architecture, demo, and submission documentation

No secrets, `.env` files, generated wallets, or private keys are required for
the scaffold.

## Initial Users

- Solana agent wallets
- DAO treasury tools
- payment bots
- hackathon teams building autonomous payment flows

## License

MIT
