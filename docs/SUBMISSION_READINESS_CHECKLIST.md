# Submission Readiness Checklist

Цей чеклист побудований за Superteam Ukraine guide і Colosseum form screenshots.
Інструкції українською, submission content англійською.

## Current Date Context

Сьогодні 2026-05-09. Якщо дедлайн у понеділок, це 2026-05-11. Основний ризик
тепер не код, а якість пакування і публічність лінків.

## Hard Blockers

- [ ] Public live product URL returns `200`, `301`, або `302` without login.
- [ ] Pitch video link opens without login.
- [ ] Tech demo video link opens without login.
- [ ] Colosseum final submit is not clicked until all fields are complete.

Verified production URL:

```text
https://proofmesh-solana-guard.vercel.app
```

Do not use older protected preview URLs that returned `401`.

## Repository

Repo link:

```text
https://github.com/Vetassikc/proofmesh-solana-guard
```

Що вже добре:

- Public main repository.
- Regular incremental commits visible.
- README explains project, Solana integration, local run, SDK, and submission docs.
- Anchor program, SDK, demo, scripts, IDL, examples, and docs are in one repo.

Що перевірити перед submit:

- [ ] GitHub page opens in incognito.
- [ ] README first screen immediately explains the product.
- [x] README has live demo link after public URL is fixed.
- [ ] No secrets, seed phrases, `.env`, or local wallet JSON files are committed.

## MVP

MVP criteria from the guide:

- Clear interface.
- Actual Solana integration.
- One clear use case.
- README explaining what it is and how to run it.
- Team can explain technical decisions even if AI tools were used.

ProofMesh Guard maps well to this:

- One use case: trust permit before risky payout.
- Actual Solana integration: Anchor devnet program, permit PDAs, guarded payout execution.
- Clear demo path: Evidence Mode -> RELEASE/CAP/BLOCK -> Ledger / Verify.
- SDK and examples for builders.

## Pitch Video

Use:

- [docs/PITCH_VIDEO_SCRIPT.md](./PITCH_VIDEO_SCRIPT.md)
- [docs/SUBMISSION_NARRATIVE.md](./SUBMISSION_NARRATIVE.md)

Requirements:

- [ ] Loom, YouTube, or Vimeo.
- [ ] Not Google Drive or Dropbox.
- [ ] Prefer 2:00-2:30.
- [ ] Product visible in first 15 seconds.
- [ ] No overloaded slides.
- [ ] Main idea understandable in under 60 seconds.

## Tech Demo Video

Use:

- [docs/TECH_DEMO_SCRIPT_FINAL.md](./TECH_DEMO_SCRIPT_FINAL.md)
- [docs/DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

Requirements:

- [ ] Up to 3 minutes.
- [ ] Shows the app, not IDE/GitHub as the main content.
- [ ] Shows user flow.
- [ ] Explains technical decisions.
- [ ] Explains Solana integration.
- [ ] Shows RELEASE, CAP, BLOCK.
- [ ] Shows Ledger / Verify.
- [ ] Mentions Live Wallet Mode as optional.

## Colosseum Form

Use:

- [docs/COLOSSEUM_SUBMISSION_COPY.md](./COLOSSEUM_SUBMISSION_COPY.md)

Must-fill values:

```text
Team primarily based: Ukraine
Supported by: Superteam
Category: Developer Infrastructure
Mobile-focused dApp: No
Live token: No
```

## Final Order

1. Fix public live product URL.
2. Update README with public live demo link.
3. Record tech demo.
4. Record pitch video.
5. Fill Colosseum draft.
6. Open every link in incognito.
7. Submit on Colosseum.
8. Copy Colosseum project link.
9. Submit to Superteam Ukrainian Track.

## Sources

- https://ua.superteam.fun/guide/docs/intro
- https://ua.superteam.fun/guide/docs/mvp
- https://ua.superteam.fun/guide/docs/submission/repository
- https://ua.superteam.fun/guide/docs/submission/pitch-video
- https://ua.superteam.fun/guide/docs/submission/tech-demo
