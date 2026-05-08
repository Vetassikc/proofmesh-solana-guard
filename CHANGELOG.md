# Changelog

All notable changes to ProofMesh Guard are documented here.

## [0.1.0] — 2026-05-08

### Added

- Anchor program deployed on Solana devnet (`5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk`)
- PDA permit registry derived from `["permit", intentHash]`
- Guarded SOL payout execution for RELEASE and CAP permits
- Blocked permit anchoring for BLOCK decisions
- TypeScript SDK (`@proofmesh/guard-sdk`) with:
  - Canonical JSON hashing
  - Deterministic proof bundles
  - Policy evaluation engine (RELEASE, CAP, HOLD, BLOCK)
  - Trust permit issuance and verification
  - Guard scenario fixtures
- Judge demo app with Evidence Mode, Ledger/Verify, and Live Wallet Mode
- Proof Bundle Inspector with PASS/FAIL visualization
- "Built for builders" section (Agent Wallet, DAO Treasury, Payment Bot)
- SDK integration examples (Node.js, DAO Treasury Bot)
- Captured devnet evidence for all three scenarios
- Phantom wallet smoke evidence
- Comprehensive edge-case tests
- Submission documentation (narrative, demo script, architecture)
