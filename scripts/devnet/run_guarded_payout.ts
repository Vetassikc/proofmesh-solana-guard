import * as anchor from "@coral-xyz/anchor";
import {
  DEFAULT_GUARD_POLICY,
  buildProofBundle,
  evaluatePayoutIntent,
  guardScenarios,
  type GuardDecision,
  type PayoutIntent
} from "@proofmesh/guard-sdk";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const { Connection, Keypair, PublicKey, SystemProgram } = anchor.web3;

export type ScenarioName = "release" | "cap" | "block";

export interface CliArgs {
  scenario: ScenarioName;
  dryRun: boolean;
  runId?: string;
}

export interface RuntimeConfig {
  providerUrl: string;
  walletPath: string;
  programId: anchor.web3.PublicKey;
}

export interface GuardedPayoutPlan {
  scenario: ScenarioName;
  programId: anchor.web3.PublicKey;
  permitPda: anchor.web3.PublicKey;
  treasury: anchor.web3.PublicKey;
  recipient: anchor.web3.PublicKey;
  intent: PayoutIntent;
  intentHash: string;
  proofRoot: string;
  decision: GuardDecision;
  requestedAmountLamports: string;
  approvedAmountLamports: string;
  shouldExecute: boolean;
  expiresAtUnix: number;
}

export interface DevnetEvidence {
  scenario: ScenarioName;
  programId: string;
  permitPda: string;
  issueSignature: string | null;
  executeSignature: string | null;
  explorerUrls: {
    permit: string;
    issue: string | null;
    execute: string | null;
  };
  decision: GuardDecision["decision"];
  requestedAmountLamports: string;
  approvedAmountLamports: string;
  dryRun: boolean;
  intentHash: string;
  proofRoot: string;
  treasury: string;
  recipient: string;
}

function assertScenario(value: string | undefined): asserts value is ScenarioName {
  if (value !== "release" && value !== "cap" && value !== "block") {
    throw new Error("Scenario must be one of: release, cap, block");
  }
}

export function parseCliArgs(argv: readonly string[]): CliArgs {
  let scenario: string | undefined;
  let dryRun = false;
  let runId: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--scenario" || arg === "-s") {
      scenario = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg?.startsWith("--scenario=")) {
      scenario = arg.slice("--scenario=".length);
      continue;
    }

    if (arg === "--run-id") {
      runId = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg?.startsWith("--run-id=")) {
      runId = arg.slice("--run-id=".length);
      continue;
    }

    if (!arg?.startsWith("-") && !scenario) {
      scenario = arg;
      continue;
    }

    throw new Error(`Unsupported argument: ${arg}`);
  }

  assertScenario(scenario);

  const parsed: CliArgs = {
    dryRun,
    scenario
  };

  if (runId) {
    parsed.runId = runId;
  }

  return parsed;
}

export function validateRuntimeConfig(
  env: NodeJS.ProcessEnv,
  walletExists: (walletPath: string) => boolean = existsSync
): RuntimeConfig {
  const programIdValue = env.PROOFMESH_GUARD_PROGRAM_ID;
  const walletPath = env.ANCHOR_WALLET;

  if (!programIdValue || programIdValue === "<program-id-after-deploy>") {
    throw new Error("PROOFMESH_GUARD_PROGRAM_ID is required after deployment");
  }

  if (!walletPath) {
    throw new Error("ANCHOR_WALLET is required and must point to a devnet keypair file");
  }

  if (!walletExists(walletPath)) {
    throw new Error(`ANCHOR_WALLET points to a missing file: ${walletPath}`);
  }

  return {
    programId: new PublicKey(programIdValue),
    providerUrl: env.ANCHOR_PROVIDER_URL ?? "https://api.devnet.solana.com",
    walletPath
  };
}

export async function buildGuardedPayoutPlan(args: {
  scenario: ScenarioName;
  programId: anchor.web3.PublicKey;
  treasury: anchor.web3.PublicKey;
  runId?: string;
}): Promise<GuardedPayoutPlan> {
  const scenario = guardScenarios[args.scenario];
  const recipient = await PublicKey.createWithSeed(
    args.treasury,
    `pmg-${args.scenario}`,
    SystemProgram.programId
  );
  const runId = args.runId ?? `${args.scenario}-${Date.now()}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const intent: PayoutIntent = {
    ...scenario.intent,
    treasury: args.treasury.toBase58(),
    recipient: recipient.toBase58(),
    nonce: `${scenario.intent.nonce}-${runId}`,
    expiresAt
  };
  const bundle = buildProofBundle(intent, scenario.proofs, scenario.generatedAt);
  const decision = evaluatePayoutIntent(intent, bundle, DEFAULT_GUARD_POLICY);
  const intentHashBytes = hexToBytes32(bundle.intentHash);
  const [permitPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("permit"), Buffer.from(intentHashBytes)],
    args.programId
  );

  return {
    approvedAmountLamports: decision.approvedAmountLamports,
    decision,
    expiresAtUnix: Math.floor(Date.parse(intent.expiresAt) / 1000),
    intent,
    intentHash: bundle.intentHash,
    permitPda,
    programId: args.programId,
    proofRoot: bundle.proofRoot,
    recipient,
    requestedAmountLamports: intent.requestedAmountLamports,
    scenario: args.scenario,
    shouldExecute: decision.decision === "RELEASE" || decision.decision === "CAP",
    treasury: args.treasury
  };
}

export function buildEvidence(args: {
  plan: GuardedPayoutPlan;
  issueSignature: string | null;
  executeSignature: string | null;
  dryRun: boolean;
}): DevnetEvidence {
  return {
    approvedAmountLamports: args.plan.approvedAmountLamports,
    decision: args.plan.decision.decision,
    dryRun: args.dryRun,
    executeSignature: args.executeSignature,
    explorerUrls: {
      execute: explorerTxUrl(args.executeSignature),
      issue: explorerTxUrl(args.issueSignature),
      permit: explorerAddressUrl(args.plan.permitPda)
    },
    intentHash: args.plan.intentHash,
    issueSignature: args.issueSignature,
    permitPda: args.plan.permitPda.toBase58(),
    programId: args.plan.programId.toBase58(),
    proofRoot: args.plan.proofRoot,
    recipient: args.plan.recipient.toBase58(),
    requestedAmountLamports: args.plan.requestedAmountLamports,
    scenario: args.plan.scenario,
    treasury: args.plan.treasury.toBase58()
  };
}

function hexToBytes32(hex: string): number[] {
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("Expected a 32-byte hex string");
  }

  return Array.from(Buffer.from(hex, "hex"));
}

function decisionForAnchor(decision: GuardDecision["decision"]) {
  const name = decision.toLowerCase();

  if (name !== "release" && name !== "cap" && name !== "block") {
    throw new Error(`Unsupported on-chain decision for devnet script: ${decision}`);
  }

  return { [name]: {} };
}

function explorerAddressUrl(address: anchor.web3.PublicKey): string {
  return `https://explorer.solana.com/address/${address.toBase58()}?cluster=devnet`;
}

function explorerTxUrl(signature: string | null): string | null {
  return signature
    ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    : null;
}

function loadWallet(walletPath: string): anchor.web3.Keypair {
  const rawKeypair = JSON.parse(readFileSync(walletPath, "utf8")) as number[];

  return Keypair.fromSecretKey(Uint8Array.from(rawKeypair));
}

function loadProgramIdl(): anchor.Idl {
  const idlPath = path.resolve("target/idl/proofmesh_guard.json");

  if (!existsSync(idlPath)) {
    throw new Error("Missing target/idl/proofmesh_guard.json. Run anchor build first.");
  }

  return JSON.parse(readFileSync(idlPath, "utf8")) as anchor.Idl;
}

async function issuePermit(
  program: anchor.Program,
  issuer: anchor.web3.PublicKey,
  plan: GuardedPayoutPlan
): Promise<string> {
  return (program.methods as any)
    .issuePermit({
      approvedAmountLamports: new anchor.BN(plan.approvedAmountLamports),
      decision: decisionForAnchor(plan.decision.decision),
      expiresAt: new anchor.BN(plan.expiresAtUnix),
      intentHash: hexToBytes32(plan.intentHash),
      proofRoot: hexToBytes32(plan.proofRoot),
      recipient: plan.recipient,
      requestedAmountLamports: new anchor.BN(plan.requestedAmountLamports),
      treasury: plan.treasury
    })
    .accounts({
      issuer,
      permit: plan.permitPda,
      systemProgram: SystemProgram.programId
    })
    .rpc();
}

async function executePayout(
  program: anchor.Program,
  treasury: anchor.web3.PublicKey,
  plan: GuardedPayoutPlan
): Promise<string> {
  return (program.methods as any)
    .executePayout()
    .accounts({
      permit: plan.permitPda,
      recipient: plan.recipient,
      systemProgram: SystemProgram.programId,
      treasury
    })
    .rpc();
}

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  const cli = parseCliArgs(argv);
  const runtime = validateRuntimeConfig(process.env);
  const walletKeypair = loadWallet(runtime.walletPath);
  const wallet = new anchor.Wallet(walletKeypair);
  const planArgs: {
    programId: anchor.web3.PublicKey;
    runId?: string;
    scenario: ScenarioName;
    treasury: anchor.web3.PublicKey;
  } = {
    programId: runtime.programId,
    scenario: cli.scenario,
    treasury: wallet.publicKey
  };

  if (cli.runId) {
    planArgs.runId = cli.runId;
  }

  const plan = await buildGuardedPayoutPlan(planArgs);

  if (cli.dryRun) {
    console.log(
      JSON.stringify(
        buildEvidence({
          dryRun: true,
          executeSignature: null,
          issueSignature: null,
          plan
        }),
        null,
        2
      )
    );
    return;
  }

  const connection = new Connection(runtime.providerUrl, "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed"
  });
  const idl = {
    ...loadProgramIdl(),
    address: runtime.programId.toBase58()
  } as anchor.Idl;
  const program = new anchor.Program(idl, provider);
  const issueSignature = await issuePermit(program, wallet.publicKey, plan);
  const executeSignature = plan.shouldExecute
    ? await executePayout(program, wallet.publicKey, plan)
    : null;

  console.log(
    JSON.stringify(
      buildEvidence({
        dryRun: false,
        executeSignature,
        issueSignature,
        plan
      }),
      null,
      2
    )
  );
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error(message);
    process.exitCode = 1;
  });
}
