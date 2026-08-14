# Contributing to ProofMesh Guard

ProofMesh Guard is a focused open-source build for trust permits before Solana
agent payments and DAO treasury payouts. Keep changes small, evidence-backed,
and inside the TrustPermit boundary.

## Getting Started

```bash
pnpm install
pnpm verify
```

`pnpm verify` runs workspace typechecks, tests, and the demo production build.
The default local path does not require a wallet, private key, `.env` file, or
live provider credential.

## Repository Structure

- `packages/sdk` - TypeScript SDK for trust permits
- `programs/proofmesh_guard` - Anchor program for Solana devnet
- `apps/demo` - evidence-first web demo
- `examples/` - integration examples
- `docs/` - architecture, demo, and submission documentation

## Development Rules

1. Make small, reversible changes with focused local verification.
2. Run `pnpm verify` before opening a pull request.
3. Keep code, code comments, SDK examples, and commit messages in English.
4. Never commit secrets, `.env` files, private keys, wallets, or credentials.
5. Preserve the existing Solana devnet and deterministic fixture boundaries.

## SDK Changes

The SDK uses deterministic hashing and canonical JSON encoding. If hashing logic
changes, regenerate every affected fixture and devnet evidence artifact, then
document the compatibility impact in `CHANGELOG.md`.

## Anchor Program Changes

The program is deployed on Solana devnet. Anchor changes require `anchor build`,
`anchor test`, and a deliberate redeploy. Do not change the program ID without
updating every affected reference in the demo, docs, scripts, and examples.

## Issues and Pull Requests

Open an issue for a reproducible bug, integration question, or narrowly scoped
feature proposal. Pull requests for SDK improvements, additional proof kinds,
and policy-engine extensions are welcome when they do not turn the project into
a generic agent platform, custody system, escrow system, compliance suite, or
multi-chain flow.

For undisclosed security issues, follow [SECURITY.md](SECURITY.md) instead of
opening a public issue.

## License

MIT - see [LICENSE](LICENSE).
