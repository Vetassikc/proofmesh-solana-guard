# Manual Wallet Smoke Evidence

This file records founder-reported manual devnet wallet smoke evidence for
ProofMesh Guard Live Wallet Mode. It is separate from the static captured
devnet evidence in [DEVNET_EVIDENCE.md](./DEVNET_EVIDENCE.md).

Це manual smoke evidence, а не automated test result.

Не додавай private keys, seed phrases, `.env` files, screenshots із sensitive
wallet data, mainnet wallet instructions або local wallet file paths.

## Scope

- Demo mode: `Live Wallet Mode`
- Network: Solana devnet only
- Wallet extension: Phantom
- Devnet wallet public address:
  `HDpkp2eGQjJDoHDX1TU1GBet2BfJuzg5V1Umdqge2Pd1`
- Program id: `5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk`
- RPC: `https://api.devnet.solana.com`
- Reported errors: none

## Founder-Reported Results

### BLOCK

`BLOCK` was issued and intentionally had no execute transaction.

- Issue transaction:
  `5d7w5G81gGPqkLaYHqnxfGsmmKLZXU4sv14GkWVfct3NYvGmdseepqtq4cZnUuBPujd36t2wTQhNsBj8ubhtLBky`
- Issue Explorer:
  `https://explorer.solana.com/tx/5d7w5G81gGPqkLaYHqnxfGsmmKLZXU4sv14GkWVfct3NYvGmdseepqtq4cZnUuBPujd36t2wTQhNsBj8ubhtLBky?cluster=devnet`
- Execute transaction: none by design

### RELEASE

`RELEASE` was issued and executed.

- Issue transaction:
  `2oCYuXQz6K8niyvaKn6GkhZktyZYPpCrvWNH9JmSJpoi5VHaS7pM3QMUZ7P3QKiV89tfHsUqQyvMyanawCv5NJQD`
- Issue Explorer:
  `https://explorer.solana.com/tx/2oCYuXQz6K8niyvaKn6GkhZktyZYPpCrvWNH9JmSJpoi5VHaS7pM3QMUZ7P3QKiV89tfHsUqQyvMyanawCv5NJQD?cluster=devnet`
- Execute transaction:
  `AB7c2B1ncfAVEMtAEYByPUTjbrLkEKBiY8p4K22KBaXPxq8mCcdF1PiD2pGwkQKUw5uDoaZwf6NjYqUqtCkjSGw`
- Execute Explorer:
  `https://explorer.solana.com/tx/AB7c2B1ncfAVEMtAEYByPUTjbrLkEKBiY8p4K22KBaXPxq8mCcdF1PiD2pGwkQKUw5uDoaZwf6NjYqUqtCkjSGw?cluster=devnet`

### CAP

`CAP` was issued and executed.

- Issue transaction:
  `2HQ7oYJog8AGHr3Aoa9RgkMgWb8MtHpARwETWwDbQbko7nHnxwMoTNZ2xzbx2QUBkniUtfKupL8hEeCkvTGUrFZW`
- Issue Explorer:
  `https://explorer.solana.com/tx/2HQ7oYJog8AGHr3Aoa9RgkMgWb8MtHpARwETWwDbQbko7nHnxwMoTNZ2xzbx2QUBkniUtfKupL8hEeCkvTGUrFZW?cluster=devnet`
- Execute transaction:
  `3ittvuAC67zWnfGm2xuaPtXPDd8s823Cx7o7bThnjQRu8qARKQNcCdUK588aELEAomCzL9He9HMpYBz57NDKnj1u`
- Execute Explorer:
  `https://explorer.solana.com/tx/3ittvuAC67zWnfGm2xuaPtXPDd8s823Cx7o7bThnjQRu8qARKQNcCdUK588aELEAomCzL9He9HMpYBz57NDKnj1u?cluster=devnet`

## Smoke Conclusion

Live Wallet Mode was manually verified on Solana devnet with Phantom:

- `BLOCK`: permit issued; no execute transaction by design.
- `RELEASE`: permit issued; guarded payout executed.
- `CAP`: permit issued; capped guarded payout executed.
- Errors: none reported.
