# AGENTS.md

Спілкуйся з користувачем українською, якщо він не попросить інакше.
Код, коментарі в коді, submission copy, product narrative, SDK examples і commit messages тримай англійською.
Операційні інструкції в Markdown-файлах, тобто що робити, коли запускати, як перевіряти, як записувати демо, пиши українською.

Не читай, не друкуй, не коміть і не поширюй secrets, `.env` файли, private keys, local credentials або tool-provided secrets.

Цей проект є Colosseum Frontier hackathon build для ProofMesh Guard.
Оптимізуй під вузьке, робоче, Solana-native demo перед stretch features.

Core thesis проекту:
`ProofMesh Guard issues trust permits for Solana agent payments and DAO treasury payouts.`

Основний product object:
`TrustPermit` - a verifiable artifact created before a risky payout, mapped to `RELEASE`, `CAP`, `HOLD`, or `BLOCK`, anchored on Solana devnet, and consumed by SDK/demo flows.

Обмеження проекту:
- Не використовуй Arc/Circle positioning.
- Не будуй generic AI agent platform.
- Не будуй dashboard-only product.
- Не будуй custody system, escrow system, full compliance/KYC workflow або multi-chain flow.
- Тримай MVP достатньо вузьким для May 11, 2026 Colosseum Frontier submission deadline.
- Для core demo віддавай перевагу deterministic, inspectable proof bundles, якщо live providers не затверджені явно.
- Solana Actions/Blinks вважай stretch feature після стабільного core permit path.

Правила implementation:
- Роби невеликі, reversible changes з локальною перевіркою.
- Тримай структуру repo зрозумілою: demo app, SDK, Solana program, fixtures, docs.
- З першого екрану проект має виглядати Solana-native: PDA permit accounts, devnet anchoring, guarded payout path, TypeScript SDK, explorer-verifiable evidence.
- Перед implementation тримай specs стислими і сфокусованими на hackathon judging criteria: functionality, Solana ecosystem impact, novelty, UX, Solana technology usage, open-source composability, business plan.
