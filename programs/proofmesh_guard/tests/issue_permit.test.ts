import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import assert from "node:assert/strict";

type DecisionValue =
  | { release: Record<string, never> }
  | { cap: Record<string, never> }
  | { hold: Record<string, never> }
  | { block: Record<string, never> };

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
  executionStatus: {
    notExecuted?: Record<string, never>;
    executed?: Record<string, never>;
  };
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

type ExecutePayoutBuilder = {
  accounts(accounts: {
    permit: anchor.web3.PublicKey;
    treasury: anchor.web3.PublicKey;
    recipient: anchor.web3.PublicKey;
    systemProgram: anchor.web3.PublicKey;
  }): {
    signers(signers: anchor.web3.Keypair[]): {
      rpc(): Promise<string>;
    };
    rpc(): Promise<string>;
  };
};

type ProofmeshGuardProgram = Program & {
  methods: {
    issuePermit(args: IssuePermitInput): IssuePermitBuilder;
    executePayout(): ExecutePayoutBuilder;
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

function permitPda(intentHash: number[]): anchor.web3.PublicKey {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("permit"), Buffer.from(intentHash)],
    PROGRAM_ID
  )[0];
}

function decision(name: "release" | "cap" | "hold" | "block"): DecisionValue {
  return { [name]: {} } as DecisionValue;
}

describe("proofmesh_guard issue_permit", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.proofmeshGuard as unknown as ProofmeshGuardProgram;
  const provider = anchor.getProvider() as anchor.AnchorProvider;

  async function fundedAccount(lamports = 2_000_000_000): Promise<anchor.web3.Keypair> {
    const account = anchor.web3.Keypair.generate();
    const signature = await provider.connection.requestAirdrop(
      account.publicKey,
      lamports
    );
    const blockhash = await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction(
      {
        signature,
        ...blockhash
      },
      "confirmed"
    );

    return account;
  }

  async function issuePermit(args: {
    intentHash: number[];
    proofRoot: number[];
    decisionValue: ReturnType<typeof decision>;
    requestedAmountLamports: anchor.BN;
    approvedAmountLamports: anchor.BN;
    treasury?: anchor.web3.PublicKey;
    recipient?: anchor.web3.PublicKey;
    expiresAt?: anchor.BN;
  }) {
    const permit = permitPda(args.intentHash);
    const treasury = args.treasury ?? provider.wallet.publicKey;
    const recipient = args.recipient ?? provider.wallet.publicKey;

    await program.methods
      .issuePermit({
        intentHash: args.intentHash,
        proofRoot: args.proofRoot,
        decision: args.decisionValue,
        requestedAmountLamports: args.requestedAmountLamports,
        approvedAmountLamports: args.approvedAmountLamports,
        treasury,
        recipient,
        expiresAt: args.expiresAt ?? new anchor.BN(1900000000)
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

  async function executePayout(args: {
    permit: anchor.web3.PublicKey;
    treasury: anchor.web3.Keypair;
    recipient: anchor.web3.PublicKey;
  }) {
    return program.methods
      .executePayout()
      .accounts({
        permit: args.permit,
        treasury: args.treasury.publicKey,
        recipient: args.recipient,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([args.treasury])
      .rpc();
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

  it("executes RELEASE permit and transfers approved amount", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const approvedAmount = new anchor.BN(100_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(11),
      proofRoot: bytes32(111),
      decisionValue: decision("release"),
      requestedAmountLamports: approvedAmount,
      approvedAmountLamports: approvedAmount,
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });
    const recipientBefore = await provider.connection.getBalance(
      recipient.publicKey
    );

    await executePayout({
      permit,
      treasury,
      recipient: recipient.publicKey
    });

    const recipientAfter = await provider.connection.getBalance(
      recipient.publicKey
    );
    const account = await program.account.permit.fetch(permit);

    assert.equal(recipientAfter - recipientBefore, approvedAmount.toNumber());
    assert.equal(account.executionStatus.executed !== undefined, true);
  });

  it("executes CAP permit and transfers capped approved amount", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const approvedAmount = new anchor.BN(100_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(12),
      proofRoot: bytes32(112),
      decisionValue: decision("cap"),
      requestedAmountLamports: new anchor.BN(150_000_000),
      approvedAmountLamports: approvedAmount,
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });
    const recipientBefore = await provider.connection.getBalance(
      recipient.publicKey
    );

    await executePayout({
      permit,
      treasury,
      recipient: recipient.publicKey
    });

    const recipientAfter = await provider.connection.getBalance(
      recipient.publicKey
    );

    assert.equal(recipientAfter - recipientBefore, approvedAmount.toNumber());
  });

  it("rejects BLOCK permit execution", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(13),
      proofRoot: bytes32(113),
      decisionValue: decision("block"),
      requestedAmountLamports: new anchor.BN(100_000_000),
      approvedAmountLamports: new anchor.BN(0),
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });

    await assert.rejects(
      () =>
        executePayout({
          permit,
          treasury,
          recipient: recipient.publicKey
        }),
      /PermitDecisionCannotExecute|Only RELEASE and CAP permits can execute/
    );
  });

  it("rejects HOLD permit execution", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(14),
      proofRoot: bytes32(114),
      decisionValue: decision("hold"),
      requestedAmountLamports: new anchor.BN(100_000_000),
      approvedAmountLamports: new anchor.BN(0),
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });

    await assert.rejects(
      () =>
        executePayout({
          permit,
          treasury,
          recipient: recipient.publicKey
        }),
      /PermitDecisionCannotExecute|Only RELEASE and CAP permits can execute/
    );
  });

  it("rejects wrong treasury", async () => {
    const treasury = await fundedAccount();
    const wrongTreasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const approvedAmount = new anchor.BN(100_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(15),
      proofRoot: bytes32(115),
      decisionValue: decision("release"),
      requestedAmountLamports: approvedAmount,
      approvedAmountLamports: approvedAmount,
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });

    await assert.rejects(
      () =>
        executePayout({
          permit,
          treasury: wrongTreasury,
          recipient: recipient.publicKey
        }),
      /TreasuryMismatch|Treasury account does not match permit/
    );
  });

  it("rejects wrong recipient", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const wrongRecipient = await fundedAccount(1_000_000);
    const approvedAmount = new anchor.BN(100_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(16),
      proofRoot: bytes32(116),
      decisionValue: decision("release"),
      requestedAmountLamports: approvedAmount,
      approvedAmountLamports: approvedAmount,
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });

    await assert.rejects(
      () =>
        executePayout({
          permit,
          treasury,
          recipient: wrongRecipient.publicKey
        }),
      /RecipientMismatch|Recipient account does not match permit/
    );
  });

  it("rejects expired permit", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const approvedAmount = new anchor.BN(100_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(17),
      proofRoot: bytes32(117),
      decisionValue: decision("release"),
      requestedAmountLamports: approvedAmount,
      approvedAmountLamports: approvedAmount,
      treasury: treasury.publicKey,
      recipient: recipient.publicKey,
      expiresAt: new anchor.BN(1)
    });

    await assert.rejects(
      () =>
        executePayout({
          permit,
          treasury,
          recipient: recipient.publicKey
        }),
      /PermitExpired|Permit is expired/
    );
  });

  it("rejects duplicate execution replay", async () => {
    const treasury = await fundedAccount();
    const recipient = await fundedAccount(1_000_000);
    const approvedAmount = new anchor.BN(100_000_000);
    const { permit } = await issuePermit({
      intentHash: bytes32(18),
      proofRoot: bytes32(118),
      decisionValue: decision("release"),
      requestedAmountLamports: approvedAmount,
      approvedAmountLamports: approvedAmount,
      treasury: treasury.publicKey,
      recipient: recipient.publicKey
    });

    await executePayout({
      permit,
      treasury,
      recipient: recipient.publicKey
    });

    await assert.rejects(
      () =>
        executePayout({
          permit,
          treasury,
          recipient: recipient.publicKey
        }),
      /PermitAlreadyExecuted|Permit has already been executed/
    );
  });
});
