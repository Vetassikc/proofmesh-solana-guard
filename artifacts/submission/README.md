# Submission Assets

Ця папка містить assets для Colosseum submission. Product copy і screenshot
labels лишаються англійською; інструкції з використання assets написані
українською.

## Скріншоти

- `screenshots/01-evidence-mode.png` - Evidence Mode first fold with the
  RELEASE scenario and captured devnet ledger.
- `screenshots/02-ledger-verify.png` - Ledger / Verify view with `All checks
  pass`, recomputed permit PDAs, scenario cards, and evidence pack.
- `screenshots/03-live-wallet-safe-state.png` - Live Wallet Mode safe no-wallet
  state, showing that Evidence Mode remains available without an extension
  wallet.

## Як Використовувати

1. Для submission gallery спершу використовуй `01-evidence-mode.png`.
2. Другим screenshot став `02-ledger-verify.png`, бо він найсильніше показує
   verifiable evidence.
3. `03-live-wallet-safe-state.png` використовуй тільки якщо треба показати, що
   wallet flow optional і demo не ламається без extension wallet.
4. Для social/share preview краще вручну обрізати `01-evidence-mode.png` до
   верхньої частини з `ProofMesh Guard`, mode switch і scenario panel.
5. Не додавай screenshots із seed phrases, private wallet screens, local wallet
   files або `.env`.

## Порядок Запису Відео

1. Почни з `Evidence Mode`.
2. Покажи one-liner: `Every risky Solana payout should carry a trust permit.`
3. Перемкни `RELEASE`, `CAP`, `BLOCK`.
4. Перейди в `Ledger / Verify` і покажи `All checks pass`.
5. Відкрий один Explorer link.
6. Заверши на SDK integration або evidence pack.

Для повного script дивись `docs/DEMO_SCRIPT.md`.
