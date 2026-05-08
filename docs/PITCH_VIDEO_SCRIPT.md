# Pitch Video Script

Цей файл для запису pitch video. Інструкції українською, текст для озвучення
англійською. Тримай відео в межах 2:00-2:30, хоча Superteam guide дозволяє до
3 хвилин.

## Recording Rules

- Записуй Loom або YouTube/Vimeo unlisted.
- Не використовуй Google Drive або Dropbox.
- Не читай великі блоки тексту зі слайдів.
- Покажи продукт у перших 15 секундах.
- Весь сенс має бути зрозумілий менш ніж за 60 секунд.
- Найсильніші докази став на початок: devnet program, RELEASE/CAP/BLOCK,
  public repo, SDK.

## Deck Outline

### Slide 1 - What It Is

Visual: screenshot of ProofMesh Guard demo first fold.

On-slide text:

```text
ProofMesh Guard
Trust permits before Solana agent and DAO payouts move funds
```

Voice:

```text
ProofMesh Guard is a Solana-native trust-permit layer for agent wallets, payment bots, and DAO treasuries. Before money moves, the system produces a verifiable permit that says whether a payout should be released, capped, or blocked.
```

### Slide 2 - Problem

Visual: simple flow showing agent/DAO bot -> payout -> missing proof.

On-slide text:

```text
Wallet signatures show who signed.
They do not show why a payout was safe.
```

Voice:

```text
AI agents and treasury bots are getting closer to moving funds automatically. A wallet signature is not enough. It shows who signed the transaction, but it does not explain the safety decision behind the payout.
```

### Slide 3 - Solution

Visual: `Payout Intent -> Proof Bundle -> Guard Decision -> Trust Permit`.

On-slide text:

```text
Intent + proofs -> RELEASE / CAP / BLOCK -> permit PDA
```

Voice:

```text
ProofMesh Guard turns payout checks into a compact TrustPermit. The SDK evaluates the payout intent and proof bundle, and the Anchor program anchors the decision as a permit PDA on Solana devnet.
```

### Slide 4 - Working MVP

Visual: three scenario cards: RELEASE, CAP, BLOCK.

On-slide text:

```text
RELEASE executes.
CAP reduces.
BLOCK leaves evidence with no execute path.
```

Voice:

```text
The MVP demonstrates three flows. A clean payout is released. An oversized payout is capped to the approved amount. A risky payout is blocked, anchored as evidence, and no execute transaction is offered.
```

### Slide 5 - Solana Evidence

Visual: program id and Solana Explorer links.

On-slide text:

```text
Anchor program deployed on devnet
Explorer-verifiable permit and payout transactions
```

Voice:

```text
This is not a static dashboard. The Anchor program is deployed on Solana devnet. Permits are PDA accounts, and approved RELEASE and CAP permits can execute guarded native SOL payouts.
```

### Slide 6 - Developer Surface

Visual: SDK code snippet or integration flow.

On-slide text:

```text
Open-source TypeScript SDK
Composable guard before payout execution
```

Voice:

```text
The open-source SDK lets another Solana builder derive the permit PDA, verify the proof bundle, and check the decision before constructing a payout transaction. The product object is the permit, not the UI.
```

### Slide 7 - Business Path

Visual: Free SDK -> Hosted Guard API -> Enterprise.

On-slide text:

```text
Free SDK
Hosted Guard API
Enterprise proof and audit retention
```

Voice:

```text
The SDK stays free to drive adoption. The business path is a hosted Guard API for teams that need managed proof providers, monitoring, webhooks, audit retention, and custom policy rules.
```

### Slide 8 - Why Me / Why Now

Visual: public repo, devnet evidence, Google for Startups support, Superteam.

On-slide text:

```text
Public repo. Devnet evidence. SDK. Demo. Wallet smoke test.
```

Voice:

```text
I am building this as a solo founder focused on trust and risk infrastructure for agent-assisted crypto workflows. I already have public code, devnet evidence, a demo, integration docs, and founder-reported Phantom wallet smoke evidence.
```

## Full 2-Minute Voice Script

Використовуй це як основний текст. Не треба читати монотонно слово в слово,
але структура має лишитися такою.

```text
ProofMesh Guard is a Solana-native trust-permit layer for agent wallets, payment bots, and DAO treasuries. Before money moves, the system produces a verifiable permit that says whether a payout should be released, capped, or blocked.

The problem is simple: AI agents and treasury bots are getting closer to moving funds automatically. A wallet signature shows who signed, but it does not show why a payout was safe. Multisigs coordinate humans, governance coordinates votes, and risk APIs return advisory scores. None of these creates a compact Solana artifact that another app can verify before execution.

ProofMesh Guard turns that missing step into a TrustPermit. A payout intent is checked against an inspectable proof bundle. The result becomes RELEASE, CAP, or BLOCK. The Anchor program anchors that decision as a permit PDA on Solana devnet.

The MVP is working. RELEASE permits can execute the requested payout. CAP permits reduce an oversized payout to the approved amount. BLOCK permits are anchored as evidence, but the app intentionally offers no execute path.

This is not just a dashboard. The devnet program, permit PDAs, issue transactions, execute transactions, Ledger / Verify mode, TypeScript SDK, and Phantom wallet smoke evidence are all part of the submission.

The open-source SDK is free so other Solana builders can integrate the guard before agent or DAO treasury payouts. The commercial path is a hosted Guard API with managed proofs, monitoring, webhooks, audit retention, and custom policy rules.

ProofMesh Guard makes payout safety composable: a Solana app can verify the trust permit before it lets capital move.
```

## Final Line

```text
ProofMesh Guard makes payout safety composable: a Solana app can verify the trust permit before it lets capital move.
```
