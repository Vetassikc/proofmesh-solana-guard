# Demo Script

This script is optimized for a short Colosseum judging video and live demo.

## Demo Goal

Show that ProofMesh Guard is a working Solana-native permit primitive, not a
static dashboard.

The judge should understand these points in under two minutes:

- risky payouts should carry a trust permit
- the app produces `RELEASE`, `CAP`, or `BLOCK`
- permits are anchored on Solana devnet
- the ledger recomputes and verifies permit evidence
- builders can integrate the SDK

## 90-Second Video Script

### 0-10 Seconds: Problem

Narration:

```text
Autonomous agents and DAO treasury tools can prepare Solana payouts, but a
wallet signature alone does not explain why a payout is safe.
```

Screen:

- Demo first fold
- `ProofMesh Guard`
- `Trust permits before Solana agent payments move funds`

### 10-25 Seconds: Product Object

Narration:

```text
ProofMesh Guard creates a trust permit before funds move. A payout intent is
checked against an inspectable proof bundle and mapped to RELEASE, CAP, or
BLOCK.
```

Screen:

- Evidence Mode
- flow rail: Payout Intent -> Proof Bundle -> Guard Decision -> Trust Permit

### 25-45 Seconds: Three Decisions

Narration:

```text
For a clean payout, the permit releases the requested amount. For an oversized
payout, the permit caps the amount. For a risky payout, the permit is anchored
as blocked evidence and no execute transaction is offered.
```

Screen:

- click `RELEASE`
- click `CAP`
- click `BLOCK`
- pause on `BLOCK` result: `No payout`

### 45-65 Seconds: Solana Evidence

Narration:

```text
This is Solana-native. The Anchor program stores compact permit accounts on
devnet, and approved permits can execute guarded native SOL payouts.
```

Screen:

- Ledger section
- program link
- one permit PDA link
- one issue or execute transaction link

### 65-80 Seconds: Verification

Narration:

```text
The ledger is not just a list of links. It recomputes permit PDAs from the
program id and intent hash, checks amount invariants, and confirms that BLOCK
has no execute path.
```

Screen:

- switch to `Ledger / Verify`
- show `All checks pass`
- show JSON/Markdown evidence pack if visible

### 80-90 Seconds: Developer Infrastructure

Narration:

```text
The SDK lets another Solana builder add this guard before an agent wallet,
payment bot, or DAO treasury moves funds. The open-source path is free; the
hosted API path can provide managed proofs, monitoring, and audit retention.
```

Screen:

- README or SDK integration docs
- optional terminal running `pnpm example:integration`

## Live Demo Click Path

Use this path for a reliable judge walkthrough.

1. Open the demo.
2. Start in `Evidence Mode`.
3. Say the one-liner:
   `Every risky Solana payout should carry a trust permit.`
4. Click `RELEASE`.
5. Show requested amount equals approved amount.
6. Click `CAP`.
7. Show requested amount is larger than approved amount.
8. Click `BLOCK`.
9. Show approved amount is zero and execute transaction is `None by design`.
10. Switch to `Ledger / Verify`.
11. Show `All checks pass`.
12. Open the program link in Solana Explorer.
13. Open a permit PDA link.
14. Mention Live Wallet Mode was manually smoke-tested with Phantom on devnet.
15. Mention SDK integration:
    `pnpm example:integration`

## Optional Live Wallet Path

Use this only if the browser wallet is already configured on devnet and funded.

1. Switch to `Live Wallet Mode`.
2. Connect Phantom on devnet.
3. Select `BLOCK`.
4. Build permit.
5. Issue permit.
6. Explain that no execute transaction is offered.
7. If time allows, run `RELEASE`:
   - build permit
   - issue permit
   - execute payout

Do not make the wallet path mandatory for judging. Evidence Mode and Ledger /
Verify tell the full story without wallet setup risk.

## Fallback Path

If wallet signing, RPC, or Explorer is slow:

1. Stay in `Evidence Mode`.
2. Show captured devnet evidence.
3. Switch to `Ledger / Verify`.
4. Show local verification checks.
5. Open [DEVNET_EVIDENCE.md](./DEVNET_EVIDENCE.md).
6. Open [WALLET_SMOKE.md](./WALLET_SMOKE.md).

The fallback message:

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

## Recording Checklist

- Use a clean browser window.
- Keep zoom at 100%.
- Start with Evidence Mode.
- Avoid showing private wallet screens, seed phrases, local files, or `.env`.
- Keep the recording under two minutes if possible.
- Open Explorer links only after the product flow is clear.
- End on the SDK or ledger verifier, not on a marketing claim.

## Closing Line

```text
ProofMesh Guard makes payout safety composable: a Solana app can verify the
trust permit before it lets capital move.
```
