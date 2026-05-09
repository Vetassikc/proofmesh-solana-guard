# Pitch Deck Content

Цей файл містить готовий контент для pitch deck і pitch video. Інструкції
українською; текст на слайдах і voiceover англійською.

## Принцип

Не роби deck як whitepaper. Суддя має зрозуміти продукт за перші 30-60 секунд.
Кожен слайд має одну думку, один visual anchor і мінімум тексту.

Рекомендована довжина: 8-9 слайдів.

Відео: 2:00-2:30, максимум 3:00.

Не використовуй Google Drive або Dropbox для відео. Використовуй Loom,
YouTube unlisted або Vimeo.

## Style Direction

Візуальний стиль має бути ближче до security/infrastructure tool, не до crypto
meme page.

- Dark background.
- White text.
- One accent color: teal/green for safe permits, red only for BLOCK.
- No dense screenshots.
- No giant competitor matrix.
- No buzzwords like "revolutionary", "democratizing", "disrupting".
- Product screenshot in the first slide.

## Slide 1 - Product

Візуал: screenshot `artifacts/submission/screenshots/01-evidence-mode.png` або
обрізана верхня частина live demo.

On-slide text:

```text
ProofMesh Guard
Trust permits before Solana agent and DAO payouts move funds
```

Voiceover:

```text
ProofMesh Guard is a Solana-native trust-permit layer for agent wallets, payment bots, and DAO treasuries. Before funds move, it creates a verifiable permit that says whether the payout should be released, capped, or blocked.
```

Why this slide works:

- суддя одразу бачить продукт, не абстрактну проблему;
- one-liner пояснює категорію;
- "released, capped, or blocked" одразу дає зрозумілий use case.

## Slide 2 - Problem

Візуал: проста схема `Agent / DAO bot -> Payout -> Signature without proof`.

On-slide text:

```text
Wallet signatures show who signed.
They do not show why a payout was safe.
```

Voiceover:

```text
AI agents and DAO treasury bots are moving closer to autonomous payments. A wallet signature can prove who signed a transaction, but it does not explain the risk decision behind that payout.
```

Optional supporting line:

```text
As agent-driven treasury activity grows, Solana apps need verifiable safety before execution.
```

## Slide 3 - What Existing Tools Miss

Візуал: three simple boxes, not a table:

```text
Multisig -> human approval
Governance -> vote result
Risk API -> off-chain score
```

On-slide text:

```text
Approvals, votes, and scores are not executable proof.
```

Voiceover:

```text
Multisigs coordinate humans. Governance coordinates votes. Risk APIs return advisory scores. But none of these creates a compact Solana artifact that another app can verify before it lets capital move.
```

Do not:

- не малюй матрицю, де всі конкуренти погані, а ми ідеальні;
- не витрачай багато часу на конкурентів.

## Slide 4 - Solution

Візуал: flow rail.

```text
Payout Intent -> Proof Bundle -> Guard Decision -> Trust Permit -> Permit PDA
```

On-slide text:

```text
Intent + proofs become a verifiable permit PDA.
```

Voiceover:

```text
ProofMesh Guard turns the missing safety step into a TrustPermit. The SDK evaluates the payout intent and proof bundle, and the Anchor program anchors the decision as a permit PDA on Solana devnet.
```

## Slide 5 - MVP Scenarios

Візуал: three scenario cards from the demo.

On-slide text:

```text
RELEASE executes.
CAP reduces.
BLOCK leaves evidence with no execute path.
```

Voiceover:

```text
The MVP proves three scenarios. RELEASE permits can execute the requested payout. CAP permits reduce an oversized payout to the approved amount. BLOCK permits are anchored as evidence, but the app intentionally offers no execute path.
```

Important visual:

- `RELEASE`: approved amount equals requested amount.
- `CAP`: requested amount is larger than approved amount.
- `BLOCK`: approved amount is zero and execute transaction is none by design.

## Slide 6 - Solana Evidence

Візуал: program id + one permit PDA link + one transaction link. Не клади всі
links на слайд; залиш 2-3 найсильніші.

On-slide text:

```text
Anchor program deployed on devnet
Permit PDAs + guarded SOL payout execution
```

Voiceover:

```text
This is not a static dashboard. The Anchor program is deployed on Solana devnet. It stores permit PDA accounts and executes guarded native SOL payouts only for valid RELEASE and CAP permits.
```

Use these evidence anchors:

```text
Program:
https://explorer.solana.com/address/5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk?cluster=devnet

Live demo:
https://proofmesh-solana-guard.vercel.app

Repository:
https://github.com/Vetassikc/proofmesh-solana-guard
```

## Slide 7 - Developer Surface

Візуал: короткий SDK snippet або flow:

```text
build intent -> build proofs -> evaluate policy -> derive PDA -> verify permit
```

On-slide text:

```text
Open-source SDK for Solana builders
Composable guard before payout execution
```

Voiceover:

```text
The open-source TypeScript SDK is the developer entry point. Another Solana builder can build the payout intent, verify the proof bundle, derive the permit PDA, and use that permit before constructing a payout transaction.
```

Optional visual source:

- `README.md` integration section.
- `docs/SDK_INTEGRATION.md`.

## Slide 8 - Business Path

Візуал: simple pricing ladder.

```text
Free SDK -> Pro Guard API -> Enterprise proof and audit layer
```

On-slide text:

```text
Free SDK for adoption.
Hosted Guard API for managed proofs and audit retention.
```

Voiceover:

```text
The SDK stays free to drive adoption. The business path is a hosted Guard API for teams that need managed proof providers, monitoring, webhooks, audit retention, and custom policy rules.
```

Keep it simple:

```text
Open Source: free SDK
Pro: about $99/month
Enterprise: custom
```

Do not overclaim revenue. This is an early infrastructure wedge, not a mature
business yet.

## Slide 9 - Why Now / Why Me

Візуал: compact proof list.

On-slide text:

```text
Public repo
Devnet program
Working demo
SDK examples
Wallet smoke evidence
```

Voiceover:

```text
I am building this as a solo founder focused on trust and risk infrastructure for agent-assisted crypto workflows. During the hackathon I shipped the Anchor program, SDK, demo app, devnet evidence, integration examples, and Phantom wallet smoke evidence.
```

Optional extra line:

```text
I have also received non-dilutive Google for Startups Cloud support for related builder work.
```

Use this line only if it feels natural and does not distract from ProofMesh
Guard.

## Closing Slide

Можна зробити окремим slide 10 або завершити slide 9 цією фразою.

On-slide text:

```text
ProofMesh Guard makes payout safety composable.
```

Voiceover:

```text
ProofMesh Guard makes payout safety composable: a Solana app can verify the trust permit before it lets capital move.
```

## Full Pitch Video Script

Це можна читати як основний 2-хвилинний сценарій.

```text
ProofMesh Guard is a Solana-native trust-permit layer for agent wallets, payment bots, and DAO treasuries. Before funds move, it creates a verifiable permit that says whether the payout should be released, capped, or blocked.

The problem is simple: AI agents and DAO treasury bots are moving closer to autonomous payments. A wallet signature can prove who signed a transaction, but it does not explain the safety decision behind that payout.

Existing tools solve adjacent problems. Multisigs coordinate humans. Governance coordinates votes. Risk APIs return advisory scores. But none of these creates a compact Solana artifact that another app can verify before it lets capital move.

ProofMesh Guard turns that missing safety step into a TrustPermit. The SDK evaluates the payout intent and proof bundle, and the Anchor program anchors the decision as a permit PDA on Solana devnet.

The MVP proves three scenarios. RELEASE permits can execute the requested payout. CAP permits reduce an oversized payout to the approved amount. BLOCK permits are anchored as evidence, but the app intentionally offers no execute path.

This is not a static dashboard. The devnet program, permit PDAs, guarded SOL payout execution, Ledger / Verify mode, TypeScript SDK, integration examples, public repository, and Phantom wallet smoke evidence are all part of the submission.

The SDK stays free to drive adoption. The business path is a hosted Guard API for teams that need managed proof providers, monitoring, webhooks, audit retention, and custom policy rules.

ProofMesh Guard makes payout safety composable: a Solana app can verify the trust permit before it lets capital move.
```

## Recording Checklist

- [ ] Open the live demo before recording.
- [ ] Keep browser zoom at 100%.
- [ ] Start with product screenshot or live demo, not biography.
- [ ] Mention `RELEASE`, `CAP`, and `BLOCK` by name.
- [ ] Mention Solana devnet and permit PDA.
- [ ] Mention SDK only after the product use case is clear.
- [ ] Do not show `.env`, wallet files, seed phrases, or private screens.
- [ ] Upload as Loom, YouTube unlisted, or Vimeo.
- [ ] Open the video in incognito before putting it into Colosseum.

## What To Put In Colosseum Pitch Video Field

```text
TBD_PITCH_VIDEO_URL
```

Після запису заміни цей placeholder у `docs/COLOSSEUM_SUBMISSION_COPY.md`.

## What To Put In Colosseum Product Demo Field

Product demo має бути іншим відео або принаймні іншим recording path. Для demo
використовуй `docs/TECH_DEMO_SCRIPT_FINAL.md`.

```text
TBD_PRODUCT_DEMO_VIDEO_URL
```
