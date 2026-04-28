# ProofMesh Guard Devnet Runbook

This runbook prepares the post-deploy devnet path for issuing and executing
ProofMesh Guard permits from scripts. It does not require deployment during
Day 5a.

## Required Tool Versions

Use the same major toolchain as local verification:

- Node.js 24.x or a current Node.js version compatible with the repository
  scripts.
- pnpm 10.x.
- Rust/Cargo available on `PATH`.
- Solana CLI compatible with Anchor 0.31.1.
- Anchor CLI 0.31.1, preferably via AVM.

Check versions:

```bash
node --version
pnpm --version
cargo --version
solana --version
anchor --version
```

## Wallet And Keypair Requirements

Use a dedicated devnet wallet. Do not use a mainnet wallet for the hackathon
demo.

The wallet path is supplied through `ANCHOR_WALLET`:

```bash
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
export ANCHOR_WALLET=/absolute/path/to/devnet-wallet.json
export PROOFMESH_GUARD_PROGRAM_ID=<program-id-after-deploy>
```

The script reads the wallet to sign the issue permit transaction and the
guarded payout transaction. It never prints the private key.

Do not commit:

- wallet keypairs
- generated program keypairs
- `.env` files
- validator ledgers
- local credentials

The repository ignores `.env`, `.env.*`, `.anchor/`, and `target/`.
Only `.env.example` is allowed.

## Fund A Devnet Wallet

Set the devnet cluster and airdrop SOL:

```bash
solana config set --url https://api.devnet.solana.com
solana airdrop 2 "$(<command-that-prints-your-wallet-pubkey>)"
```

If your wallet is the Solana CLI keypair, check it with:

```bash
solana address --keypair "$ANCHOR_WALLET"
solana balance --keypair "$ANCHOR_WALLET"
```

For repeated demos, keep enough devnet SOL for:

- permit account rent
- transaction fees
- release/cap payout lamports

## Program Id Sync Before Deployment

Before any devnet deployment, the program id must be synchronized across:

- `programs/proofmesh_guard/src/lib.rs` via `declare_id!(...)`
- `Anchor.toml` under the devnet program section
- `PROOFMESH_GUARD_PROGRAM_ID`

The Day 5a scripts require `PROOFMESH_GUARD_PROGRAM_ID` and fail clearly when it
is missing.

Do not commit generated keypair files. If a generated program keypair is needed
for deployment, keep it outside the repository or inside ignored paths.

## Post-Deploy Script Flow

After the program has been deployed and the IDL has been built, run:

```bash
pnpm devnet:dry-run
pnpm devnet:release
pnpm devnet:cap
pnpm devnet:block
```

The scripts use deterministic SDK fixture scenarios where possible:

- `release` issues a `RELEASE` permit and executes the approved payout.
- `cap` issues a `CAP` permit and executes only the capped amount.
- `block` issues a `BLOCK` permit and intentionally skips payout execution.

Use `--dry-run` to derive the plan and print evidence without sending
transactions:

```bash
pnpm build:scripts
node scripts/dist/devnet/run_guarded_payout.js release --dry-run
node scripts/dist/devnet/run_guarded_payout.js --scenario cap --dry-run
```

Use `--run-id <id>` when you need a stable, unique permit PDA for a specific
demo rehearsal:

```bash
node scripts/dist/devnet/run_guarded_payout.js release --run-id judge-rehearsal-001
```

## Expected Evidence Output

Each run prints structured JSON:

```json
{
  "scenario": "release",
  "programId": "<program-id>",
  "permitPda": "<permit-pda>",
  "issueSignature": "<issue-tx-or-null>",
  "executeSignature": "<execute-tx-or-null>",
  "explorerUrls": {
    "permit": "https://explorer.solana.com/address/<permit-pda>?cluster=devnet",
    "issue": "https://explorer.solana.com/tx/<issue-sig>?cluster=devnet",
    "execute": "https://explorer.solana.com/tx/<execute-sig>?cluster=devnet"
  },
  "decision": "RELEASE",
  "requestedAmountLamports": "500000000",
  "approvedAmountLamports": "500000000"
}
```

For `block`, `executeSignature` and `explorerUrls.execute` are `null`.

This evidence is what the demo ledger should eventually surface to judges:

- permit PDA
- issue transaction signature
- execute transaction signature for `RELEASE` and `CAP`
- no execute transaction for `BLOCK`
- Solana Explorer links on devnet
