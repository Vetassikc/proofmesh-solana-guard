# Як контриб'ютити в ProofMesh Guard

Цей репозиторій є hackathon build для ProofMesh Guard. Тримай зміни малими,
перевіреними локально і прив'язаними до trust permit flow.

## Старт

```bash
pnpm install
pnpm typecheck
pnpm test
```

## Структура

- `packages/sdk` - TypeScript SDK for trust permits
- `programs/proofmesh_guard` - Anchor program for Solana devnet
- `apps/demo` - judge-facing web demo
- `examples/` - integration examples
- `docs/` - architecture and submission documentation

## Розробка

1. Роби невеликі, reversible changes з локальною перевіркою.
2. Перед комітом запускай `pnpm typecheck && pnpm test`.
3. Код, коментарі в коді, SDK examples і commit messages тримай англійською.
4. Не коміть secrets, `.env` файли, private keys або credentials.

## Зміни SDK

SDK використовує deterministic hashing і canonical JSON encoding. Якщо змінюєш
hashing logic, потрібно регенерувати всі fixtures і devnet evidence.

## Anchor Program

Програма вже deployed on Solana devnet. Зміни Anchor program потребують
`anchor build`, `anchor test` і redeploy. Не змінюй program ID без оновлення
всіх references у demo, docs, scripts і examples.

## Issues і feedback

Для bugs, feature ideas або integration questions відкривай issue. Pull
requests для SDK improvements, additional proof kinds і policy engine
extensions доречні, якщо вони не розширюють MVP у generic agent platform.

## License

MIT - дивись [LICENSE](LICENSE).
