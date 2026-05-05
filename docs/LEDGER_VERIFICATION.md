# Ledger Verification

ProofMesh Guard includes a judge-facing `Ledger / Verify` view in the demo app.
It is designed to prove that the captured devnet evidence is internally
consistent and explorer-verifiable without requiring a wallet.

## Що Перевіряє Demo

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

## Ручний Judge Flow

1. Відкрий demo app.
2. Залиш `Evidence Mode` дефолтним, якщо wallet недоступний.
3. Перемкнись на `Ledger / Verify`.
4. Перевір, що status показує `All checks pass`.
5. Відкрий program, deploy, permit, issue і execute links у Solana Explorer.
6. Скопіюй JSON або Markdown evidence pack, якщо потрібен короткий submission artifact.

`Live Wallet Mode` remains optional. It can run fresh devnet flows with an
extension wallet, but the captured evidence and verification ledger tell the
full product story without wallet access.
