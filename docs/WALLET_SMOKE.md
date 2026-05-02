# Manual Wallet Smoke

This checklist captures the founder-run manual devnet wallet smoke for
ProofMesh Guard Live Wallet Mode. Record public devnet evidence only.

Do not add private keys, seed phrases, `.env` files, screenshots with sensitive
wallet data, mainnet wallet instructions, or local wallet file paths.

## Scope

- Demo mode: `Live Wallet Mode`
- Network: Solana devnet only
- Program id: `5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk`
- RPC: `https://api.devnet.solana.com`
- Scenarios: `BLOCK`, `RELEASE`, and optional `CAP`

## Procedure

1. Open the demo app.
2. Switch from `Evidence Mode` to `Live Wallet Mode`.
3. Connect a browser extension wallet configured for devnet.
4. Confirm the app displays the wallet public address and devnet SOL balance.
5. Select `BLOCK`, build the permit, and issue the permit transaction.
6. Confirm `BLOCK` has no execute transaction by design.
7. Select `RELEASE`, build the permit, issue the permit transaction, and execute
   the guarded payout transaction.
8. Optionally select `CAP`, build the permit, issue the permit transaction, and
   execute the capped payout transaction.
9. Open every resulting Solana Explorer link and confirm it uses
   `cluster=devnet`.

## Results

- Wallet extension used: `<wallet-extension-name>`
- Devnet wallet public address: `<public-address-only>`
- BLOCK issue tx link: `<https://explorer.solana.com/tx/...?...cluster=devnet>`
- BLOCK execute tx link: `None by design`
- RELEASE issue tx link: `<https://explorer.solana.com/tx/...?...cluster=devnet>`
- RELEASE execute tx link: `<https://explorer.solana.com/tx/...?...cluster=devnet>`
- CAP issue tx link, if tested: `<https://explorer.solana.com/tx/...?...cluster=devnet>`
- CAP execute tx link, if tested: `<https://explorer.solana.com/tx/...?...cluster=devnet>`

## Acceptance Notes

- `BLOCK` is successful when the permit is issued and no execute transaction is
  created or offered.
- `RELEASE` is successful when the permit is issued and the guarded payout
  execute transaction confirms on devnet.
- `CAP` is successful when the permit is issued and only the approved capped
  amount is executed on devnet.
- If wallet signing, RPC, or devnet balance fails, the app must remain
  recoverable and the judge can return to `Evidence Mode`.
