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

## Інтеграція ProofMesh Guard

ProofMesh Guard is designed as a reusable Solana trust-permit primitive. A
builder can run the SDK before an agent wallet, DAO treasury tool, or payment
bot sends a risky payout.

Встанови залежності з цього workspace:

```bash
pnpm install
pnpm --filter @proofmesh/guard-sdk build
```

Додай локальний SDK package в інший workspace package:

```json
{
  "dependencies": {
    "@proofmesh/guard-sdk": "workspace:*"
  }
}
```

Мінімальний flow:

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

Запусти локальний integration example:

```bash
pnpm example:integration
```

Для deployed devnet evidence flows після налаштування devnet wallet поза
репозиторієм дивись [docs/DEVNET_RUNBOOK.md](docs/DEVNET_RUNBOOK.md).

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

## Submission Package

Submission-ready narrative і demo guidance лежать тут:

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
- `scripts/devnet` for deterministic devnet scenario runners
- `docs` for architecture, demo, and submission documentation

Встанови залежності і перевір проект:

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm --filter @proofmesh/demo build
pnpm example:integration
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
