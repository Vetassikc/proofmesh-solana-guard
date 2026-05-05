# Demo Script

Цей файл описує, як записувати коротке Colosseum judging video і як проводити
live demo. Текст, який треба озвучити суддям, лишається англійською.

## Ціль Демо

Покажи, що ProofMesh Guard це working Solana-native permit primitive, а не
static dashboard.

Суддя має зрозуміти ці тези менш ніж за дві хвилини:

- risky payouts should carry a trust permit
- the app produces `RELEASE`, `CAP`, or `BLOCK`
- permits are anchored on Solana devnet
- the ledger recomputes and verifies permit evidence
- builders can integrate the SDK

## 90-Секундний Video Script

### 0-10 секунд: Problem

Озвуч:

```text
Autonomous agents and DAO treasury tools can prepare Solana payouts, but a
wallet signature alone does not explain why a payout is safe.
```

Покажи на екрані:

- Demo first fold
- `ProofMesh Guard`
- `Trust permits before Solana agent payments move funds`

### 10-25 секунд: Product Object

Озвуч:

```text
ProofMesh Guard creates a trust permit before funds move. A payout intent is
checked against an inspectable proof bundle and mapped to RELEASE, CAP, or
BLOCK.
```

Покажи на екрані:

- Evidence Mode
- flow rail: Payout Intent -> Proof Bundle -> Guard Decision -> Trust Permit

### 25-45 секунд: Three Decisions

Озвуч:

```text
For a clean payout, the permit releases the requested amount. For an oversized
payout, the permit caps the amount. For a risky payout, the permit is anchored
as blocked evidence and no execute transaction is offered.
```

Покажи на екрані:

- натисни `RELEASE`
- натисни `CAP`
- натисни `BLOCK`
- зроби паузу на `BLOCK` result: `No payout`

### 45-65 секунд: Solana Evidence

Озвуч:

```text
This is Solana-native. The Anchor program stores compact permit accounts on
devnet, and approved permits can execute guarded native SOL payouts.
```

Покажи на екрані:

- Ledger section
- program link
- one permit PDA link
- one issue or execute transaction link

### 65-80 секунд: Verification

Озвуч:

```text
The ledger is not just a list of links. It recomputes permit PDAs from the
program id and intent hash, checks amount invariants, and confirms that BLOCK
has no execute path.
```

Покажи на екрані:

- перемкнись на `Ledger / Verify`
- покажи `All checks pass`
- покажи JSON/Markdown evidence pack, якщо він у кадрі

### 80-90 секунд: Developer Infrastructure

Озвуч:

```text
The SDK lets another Solana builder add this guard before an agent wallet,
payment bot, or DAO treasury moves funds. The open-source path is free; the
hosted API path can provide managed proofs, monitoring, and audit retention.
```

Покажи на екрані:

- README or SDK integration docs
- optional terminal з `pnpm example:integration`

## Шлях Live Demo

Використовуй цей шлях для найнадійнішого judge walkthrough.

1. Відкрий demo.
2. Почни з `Evidence Mode`.
3. Скажи one-liner:
   `Every risky Solana payout should carry a trust permit.`
4. Натисни `RELEASE`.
5. Покажи, що requested amount дорівнює approved amount.
6. Натисни `CAP`.
7. Покажи, що requested amount більший за approved amount.
8. Натисни `BLOCK`.
9. Покажи, що approved amount дорівнює zero, а execute transaction це `None by design`.
10. Перемкнись на `Ledger / Verify`.
11. Покажи `All checks pass`.
12. Відкрий program link у Solana Explorer.
13. Відкрий permit PDA link.
14. Згадай, що Live Wallet Mode вручну smoke-tested з Phantom на devnet.
15. Згадай SDK integration:
    `pnpm example:integration`

## Опційний Live Wallet Path

Використовуй цей шлях тільки якщо browser wallet уже налаштований на devnet і
профінансований.

1. Перемкнись на `Live Wallet Mode`.
2. Підключи Phantom на devnet.
3. Вибери `BLOCK`.
4. Натисни `Build permit`.
5. Натисни `Issue permit`.
6. Поясни, що execute transaction не пропонується.
7. Якщо є час, прогони `RELEASE`:
   - build permit
   - issue permit
   - execute payout

Не роби wallet path обов'язковим для judging. Evidence Mode і Ledger / Verify
розповідають повну історію без ризику wallet setup.

## Fallback Шлях

Якщо wallet signing, RPC або Explorer повільні:

1. Залишайся в `Evidence Mode`.
2. Покажи captured devnet evidence.
3. Перемкнись на `Ledger / Verify`.
4. Покажи local verification checks.
5. Відкрий [DEVNET_EVIDENCE.md](./DEVNET_EVIDENCE.md).
6. Відкрий [WALLET_SMOKE.md](./WALLET_SMOKE.md).

Fallback message для озвучення:

```text
The live wallet path is optional. The core artifact is the permit PDA and the
captured devnet evidence already verifies RELEASE, CAP, and BLOCK behavior.
```

## Judge Q&A

### Is this a dashboard?

No. The dashboard is only the judge surface. The product object is the
`TrustPermit`, anchored as a Solana permit PDA and verified by SDK/demo logic.

### Is this custody or escrow?

No. The MVP does not custody user funds or act as escrow. It gates payout
execution through permit checks.

### Why not just show a risk score?

A risk score is advisory. A trust permit is executable infrastructure: it binds
the payout intent, proof root, decision, treasury, recipient, and amount rules
before execution.

### What happens on BLOCK?

The blocked permit is issued as evidence, but no payout transaction is offered
or executed.

### What happens on CAP?

The permit approves less than the requested amount. The guarded payout executes
only the approved capped amount.

### How can another builder use it?

They can use the TypeScript SDK to create and verify trust permits, derive the
permit PDA, and decide whether to build the payout transaction.

### What is mocked?

The MVP uses deterministic fixture proofs instead of live external risk
providers. This keeps the hackathon flow inspectable and reproducible.

### What is real?

The Anchor program, permit PDA derivation, devnet deployment, guarded payout
execution, ledger verification, SDK integration example, and Phantom devnet
smoke evidence are real.

## Чеклист Запису

- Використовуй чисте browser window.
- Тримай zoom на 100%.
- Починай з Evidence Mode.
- Не показуй private wallet screens, seed phrases, local files або `.env`.
- Тримай recording до двох хвилин, якщо можливо.
- Відкривай Explorer links тільки після того, як product flow вже зрозумілий.
- Завершуй на SDK або ledger verifier, а не на marketing claim.

## Фінальна Фраза

```text
ProofMesh Guard makes payout safety composable: a Solana app can verify the
trust permit before it lets capital move.
```
