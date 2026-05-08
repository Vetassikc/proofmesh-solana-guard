# Colosseum Submission Copy

Цей файл призначений для швидкого copy/paste у форму Colosseum. Інструкції
написані українською, а тексти для полів форми - англійською.

## Статус Перед Фінальним Submit

Не натискай фінальний `Submit Project`, доки всі пункти нижче не зелені.
Після сабміту більшість полів буде заблокована для редагування.

- [ ] Public GitHub repository opens without login.
- [ ] Live product link opens without Vercel login or other auth.
- [ ] Product demo video is public or unlisted and opens without Google Drive / Dropbox.
- [ ] Pitch video is public or unlisted and opens without Google Drive / Dropbox.
- [ ] Logo or project graphic is uploaded.
- [ ] Team fields are complete.
- [ ] Final survey fields are complete.

Public production demo verified on 2026-05-09:
`https://proofmesh-solana-guard.vercel.app` returned `HTTP 200`. Use this
production URL, not older protected preview URLs that returned `401`.

## Step 1 - Project Info

### Project Name

```text
ProofMesh Guard
```

### Brief Description

```text
Solana-native trust permits for agent and DAO treasury payouts. ProofMesh Guard checks payout intent, anchors RELEASE/CAP/BLOCK permit PDAs on devnet, and lets approved permits execute while blocked payouts become verifiable evidence.
```

### Project Website

Перед вставкою перевір, що URL відкривається без логіну.

```text
https://proofmesh-solana-guard.vercel.app
```

### What are you building, and who is it for?

```text
ProofMesh Guard is a Solana-native trust-permit layer for builders of agent wallets, payment bots, and DAO treasury tools. Before a risky payout moves funds, the system checks a payout intent against an inspectable proof bundle, produces a RELEASE, CAP, or BLOCK decision, and anchors the result as a permit PDA on Solana devnet.

It is for Solana teams that need more than a wallet signature or off-chain risk score. They need a composable artifact that explains why a payout was allowed, capped, or blocked before capital moves.
```

### Why did you decide to build this, and why build it now?

```text
AI agents and DAO treasury bots are getting closer to moving funds without a human reviewing every transaction. That makes payout safety a real infrastructure problem: a wallet signature shows who signed, but not why a payout was safe.

Recent crypto exploits and the rise of autonomous agents make this urgent. Solana needs a simple primitive that lets apps verify payout risk before execution. ProofMesh Guard focuses on that narrow moment: turn intent and proofs into a verifiable permit before funds move.
```

### What technologies are you using or integrating with to build your product?

```text
Solana devnet, Anchor, Rust, TypeScript, React, Vite, @solana/web3.js, Solana wallet adapter, Phantom wallet smoke testing, PDA-based permit accounts, deterministic proof bundles, guarded native SOL payout execution, and an open-source TypeScript SDK.
```

### What category best describes your product?

Рекомендація: якщо доступна тільки одна категорія, вибери:

```text
Developer Infrastructure
```

Як запасний варіант, якщо треба ближче до use case:

```text
Wallet Infrastructure
```

Не вибирай `AI Platforms / Agents` як основну, якщо є `Developer Infrastructure`.
Ми продаємо Solana trust infrastructure, а не просто AI-agent app.

### Is your project a mobile-focused dApp?

```text
No
```

## Step 2 - Media And Code

### Project Logo Or Graphic

Завантаж квадратну картинку. Якщо немає готового лого, зроби простий dark
graphic з текстом `ProofMesh Guard` і підписом `Trust permits before funds move`.

### GitHub Link

```text
https://github.com/Vetassikc/proofmesh-solana-guard
```

### Please share any important context about your repo

```text
This is the main public repository for the full hackathon MVP: Anchor program, TypeScript SDK, demo app, devnet scripts, integration examples, IDL artifact, submission screenshots, and documentation. The commit history shows incremental hackathon work, including SDK, program, guarded payout execution, devnet evidence, wallet smoke evidence, demo UI, and submission assets.
```

### Product Demo Video

Встав Loom або YouTube/Vimeo link. Не використовуй Google Drive або Dropbox.

```text
TBD_PRODUCT_DEMO_VIDEO_URL
```

### Make demo video public in the project directory

Рекомендація:

```text
Yes
```

Вмикай `Yes` тільки після того, як відео виглядає професійно і не показує
seed phrases, local private key files, `.env`, local wallet paths або приватні
Vercel/GitHub screens.

### Live Product Link

Перед вставкою перевір `curl -I <url>` або відкрий в інкогніто. Має бути `200`,
`301`, або `302` без login wall.

```text
https://proofmesh-solana-guard.vercel.app
```

### Access Instructions

Якщо demo public і не потребує wallet:

```text
No login is required. Start in Evidence Mode to view captured devnet RELEASE, CAP, and BLOCK flows. Use Ledger / Verify to recompute permit checks and open Solana Explorer evidence. Live Wallet Mode is optional and requires a Phantom wallet on Solana devnet.
```

Якщо public URL все ще захищений, не сабміть. Спочатку зроби public deploy або
чітко дай суддям доступ. Краще не покладатися на Vercel login for judging.

### Pitch Video

Встав Loom або YouTube/Vimeo link. Для безпеки тримай 2:00-2:30, хоча гайд
дозволяє до 3 хвилин.

```text
TBD_PITCH_VIDEO_URL
```

## Step 3 - Team

### Where is your team primarily based?

```text
Ukraine
```

### Team Telegram Contact

```text
@vetassikc
```

### X Profile

```text
https://x.com/RadionovVitalij
```

### Did anyone not listed on the team do meaningful work on this project?

Якщо форма має це поле, будь чесним: AI tools helped, але founder owned the
product decisions and implementation flow. Не створюй враження, що сторонній
розробник зібрав MVP за тебе.

```text
No external builder owned a material part of the project. I used AI coding agents as development tools, but I directed the product, architecture, implementation priorities, verification, and submission work myself. Superteam Ukraine provided ecosystem guidance, not implementation.
```

### Is there anything else judges should know?

```text
ProofMesh Guard is already deployed on Solana devnet with captured RELEASE, CAP, and BLOCK evidence. The MVP includes a public demo, Anchor program, TypeScript SDK, integration examples, ledger verifier, and Phantom wallet smoke evidence. The core point is composability: another Solana app can verify the permit before it lets capital move.
```

### Are you applying for the Colosseum accelerator program and seeking investment from Colosseum?

Рекомендація:

```text
Yes
```

## Accelerator Application

### How do you know people actually need, or will need this product?

```text
The need comes from a clear shift in Solana workflows: more teams are building agent wallets, DAO treasury automation, payment bots, and policy-driven execution. These systems can prepare transactions faster than humans can review them, but current safety primitives mostly answer adjacent questions: multisigs coordinate approvals, governance tools coordinate votes, and risk APIs return advisory scores.

ProofMesh Guard focuses on the missing step before execution: can this payout produce a verifiable permit that another Solana app can inspect? The devnet MVP demonstrates this with RELEASE, CAP, and BLOCK flows, showing that approved payments can execute, oversized payments can be capped, and risky payments can be blocked while still leaving on-chain evidence.
```

### How far along are you? Do you have users? Please be as specific as possible.

```text
The hackathon MVP is functional on Solana devnet. It includes an Anchor program, PDA permit accounts, guarded native SOL payout execution, captured devnet evidence for RELEASE/CAP/BLOCK scenarios, a React demo, Ledger / Verify mode, optional Phantom wallet flow, TypeScript SDK, integration examples, and public documentation.

I do not have paying users yet. Current traction is technical validation: public repository, deployed devnet program, working demo, wallet smoke test, and ecosystem conversations through Superteam Ukraine. The next user target is Solana hackathon teams and agent/DAO builders who can integrate the SDK before treasury or bot payouts.
```

### Who else is building in this space, and what do you think they're getting wrong?

```text
Adjacent products include multisig tools like Squads, governance tools like Realms, wallet infrastructure, and off-chain risk APIs. They solve important problems, but not this exact one.

Multisigs answer "did enough people approve?" Governance answers "did the community vote?" Risk APIs answer "is this risky?" but usually return an off-chain advisory score. ProofMesh Guard asks a different execution-time question: "does this payout have a valid, inspectable permit before funds move?" The permit PDA is the product object, so other Solana apps can verify it instead of trusting a dashboard or opaque score.
```

### How do you make money, or how do you plan to?

```text
The open-source SDK stays free to maximize developer adoption. The commercial path is a hosted Guard API for teams that do not want to operate proof providers, policy evaluation, monitoring, and audit retention themselves.

Planned tiers: Free SDK and self-hosted verification; Pro at about $99/month for managed proof bundles, 10,000 permits/month, alerts, and 30-day audit retention; Enterprise custom pricing for higher volume, SLA, dedicated proof providers, longer retention, and custom policy rules.
```

### How long have you each been working on this? Have you been working on it full time?

```text
I built ProofMesh Guard during the Colosseum Frontier hackathon sprint, building on my prior work around trust, risk, and agent-assisted development. During the sprint I worked on it intensively, but not as a full-time incorporated company yet. If accepted into the accelerator or supported with ecosystem funding, I would focus on hardening the SDK, improving proof providers, and preparing a mainnet-ready version.
```

### Where is each member of the team currently based, and do you work in-person together?

```text
I am a solo founder originally from Ukraine and currently based in Switzerland. The project is submitted through the Ukrainian ecosystem track and supported by Superteam Ukraine. I work remotely and coordinate online. If funding or accelerator support is received, I would keep building remotely while using Superteam Ukraine and Solana ecosystem events for community feedback and partner discovery.
```

### Have you formed a legal entity yet?

```text
No
```

### Have you taken any investment yet?

Якщо поле binary, обери `No`. Якщо є текстове уточнення:

```text
No equity investment yet. I have received non-dilutive Google for Startups Cloud support for related builder work, but ProofMesh Guard has not taken equity investment.
```

### Are you currently fundraising?

Якщо хочеш бути відкритим до accelerator/investment, але не виглядати як
хаотичний fundraising:

```text
Not formally. I am open to accelerator and strategic ecosystem funding conversations if the product direction is a strong fit.
```

### Do you have a live token?

```text
No
```

### Equity percentage

Якщо подаєшся в accelerator і поле обов'язкове, не вигадуй складну структуру.
Для solo founder pre-incorporation можна вказати:

```text
2
```

## Final Hackathon Survey

### Do you intend to continue working on this project after the hackathon?

```text
Yes
```

### Have you participated in a Solana developer bootcamp or workshop?

Обери `Yes` тільки якщо ти реально проходив Solana Startup Terminal, Superteam
workshop або інший Solana developer bootcamp. Якщо це була лише консультація з
Сергієм чи чат Superteam, обери `No`.

```text
Yes, if attended. Otherwise No.
```

### Which program or workshop(s) did you attend?

Заповнюй тільки якщо попереднє поле `Yes`.

```text
Solana Startup Terminal by Superteam Ukraine
```

### Are you building in Canteen's Swarm event?

```text
No
```

### Rate your developer experience building on Solana

Рекомендація:

```text
3
```

Якщо після Anchor/devnet deploy відчуваєш впевненість, можна `4`, але `3`
виглядає чесніше для solo founder, який щойно зайшов глибоко в Solana.

### How did you hear about the hackathon?

```text
Ecosystem organizations (Superteam, mtnDAO, TURBIN3, etc.)
```

### Which group(s) supported you during your hackathon experience?

```text
Superteam
```

### Do you want to stay in touch with the Solana Foundation about any of the following topics?

```text
Future Solana hackathons or builder events
Developer resources and updates
```

## Submission Order

1. Перевір public live demo URL.
2. Запиши product demo video.
3. Запиши pitch video.
4. Завантаж logo/graphic.
5. Заповни Colosseum fields з цього файлу.
6. Перевір усі links в incognito.
7. Натискай final submit тільки після complete status.
8. Після Colosseum submit подай project link на Superteam Ukrainian Track.

## Guide References

- https://ua.superteam.fun/guide/docs/intro
- https://ua.superteam.fun/guide/docs/mvp
- https://ua.superteam.fun/guide/docs/submission/repository
- https://ua.superteam.fun/guide/docs/submission/pitch-video
- https://ua.superteam.fun/guide/docs/submission/tech-demo
