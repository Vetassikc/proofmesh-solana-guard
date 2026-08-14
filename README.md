# ProofMesh Guard

Trust permits for Solana agent payments.

Live demo: https://proofmesh-solana-guard.vercel.app

[![CI](https://github.com/Vetassikc/proofmesh-solana-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/Vetassikc/proofmesh-solana-guard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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

## 30-Second Path

1. Open the [live demo](https://proofmesh-solana-guard.vercel.app).
2. Stay in `Evidence Mode` and choose `RELEASE`, `CAP`, or `BLOCK`.
3. Inspect the proof bundle, decision, permit PDA, and explorer links.
4. Switch to `Ledger / Verify` to recompute PDA and amount invariants.
5. Read the [builder quickstart](#builder-quickstart) for the SDK flow.

Captured evidence works without a wallet. `Live Wallet Mode` is an optional
devnet-only path for a fresh run with a wallet you control.

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

## Builder Quickstart

ProofMesh Guard is designed as a reusable Solana trust-permit primitive. A
builder can run the SDK before an agent wallet, DAO treasury tool, or payment
bot sends a risky payout.

Install dependencies from this workspace:

```bash
pnpm install
pnpm --filter @proofmesh/guard-sdk build
```

Add the local SDK package to another workspace package:

```json
{
  "dependencies": {
    "@proofmesh/guard-sdk": "workspace:*"
  }
}
```

Minimal flow:

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
  nonce: "your-unique-payout-nonce"
};

const bundle = buildProofBundle(intent, scenario.proofs, scenario.generatedAt);
const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);
const permit = issueTrustPermit(intent, bundle, decision, {
  issuer: "agent-or-policy-engine-id",
  issuedAt: new Date().toISOString()
});
const verification = verifyTrustPermit(permit, intent, bundle);
const [permitPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("permit"), Buffer.from(bundle.intentHash, "hex")],
  new PublicKey(programId)
);

if (!verification.valid || decision.decision === "BLOCK") {
  throw new Error("Do not execute this payout.");
}

console.log({
  decision: decision.decision,
  approvedAmountLamports: decision.approvedAmountLamports,
  permitId: permit.permitId,
  permitPda: permitPda.toBase58()
});
```

Decision behavior:

- `RELEASE`: issue the permit and execute the requested payout amount.
- `CAP`: issue the permit and execute only the approved capped amount.
- `BLOCK`: issue blocked evidence only; do not execute a payout.

The Anchor program maps the SDK output to a permit PDA using
`["permit", intentHash]`. The `issue_permit` instruction stores compact permit
metadata on devnet. The `execute_payout` instruction moves native devnet SOL
only for `RELEASE` and `CAP` permits that are unexpired and not already
executed.

Run the local integration example:

```bash
pnpm example:integration
```

For deployed devnet evidence flows after configuring a devnet wallet outside
the repository, see [docs/DEVNET_RUNBOOK.md](docs/DEVNET_RUNBOOK.md).

## Why TrustPermit

Existing Solana safety patterns solve adjacent problems. TrustPermit fills the
gap between approval coordination and payout execution:

| Capability | TrustPermit | Multisig | Governance vote | Risk score API |
|------------|-------------|----------|-----------------|----------------|
| On-chain composable artifact | ✅ PDA | ❌ | ❌ | ❌ |
| Inspectable proof bundle | ✅ | ❌ | ❌ | ⚠️ Opaque |
| Automated (no human signer) | ✅ | ❌ | ❌ | ✅ |
| RELEASE / CAP / BLOCK gating | ✅ | ⚠️ Approve only | ⚠️ Approve only | ❌ Advisory |
| Blocked evidence anchoring | ✅ | ❌ | ❌ | ❌ |

A multisig asks "did enough people approve?" A governance vote asks "did the
community approve?" A risk API asks "is this risky?" and returns a score.

ProofMesh Guard asks a different question: **can this payout produce a
verifiable trust permit before funds move?** The permit is not a score or a
vote. It is an inspectable, composable artifact that binds intent, proofs,
decision, and amounts into a single on-chain object that another Solana program
can verify.

### Cross-Program Composability

Another Solana program can read the permit PDA account to check whether a
valid, unexpired, non-blocked permit exists before executing its own payout
logic. This makes the trust permit a composable building block: a lending
protocol, agent framework, or DAO tool can require a ProofMesh Guard permit as
a precondition for any risky capital movement.

## Judging Focus

ProofMesh Guard is optimized for Colosseum Frontier judging criteria:

- functionality: a working permit path, not a static dashboard
- Solana ecosystem impact: a reusable payout guard primitive for agents and DAO
  treasuries
- novelty: trust permits before autonomous payments, not scores or votes
- UX: judges should understand the product in 30 seconds
- Solana technology usage: PDA permit accounts, devnet anchoring, guarded payout
  execution, and explorer-verifiable evidence
- open-source composability: SDK-first interfaces and inspectable fixtures
- adoption path: SDK-first integration for Solana agents, DAO treasuries, and
  payment bots

## Open-source Status

ProofMesh Guard is a focused, composable OSS primitive. Changes should preserve
deterministic SDK behavior, the TrustPermit contract, and the Solana devnet demo
boundary.

- [Contributing guide](CONTRIBUTING.md) - local setup, tests, and change scope
- [Security policy](SECURITY.md) - responsible vulnerability reporting
- [Changelog](CHANGELOG.md) - release and unreleased maintenance notes
- [Open issues](https://github.com/Vetassikc/proofmesh-solana-guard/issues) -
  bugs, integration questions, and narrowly scoped improvements

Every pull request is checked by the repository CI workflow with the supported
Node.js and pnpm toolchain. Runtime credentials, wallets, and provider secrets
are never required for the local SDK and fixture test path.

The repository is intentionally a devnet-oriented hackathon build. It is not a
custody system, escrow system, compliance suite, or production security
guarantee.

## Submission Package

Submission-ready narrative і demo guidance лежать тут:

- [docs/SUBMISSION_READINESS_CHECKLIST.md](docs/SUBMISSION_READINESS_CHECKLIST.md) - final
  Colosseum readiness checklist based on the Superteam guide.
- [docs/COLOSSEUM_SUBMISSION_COPY.md](docs/COLOSSEUM_SUBMISSION_COPY.md) - copy/paste
  answers for the Colosseum project, media, team, accelerator, and survey fields.
- [docs/PITCH_DECK_CONTENT.md](docs/PITCH_DECK_CONTENT.md) - slide-by-slide
  pitch deck content, visuals, and voiceover.
- [docs/PITCH_VIDEO_SCRIPT.md](docs/PITCH_VIDEO_SCRIPT.md) - pitch deck structure and
  two-minute voice script.
- [docs/TECH_DEMO_SCRIPT_FINAL.md](docs/TECH_DEMO_SCRIPT_FINAL.md) - final tech demo
  recording path aligned with the Superteam guide.
- [docs/SUBMISSION_NARRATIVE.md](docs/SUBMISSION_NARRATIVE.md) - one-liner,
  problem, solution, evidence, business path і copy blocks.
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) - 90-second video script, live demo
  click path, fallback path і judge Q&A.
- [docs/DEVNET_EVIDENCE.md](docs/DEVNET_EVIDENCE.md) - captured program і
  scenario transactions.
- [docs/WALLET_SMOKE.md](docs/WALLET_SMOKE.md) - founder-reported Phantom
  devnet smoke evidence.
- [artifacts/submission](artifacts/submission) - screenshots і українські
  інструкції з використання.

## Локальний Запуск

Workspace містить:

- `apps/demo` for the judge-facing web app
- `packages/sdk` for the TypeScript SDK
- `programs/proofmesh_guard` for the Solana program
- `examples/node-integration` for the runnable local SDK integration example
- `examples/dao-treasury-bot` for the DAO treasury bot integration example
- `artifacts/idl` for the Anchor IDL artifact
- `scripts/devnet` for deterministic devnet scenario runners
- `docs` for architecture, demo, and submission documentation

Встанови залежності і перевір проект:

```bash
pnpm install
pnpm verify
pnpm example:integration
pnpm example:dao-bot
```

Запусти демо локально:

```bash
pnpm --filter @proofmesh/demo dev
```

Запусти preview production build:

```bash
pnpm --filter @proofmesh/demo exec vite preview --host 127.0.0.1 --port 4175
```

Anchor verification, якщо Solana і Anchor toolchains встановлені:

```bash
anchor build
anchor test
cargo test --manifest-path programs/proofmesh_guard/Cargo.toml
```

Для default local SDK, demo і documentation flows не потрібні secrets, `.env`
файли, generated wallets, private keys або live provider credentials.

## Initial Users

- Solana agent wallets
- DAO treasury tools
- payment bots
- hackathon teams building autonomous payment flows

## License

MIT
