# ProofMesh Guard Devnet Runbook

Цей runbook описує, як готувати post-deploy devnet path для issuing і
executing ProofMesh Guard permits зі scripts. Product terms і command names
лишай англійською.

## Версії Інструментів

Використовуй той самий major toolchain, що й для local verification:

- Node.js 24.x or a current Node.js version compatible with the repository
  scripts.
- pnpm 10.x.
- Rust/Cargo available on `PATH`.
- Solana CLI compatible with Anchor 0.31.1.
- Anchor CLI 0.31.1, preferably via AVM.

Перевір versions:

```bash
node --version
pnpm --version
cargo --version
solana --version
anchor --version
```

## Вимоги До Wallet І Keypair

Використовуй dedicated devnet wallet. Не використовуй mainnet wallet для
hackathon demo.

Wallet path передається через `ANCHOR_WALLET`:

```bash
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
export ANCHOR_WALLET=/absolute/path/to/devnet-wallet.json
export PROOFMESH_GUARD_PROGRAM_ID=<program-id-after-deploy>
```

Script читає wallet, щоб підписати issue permit transaction і guarded payout
transaction. Він не друкує private key.

Не коміть:

- wallet keypairs
- generated program keypairs
- `.env` files
- validator ledgers
- local credentials

Repository ignores `.env`, `.env.*`, `.anchor/` і `target/`.
Дозволений тільки `.env.example`.

## Як Поповнити Devnet Wallet

Встанови devnet cluster і зроби airdrop SOL:

```bash
solana config set --url https://api.devnet.solana.com
solana airdrop 2 "$(<command-that-prints-your-wallet-pubkey>)"
```

Якщо твій wallet це Solana CLI keypair, перевір його так:

```bash
solana address --keypair "$ANCHOR_WALLET"
solana balance --keypair "$ANCHOR_WALLET"
```

Для repeated demos тримай достатньо devnet SOL для:

- permit account rent
- transaction fees
- release/cap payout lamports

## Синхронізація Program Id Перед Deployment

Перед будь-яким devnet deployment program id має бути синхронізований між:

- `programs/proofmesh_guard/src/lib.rs` via `declare_id!(...)`
- `Anchor.toml` under the devnet program section
- `PROOFMESH_GUARD_PROGRAM_ID`

Scripts вимагають `PROOFMESH_GUARD_PROGRAM_ID` і зрозуміло падають, якщо він
відсутній.

Не коміть generated keypair files. Якщо generated program keypair потрібен для
deployment, тримай його поза repository або всередині ignored paths.

## Post-Deploy Flow Для Scripts

Після program deployment і IDL build запусти:

```bash
pnpm devnet:dry-run
pnpm devnet:release
pnpm devnet:cap
pnpm devnet:block
```

Scripts використовують deterministic SDK fixture scenarios, де це можливо:

- `release` issues a `RELEASE` permit and executes the approved payout.
- `cap` issues a `CAP` permit and executes only the capped amount.
- `block` issues a `BLOCK` permit and intentionally skips payout execution.

Використовуй `--dry-run`, щоб вивести plan і evidence без sending
transactions:

```bash
pnpm build:scripts
node scripts/dist/devnet/run_guarded_payout.js release --dry-run
node scripts/dist/devnet/run_guarded_payout.js --scenario cap --dry-run
```

Використовуй `--run-id <id>`, коли потрібен stable, unique permit PDA для
конкретної demo rehearsal:

```bash
node scripts/dist/devnet/run_guarded_payout.js release --run-id judge-rehearsal-001
```

## Очікуваний Evidence Output

Кожен run друкує structured JSON:

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

Для `block` поля `executeSignature` і `explorerUrls.execute` мають бути `null`.

Це evidence, яке demo ledger має показувати judges:

- permit PDA
- issue transaction signature
- execute transaction signature for `RELEASE` and `CAP`
- no execute transaction for `BLOCK`
- Solana Explorer links on devnet
