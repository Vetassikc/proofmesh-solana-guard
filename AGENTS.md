# AGENTS.md

Communicate with the user in Ukrainian unless asked otherwise.
Keep code, comments, documentation, and commit messages in English.

Do not read, print, commit, or propagate secrets, `.env` files, private keys, local credentials, or tool-provided secrets.

This project is a Colosseum Frontier hackathon build for ProofMesh Guard.
Optimize for a narrow, working, Solana-native demo before adding stretch features.

Core project thesis:
`ProofMesh Guard issues trust permits for Solana agent payments and DAO treasury payouts.`

Primary product object:
`TrustPermit` - a verifiable artifact created before a risky payout, mapped to `RELEASE`, `CAP`, `HOLD`, or `BLOCK`, anchored on Solana devnet, and consumed by SDK/demo flows.

Project constraints:
- Do not reuse Arc/Circle positioning.
- Do not build a generic AI agent platform.
- Do not build a dashboard-only product.
- Do not build a custody system, escrow system, full compliance/KYC workflow, or multi-chain flow.
- Keep the MVP small enough for the May 11, 2026 Colosseum Frontier submission deadline.
- Prefer deterministic, inspectable proof bundles for the core demo unless live providers are explicitly approved.
- Treat Solana Actions/Blinks as a stretch feature after the core permit path works.

Implementation preferences:
- Prefer small, reversible changes with local verification.
- Keep the repository structure clear: demo app, SDK, Solana program, fixtures, and docs.
- Make the project look Solana-native from the first commit: PDA permit accounts, devnet anchoring, guarded payout path, TypeScript SDK, and explorer-verifiable evidence.
- Before implementation, keep specs concise and focused on the hackathon judging criteria: functionality, Solana ecosystem impact, novelty, UX, Solana technology usage, open-source composability, and business plan.
