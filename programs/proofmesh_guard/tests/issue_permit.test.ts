import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import assert from "node:assert/strict";

type DecisionValue = { release: Record<string, never> } | { cap: Record<string, never> } | { block: Record<string, never> };

interface IssuePermitInput {
  intentHash: number[];
  proofRoot: number[];
  decision: DecisionValue;
  requestedAmountLamports: anchor.BN;
  approvedAmountLamports: anchor.BN;
  treasury: anchor.web3.PublicKey;
  recipient: anchor.web3.PublicKey;
  expiresAt: anchor.BN;
}

interface PermitAccount {
  intentHash: number[];
  decision: DecisionValue;
  requestedAmountLamports: anchor.BN;
  approvedAmountLamports: anchor.BN;
  issuer: anchor.web3.PublicKey;
  executionStatus: { notExecuted?: Record<string, never> };
}

type IssuePermitBuilder = {
  accounts(accounts: {
    permit: anchor.web3.PublicKey;
    issuer: anchor.web3.PublicKey;
    systemProgram: anchor.web3.PublicKey;
  }): {
    rpc(): Promise<string>;
  };
};

type ProofmeshGuardProgram = Program & {
  methods: {
    issuePermit(args: IssuePermitInput): IssuePermitBuilder;
  };
  account: {
    permit: {
      fetch(address: anchor.web3.PublicKey): Promise<PermitAccount>;
    };
  };
};

const PROGRAM_ID = new anchor.web3.PublicKey(
  "Guard111111111111111111111111111111111111111"
);

function bytes32(seed: number): number[] {
  const value = Buffer.alloc(32);
  value[31] = seed;

  return Array.from(value);
}

function publicKey(seed: number): anchor.web3.PublicKey {
  return new anchor.web3.PublicKey(Buffer.from(bytes32(seed)));
}

function permitPda(intentHash: number[]): anchor.web3.PublicKey {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("permit"), Buffer.from(intentHash)],
    PROGRAM_ID
  )[0];
}

function decision(name: "release" | "cap" | "block"): DecisionValue {
  return { [name]: {} } as DecisionValue;
}

describe("proofmesh_guard issue_permit", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.proofmeshGuard as unknown as ProofmeshGuardProgram;
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const treasury = publicKey(201);
  const recipient = publicKey(202);

  async function issuePermit(args: {
    intentHash: number[];
    proofRoot: number[];
    decisionValue: ReturnType<typeof decision>;
    requestedAmountLamports: anchor.BN;
    approvedAmountLamports: anchor.BN;
  }) {
    const permit = permitPda(args.intentHash);

    await program.methods
      .issuePermit({
        intentHash: args.intentHash,
        proofRoot: args.proofRoot,
        decision: args.decisionValue,
        requestedAmountLamports: args.requestedAmountLamports,
        approvedAmountLamports: args.approvedAmountLamports,
        treasury,
        recipient,
        expiresAt: new anchor.BN(1770000000)
      })
      .accounts({
        permit,
        issuer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    return {
      permit,
      account: await program.account.permit.fetch(permit)
    };
  }

  it("issues RELEASE permit", async () => {
    const intentHash = bytes32(1);
    const { permit, account } = await issuePermit({
      intentHash,
      proofRoot: bytes32(101),
      decisionValue: decision("release"),
      requestedAmountLamports: new anchor.BN(500_000_000),
      approvedAmountLamports: new anchor.BN(500_000_000)
    });

    assert.equal(account.intentHash.toString(), intentHash.toString());
    assert.deepEqual(account.decision, decision("release"));
    assert.equal(account.requestedAmountLamports.toString(), "500000000");
    assert.equal(account.approvedAmountLamports.toString(), "500000000");
    assert.equal(account.issuer.toBase58(), provider.wallet.publicKey.toBase58());
    assert.equal(account.executionStatus.notExecuted !== undefined, true);
    assert.equal(permit.toBase58(), permitPda(intentHash).toBase58());
  });

  it("issues CAP permit", async () => {
    const intentHash = bytes32(2);
    const { account } = await issuePermit({
      intentHash,
      proofRoot: bytes32(102),
      decisionValue: decision("cap"),
      requestedAmountLamports: new anchor.BN(1_500_000_000),
      approvedAmountLamports: new anchor.BN(1_000_000_000)
    });

    assert.deepEqual(account.decision, decision("cap"));
    assert.equal(account.requestedAmountLamports.toString(), "1500000000");
    assert.equal(account.approvedAmountLamports.toString(), "1000000000");
  });

  it("issues BLOCK permit", async () => {
    const intentHash = bytes32(3);
    const { account } = await issuePermit({
      intentHash,
      proofRoot: bytes32(103),
      decisionValue: decision("block"),
      requestedAmountLamports: new anchor.BN(500_000_000),
      approvedAmountLamports: new anchor.BN(0)
    });

    assert.deepEqual(account.decision, decision("block"));
    assert.equal(account.approvedAmountLamports.toString(), "0");
  });

  it("rejects invalid amount and decision combinations", async () => {
    const intentHash = bytes32(4);

    await assert.rejects(
      () =>
        issuePermit({
          intentHash,
          proofRoot: bytes32(104),
          decisionValue: decision("block"),
          requestedAmountLamports: new anchor.BN(500_000_000),
          approvedAmountLamports: new anchor.BN(1)
        }),
      /InvalidBlockAmount|BLOCK permits must approve zero lamports/
    );
  });

  it("rejects duplicate permit PDA initialization", async () => {
    const intentHash = bytes32(5);

    await issuePermit({
      intentHash,
      proofRoot: bytes32(105),
      decisionValue: decision("release"),
      requestedAmountLamports: new anchor.BN(500_000_000),
      approvedAmountLamports: new anchor.BN(500_000_000)
    });

    await assert.rejects(
      () =>
        issuePermit({
          intentHash,
          proofRoot: bytes32(105),
          decisionValue: decision("release"),
          requestedAmountLamports: new anchor.BN(500_000_000),
          approvedAmountLamports: new anchor.BN(500_000_000)
        }),
      /already in use|already initialized|custom program error/
    );
  });
});
