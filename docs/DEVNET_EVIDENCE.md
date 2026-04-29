# ProofMesh Guard Devnet Evidence

Captured on April 29, 2026.

## Deployment

- Program id: `5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk`
- Upgrade authority: `4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ`
- Deploy signature:
  `3YeX1Y418UAZcsQHddJ5VX6VZ53zGf6JxaTbYD81BEoc48JwWTeaYVN3ituJUrxcE9Y3pBRZ4MV1hPvCJKaUYbPa`
- Program Explorer:
  `https://explorer.solana.com/address/5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk?cluster=devnet`
- Deploy transaction:
  `https://explorer.solana.com/tx/3YeX1Y418UAZcsQHddJ5VX6VZ53zGf6JxaTbYD81BEoc48JwWTeaYVN3ituJUrxcE9Y3pBRZ4MV1hPvCJKaUYbPa?cluster=devnet`

Deployment verification from `solana program show`:

```text
Program Id: 5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 29MtZLBSPuKmaeErXXZ4WaKpZQtWSF16H6sjhYZ58DYZ
Authority: 4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ
Last Deployed In Slot: 458875799
Data Length: 216064 (0x34c00) bytes
Balance: 1.50500952 SOL
```

## RELEASE Evidence

```json
{
  "approvedAmountLamports": "500000000",
  "decision": "RELEASE",
  "dryRun": false,
  "executeSignature": "2KAyBgLb1dZ65jyq264k27kQvSpNbTZk92MuMYP671jue9bpmqsQjwQVtRF7jy3SX2n5yfXqa5rFT27XmGNBZqDF",
  "explorerUrls": {
    "execute": "https://explorer.solana.com/tx/2KAyBgLb1dZ65jyq264k27kQvSpNbTZk92MuMYP671jue9bpmqsQjwQVtRF7jy3SX2n5yfXqa5rFT27XmGNBZqDF?cluster=devnet",
    "issue": "https://explorer.solana.com/tx/3Ez5afKC74VG4mBq8827M3V8oVAtnVHTpcSqg4ucZ2Us4cj5TcTc6YBedeD2gMYW1be8wUr4v1p43ebtY7y85mHk?cluster=devnet",
    "permit": "https://explorer.solana.com/address/gQEKK4ivQ8NnA2wEHLZPZGfJFrzThHhgBiVCidHsBWF?cluster=devnet"
  },
  "intentHash": "0656ac753926b129a5ef4616c524d927954912604c3f792fcf29bb137a65c324",
  "issueSignature": "3Ez5afKC74VG4mBq8827M3V8oVAtnVHTpcSqg4ucZ2Us4cj5TcTc6YBedeD2gMYW1be8wUr4v1p43ebtY7y85mHk",
  "permitPda": "gQEKK4ivQ8NnA2wEHLZPZGfJFrzThHhgBiVCidHsBWF",
  "programId": "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk",
  "proofRoot": "61720ec0afa4453773906e08e53b45c1fa669f6e3c114bae09d9b48533f1eb8b",
  "recipient": "7rH1q9pnbCb96971UanCNAk4pUkD7D5mkt4Mn3rEMhyA",
  "requestedAmountLamports": "500000000",
  "scenario": "release",
  "treasury": "4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ"
}
```

## CAP Evidence

```json
{
  "approvedAmountLamports": "1000000000",
  "decision": "CAP",
  "dryRun": false,
  "executeSignature": "5Wy9UeCpAyM1zBMnLqjn5qCmbVMNM28CqdT8Hoz1wp26jXxSNhMEJmKboXVnjpgXP7M8bdgnMsveR3uYdKDgbDxd",
  "explorerUrls": {
    "execute": "https://explorer.solana.com/tx/5Wy9UeCpAyM1zBMnLqjn5qCmbVMNM28CqdT8Hoz1wp26jXxSNhMEJmKboXVnjpgXP7M8bdgnMsveR3uYdKDgbDxd?cluster=devnet",
    "issue": "https://explorer.solana.com/tx/2Lo7a2o8N74rkRnf5zyoecvRv8LYJRTyYLq2qoGLJjgjvEpij5mKAfpFcb8QShz8Vmb7g5AAJnPD2MtEBECyWMvC?cluster=devnet",
    "permit": "https://explorer.solana.com/address/DpPzEAsPjMRACw6yHNZVaGucit8CHZjxJSwuNBKp2ZxC?cluster=devnet"
  },
  "intentHash": "b9bad1d710144e8e9ecbf89fafcb9cfa27baa6bacca04d201ba00bdfb213cfed",
  "issueSignature": "2Lo7a2o8N74rkRnf5zyoecvRv8LYJRTyYLq2qoGLJjgjvEpij5mKAfpFcb8QShz8Vmb7g5AAJnPD2MtEBECyWMvC",
  "permitPda": "DpPzEAsPjMRACw6yHNZVaGucit8CHZjxJSwuNBKp2ZxC",
  "programId": "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk",
  "proofRoot": "f43cb469ea93c4e531a5d3eae34c03977a710ceab8b493180934633f7e2cdd02",
  "recipient": "D5VRJrq5GZRc2AntDBmziZ1FjVGYWpRAAv4Ur1dk4JzS",
  "requestedAmountLamports": "1500000000",
  "scenario": "cap",
  "treasury": "4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ"
}
```

## BLOCK Evidence

`BLOCK` intentionally has no execute transaction. The permit is anchored as
blocked evidence and payout execution is skipped.

```json
{
  "approvedAmountLamports": "0",
  "decision": "BLOCK",
  "dryRun": false,
  "executeSignature": null,
  "explorerUrls": {
    "execute": null,
    "issue": "https://explorer.solana.com/tx/2pU33nosKpNvSvCzJzxDTcnjBRCaPB7pY4T6oEWUncYq9JqikFwAZbF7Rz885Yket5Ap5nxN8opjneAoMYNAg1eb?cluster=devnet",
    "permit": "https://explorer.solana.com/address/mYQKtUJbkC3FCVzy7vfquqMjLx1ShBxui9SP2jkLaAT?cluster=devnet"
  },
  "intentHash": "e6cc2936e986b64efde096d8a7772391893e907443ea98c8213c7ea1282b485f",
  "issueSignature": "2pU33nosKpNvSvCzJzxDTcnjBRCaPB7pY4T6oEWUncYq9JqikFwAZbF7Rz885Yket5Ap5nxN8opjneAoMYNAg1eb",
  "permitPda": "mYQKtUJbkC3FCVzy7vfquqMjLx1ShBxui9SP2jkLaAT",
  "programId": "5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk",
  "proofRoot": "312111a6c62d354e1170f6f0b576b9e02a3bd65bf10f27114aa2df080ceefdb2",
  "recipient": "7jBHAnw1Ta53QFkWC12h5JQ6pz8KbAozQw416kxyR49Z",
  "requestedAmountLamports": "500000000",
  "scenario": "block",
  "treasury": "4eigJVie2v4UssRFWLaqMzWmRWEi6eARkMo1Jat4aJBJ"
}
```
