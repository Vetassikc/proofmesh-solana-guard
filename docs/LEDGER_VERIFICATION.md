# Ledger Verification

ProofMesh Guard includes a judge-facing `Ledger / Verify` view in the demo app.
It is designed to prove that the captured devnet evidence is internally
consistent and explorer-verifiable without requiring a wallet.

## What The Demo Verifies

The verification view checks:

- the captured program id matches the expected devnet program id
- the deploy transaction links to Solana Explorer on devnet
- every scenario has a 32-byte intent hash
- every scenario has a 32-byte proof root
- every permit PDA is recomputed from:
  - program id
  - seed prefix `permit`
  - captured intent hash
- `RELEASE` and `CAP` include execute transactions
- `BLOCK` intentionally has no execute transaction
- amount invariants hold:
  - `RELEASE`: approved amount equals requested amount
  - `CAP`: approved amount is greater than zero and below requested amount
  - `BLOCK`: approved amount is zero

## Manual Judge Flow

1. Open the demo app.
2. Keep `Evidence Mode` as the default if no wallet is available.
3. Switch to `Ledger / Verify`.
4. Confirm the status reads `All checks pass`.
5. Open the program, deploy, permit, issue, and execute links in Solana Explorer.
6. Copy the JSON or Markdown evidence pack if a concise submission artifact is
   needed.

`Live Wallet Mode` remains optional. It can run fresh devnet flows with an
extension wallet, but the captured evidence and verification ledger tell the
full product story without wallet access.
