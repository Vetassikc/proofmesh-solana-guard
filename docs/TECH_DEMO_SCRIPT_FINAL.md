# Tech Demo Script

Цей файл для запису product demo video. Інструкції українською, текст для
озвучення англійською. Гайд дозволяє до 3 хвилин; ціль - 2:30-2:50.

## Recording Rules

- Записуй Loom.
- Показуй live product, не IDE і не GitHub walkthrough.
- Не показуй seed phrase, private key files, `.env`, Vercel private screens або
  local wallet JSON.
- Починай з Evidence Mode, бо він стабільний і не залежить від Phantom.
- Wallet path показуй тільки якщо він працює без затримок.

## Pre-Recording Checklist

- [ ] Public demo URL opens without login.
- [ ] Evidence Mode is default and usable.
- [ ] RELEASE scenario visible.
- [ ] CAP scenario visible.
- [ ] BLOCK scenario visible and says no execute path by design.
- [ ] Ledger / Verify shows `All checks pass`.
- [ ] At least one Solana Explorer program link opens.
- [ ] Wallet Mode safe state does not confuse the story.

## Timeline

### 0:00-0:20 - Open The Product

Покажи demo first fold.

Voice:

```text
This is ProofMesh Guard, a Solana-native trust-permit layer for agent and DAO payouts. The goal is to verify payout risk before funds move.
```

### 0:20-0:55 - Explain Evidence Mode

Покажи flow rail і scenario selector.

Voice:

```text
I start in Evidence Mode because judges can verify the full flow without setting up a wallet. The system takes a payout intent, checks an inspectable proof bundle, makes a guard decision, and turns it into a TrustPermit.
```

### 0:55-1:35 - Show RELEASE / CAP / BLOCK

Натисни сценарії в такому порядку: RELEASE, CAP, BLOCK.

Voice:

```text
RELEASE means the proofs pass and the requested payout can execute. CAP means the payout is too large, so the approved amount is reduced before execution. BLOCK means a required proof failed. The blocked permit is still anchored as evidence, but there is intentionally no execute transaction.
```

### 1:35-2:10 - Ledger / Verify

Перемкнись на `Ledger / Verify`.

Voice:

```text
The ledger is not only a list of links. It recomputes permit PDAs from the program id and intent hash, validates the 32-byte hashes, checks amount invariants, verifies execute rules, and confirms that BLOCK has no payout execution path.
```

### 2:10-2:35 - Solana Integration

Покажи program id, permit PDA, issue tx, execute tx або Solana Explorer link.

Voice:

```text
The Solana integration is real. The Anchor program is deployed on devnet. It stores permit PDA accounts and executes guarded native SOL payouts only for valid RELEASE and CAP permits.
```

### 2:35-2:55 - Developer Surface

Покажи SDK/integration mention у UI або README section, якщо є час.

Voice:

```text
For developers, the TypeScript SDK exposes the reusable part: build the payout intent, build the proof bundle, evaluate policy, derive the permit PDA, and verify the permit before constructing a payout transaction.
```

### 2:55-3:00 - Close

Voice:

```text
ProofMesh Guard makes payout safety composable: another Solana app can verify the trust permit before it lets capital move.
```

## Optional Phantom Segment

Використовуй тільки якщо воно стабільне під час запису.

```text
Live Wallet Mode is optional. It lets a devnet Phantom wallet issue fresh permits, but the main judging path uses captured devnet evidence so the demo remains reproducible.
```

## Fallback Message

Якщо Explorer, RPC або wallet зависають під час запису:

```text
The live wallet path is optional. The core evidence is already captured on devnet and verified in the Ledger / Verify tab.
```
