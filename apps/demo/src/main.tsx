import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet
} from "@solana/wallet-adapter-react";
import { useStandardWalletAdapters } from "@solana/wallet-standard-wallet-adapter-react";
import { Buffer } from "buffer";
import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  flowSteps,
  formatLamports,
  getScenario,
  getScenarioPresentation,
  getScenarioProofs,
  ledgerRows,
  programEvidence,
  scenarios,
  shortHash,
  type ProofCard,
  type ScenarioId
} from "./evidence";
import {
  DEVNET_RPC_URL,
  buildExecutePayoutTransaction,
  buildIssuePermitTransaction,
  buildLiveRunPreview,
  getLiveScenarioCommand,
  getWalletUnavailableMessage,
  liveFlowSteps,
  makeRunId,
  modeOptions,
  type DemoMode,
  type LiveRunPreview
} from "./liveFlow";
import {
  buildEvidencePack,
  verifyCapturedEvidence,
  type VerificationCheck
} from "./verification";
import "./styles.css";

declare global {
  interface Window {
    Buffer?: typeof Buffer;
  }
}

if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

function ExternalLink({
  children,
  href
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a href={href} rel="noreferrer" target="_blank">
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function ScenarioButton({
  id,
  active,
  onSelect
}: {
  id: ScenarioId;
  active: boolean;
  onSelect: (id: ScenarioId) => void;
}) {
  const scenario = getScenario(id);
  const presentation = getScenarioPresentation(scenario);

  return (
    <button
      aria-pressed={active}
      className="scenario-button"
      onClick={() => onSelect(id)}
      type="button"
    >
      <span className={`decision-dot decision-${scenario.decision.toLowerCase()}`} />
      <span>
        <strong>{scenario.decision}</strong>
        <small>{presentation.impactLabel}</small>
        <em>{scenario.label}</em>
      </span>
    </button>
  );
}

function EvidenceRow({
  label,
  value,
  href
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="evidence-row">
      <dt>{label}</dt>
      <dd>
        {href ? <ExternalLink href={href}>{value}</ExternalLink> : value}
      </dd>
    </div>
  );
}

function ProofInspector({ proofs }: { proofs: readonly ProofCard[] }) {
  return (
    <div className="proof-inspector">
      <p className="eyebrow">Proof bundle</p>
      <div className="proof-cards">
        {proofs.map((proof) => (
          <div
            className={`proof-card proof-${proof.status.toLowerCase()}`}
            key={proof.kind}
          >
            <div className="proof-card-header">
              <strong>{proof.label}</strong>
              <span className={`proof-badge proof-badge-${proof.status.toLowerCase()}`}>
                {proof.status}
              </span>
            </div>
            <p>{proof.observation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeSwitch({
  mode,
  onSelect
}: {
  mode: DemoMode;
  onSelect: (mode: DemoMode) => void;
}) {
  return (
    <div className="mode-switch" role="tablist" aria-label="Demo mode">
      {modeOptions.map((option) => (
        <button
          aria-selected={mode === option.id}
          key={option.id}
          onClick={() => onSelect(option.id)}
          role="tab"
          type="button"
        >
          <strong>{option.label}</strong>
          <span>{option.summary}</span>
        </button>
      ))}
    </div>
  );
}

function EvidenceMode({
  selectedId,
  onSelect
}: {
  selectedId: ScenarioId;
  onSelect: (id: ScenarioId) => void;
}) {
  const scenario = getScenario(selectedId);
  const presentation = getScenarioPresentation(scenario);
  const activeStep = useMemo(() => {
    if (scenario.decision === "BLOCK") {
      return 5;
    }

    return 6;
  }, [scenario.decision]);

  const [flowKey, setFlowKey] = useState(0);

  useEffect(() => {
    setFlowKey((k) => k + 1);
  }, [selectedId]);

  return (
    <>
      <section aria-label="ProofMesh Guard flow" className="flow-rail" key={flowKey}>
        {flowSteps.map((step, index) => (
          <div
            className={`flow-step ${index + 1 <= activeStep ? "active" : ""} flow-step-animate`}
            aria-current={index + 1 === activeStep ? "step" : undefined}
            key={step}
            style={{ "--step-index": index } as React.CSSProperties}
          >
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>

      <section className="scenario-grid">
        <nav aria-label="Scenario selection" className="scenario-picker">
          {scenarios.map((item) => (
            <ScenarioButton
              active={item.id === selectedId}
              id={item.id}
              key={item.id}
              onSelect={onSelect}
            />
          ))}
        </nav>

        <section
          className={`scenario-detail scenario-${scenario.decision.toLowerCase()}`}
          aria-live="polite"
        >
          <div className="decision-header">
            <div>
              <p className="eyebrow">{scenario.label}</p>
              <h2>{scenario.decision}</h2>
            </div>
            <span className={`decision-pill decision-${scenario.decision.toLowerCase()}`}>
              {presentation.statusLabel}
            </span>
          </div>

          <p className="summary">{scenario.summary}</p>
          <p className="impact-line">{presentation.impactLabel}</p>

          <ProofInspector proofs={getScenarioProofs(selectedId)} />

          <div className={`amounts amounts-${scenario.decision.toLowerCase()}`}>
            <div>
              <span>Requested</span>
              <strong className={scenario.decision !== "RELEASE" ? "amount-struck" : ""}>
                {formatLamports(scenario.requestedAmountLamports)}
              </strong>
            </div>
            <div className="amount-arrow">
              {scenario.decision === "RELEASE" ? "→" : "↓"}
            </div>
            <div>
              <span>Approved</span>
              <strong className={`amount-approved amount-approved-${scenario.decision.toLowerCase()}`}>
                {formatLamports(scenario.approvedAmountLamports)}
              </strong>
            </div>
          </div>

          <dl className="evidence-list">
            <EvidenceRow
              href={scenario.permitUrl}
              label="Permit PDA"
              value={shortHash(scenario.permitPda)}
            />
            <EvidenceRow
              label="Proof root"
              value={shortHash(scenario.proofRoot)}
            />
            <EvidenceRow
              href={scenario.issueUrl}
              label="Issue transaction"
              value={shortHash(scenario.issueSignature)}
            />
            {scenario.executeUrl ? (
              <EvidenceRow
                href={scenario.executeUrl}
                label="Execute transaction"
                value={shortHash(scenario.executeSignature ?? "")}
              />
            ) : (
              <EvidenceRow label="Execute transaction" value="None by design" />
            )}
          </dl>

          <p className="result-note">{scenario.result}</p>
        </section>
      </section>
    </>
  );
}

function VerificationRow({ check }: { check: VerificationCheck }) {
  return (
    <div className={check.ok ? "verify-row pass" : "verify-row fail"}>
      <span>{check.ok ? "PASS" : "FAIL"}</span>
      <strong>{check.label}</strong>
      <em>{check.detail}</em>
    </div>
  );
}

function EvidencePackPanel({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="evidence-pack-card">
      <div className="pack-heading">
        <strong>{label}</strong>
        <button className="secondary-action" onClick={() => void handleCopy()} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea readOnly value={value} />
    </div>
  );
}

function LedgerVerifyMode() {
  const verification = useMemo(() => verifyCapturedEvidence(), []);
  const evidencePack = useMemo(
    () => buildEvidencePack(verification),
    [verification]
  );

  return (
    <section className="verify-panel">
      <div className="verify-hero">
        <div>
          <p className="eyebrow">Ledger / Verify</p>
          <h2>Permit evidence check</h2>
          <p>
            This ledger recomputes permit PDAs from the captured intent hashes,
            checks amount invariants, and keeps every scenario explorer-verifiable
            on Solana devnet.
          </p>
        </div>
        <div className="verification-summary">
          <span className={verification.ok ? "verification-pill pass" : "verification-pill fail"}>
            {verification.ok ? "All checks pass" : "Check failure"}
          </span>
          <small>Program + 3 scenarios verified</small>
        </div>
      </div>

      <section className="program-proof">
        <div>
          <span>Program id</span>
          <ExternalLink href={programEvidence.explorerUrl}>
            {shortHash(programEvidence.programId)}
          </ExternalLink>
        </div>
        <div>
          <span>Deploy transaction</span>
          <ExternalLink href={programEvidence.deployUrl}>
            {shortHash(programEvidence.deploySignature)}
          </ExternalLink>
        </div>
      </section>

      <section className="scenario-ledger-grid">
        {verification.scenarios.map((result) => (
          <article className="scenario-ledger-card" key={result.scenario.id}>
            <div className="decision-header">
              <div>
                <p className="eyebrow">{result.scenario.label}</p>
                <h3>{result.scenario.decision}</h3>
              </div>
              <span className={result.ok ? "verification-pill pass" : "verification-pill fail"}>
                {result.ok ? "Verified" : "Failed"}
              </span>
            </div>
            <dl className="evidence-list">
              <EvidenceRow
                href={result.scenario.permitUrl}
                label="Permit PDA"
                value={shortHash(result.scenario.permitPda)}
              />
              <EvidenceRow
                label="Expected PDA"
                value={
                  result.expectedPermitPda
                    ? shortHash(result.expectedPermitPda)
                    : "Not derivable"
                }
              />
              <EvidenceRow
                label="Intent hash"
                value={shortHash(result.scenario.intentHash)}
              />
              <EvidenceRow
                label="Proof root"
                value={shortHash(result.scenario.proofRoot)}
              />
              <EvidenceRow
                href={result.scenario.issueUrl}
                label="Issue tx"
                value={shortHash(result.scenario.issueSignature)}
              />
              {result.scenario.executeUrl && result.scenario.executeSignature ? (
                <EvidenceRow
                  href={result.scenario.executeUrl}
                  label="Execute tx"
                  value={shortHash(result.scenario.executeSignature)}
                />
              ) : (
                <EvidenceRow label="Execute tx" value="No execute transaction by design" />
              )}
            </dl>
          </article>
        ))}
      </section>

      <section className="verify-results">
        <div className="section-heading">
          <p className="eyebrow">Deterministic verification</p>
          <h3>Internal consistency checks</h3>
        </div>
        <div className="verify-table" role="table" aria-label="Permit verification checks">
          {verification.checks.map((check) => (
            <VerificationRow check={check} key={check.id} />
          ))}
        </div>
      </section>

      <section className="evidence-pack">
        <div className="section-heading">
          <p className="eyebrow">Evidence Pack</p>
          <h3>Copyable judge summary</h3>
        </div>
        <div className="pack-grid">
          <EvidencePackPanel label="JSON summary" value={evidencePack.json} />
          <EvidencePackPanel
            label="Markdown summary"
            value={evidencePack.markdown}
          />
        </div>
      </section>
    </section>
  );
}

function friendlyError(caught: unknown, fallback: string): string {
  if (!(caught instanceof Error)) return fallback;
  const msg = caught.message.toLowerCase();
  if (msg.includes("user rejected") || msg.includes("user cancelled")) {
    return "Transaction cancelled by user.";
  }
  if (msg.includes("insufficient") || msg.includes("not enough")) {
    return "Insufficient devnet SOL. Request an airdrop and try again.";
  }
  if (msg.includes("blockhash") || msg.includes("expired")) {
    return "Transaction expired. Please try again.";
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused")) {
    return "Cannot reach Solana devnet RPC. Check your connection.";
  }
  if (msg.includes("already in use") || msg.includes("already been processed")) {
    return "Permit already exists on-chain. Switch to a new scenario.";
  }
  return caught.message;
}

function LiveWalletMode({ selectedId }: { selectedId: ScenarioId }) {
  const { connection } = useConnection();
  const {
    connect,
    connected,
    connecting,
    disconnect,
    publicKey,
    select,
    sendTransaction,
    wallet,
    wallets
  } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [plan, setPlan] = useState<LiveRunPreview | null>(null);
  const [issueSignature, setIssueSignature] = useState<string | null>(null);
  const [executeSignature, setExecuteSignature] = useState<string | null>(null);
  const [status, setStatus] = useState("Connect a devnet wallet to start.");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const command = getLiveScenarioCommand(selectedId);
  const requiredSol = selectedId === "block" ? 0.05 : 1.55;
  const insufficientBalance = connected && balance !== null && balance < requiredSol;

  useEffect(() => {
    setPlan(null);
    setIssueSignature(null);
    setExecuteSignature(null);
    setError(null);
  }, [selectedId, publicKey?.toBase58()]);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      setBalanceError(null);
      return;
    }

    let cancelled = false;

    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (!cancelled) {
          setBalance(lamports / 1_000_000_000);
          setBalanceError(null);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setBalance(null);
          setBalanceError(
            caught instanceof Error
              ? caught.message
              : "Unable to read devnet balance."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connection, publicKey]);

  async function handleConnect() {
    try {
      setError(null);
      await connect();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Wallet connection failed.");
    }
  }

  async function handleBuild() {
    if (!publicKey) {
      setError("Connect a wallet before building a permit.");
      return;
    }

    try {
      const nextPlan = await buildLiveRunPreview({
        runId: makeRunId(selectedId),
        scenarioId: selectedId,
        walletPublicKey: publicKey.toBase58()
      });

      setPlan(nextPlan);
      setIssueSignature(null);
      setExecuteSignature(null);
      setError(null);
      setStatus("Permit built locally. Issue transaction is ready for wallet signing.");
    } catch (caught) {
      setError(friendlyError(caught, "Unable to build permit."));
    }
  }

  async function sendAndConfirm(transaction: ReturnType<typeof buildIssuePermitTransaction>) {
    if (!publicKey) {
      throw new Error("Wallet is not connected.");
    }

    const latest = await connection.getLatestBlockhash("confirmed");
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = latest.blockhash;
    const signature = await sendTransaction(transaction, connection);

    await connection.confirmTransaction(
      {
        signature,
        ...latest
      },
      "confirmed"
    );

    return signature;
  }

  async function handleIssue() {
    if (!plan) {
      setError("Build a permit before issuing.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      setStatus("Waiting for wallet signature to issue permit...");
      const signature = await sendAndConfirm(buildIssuePermitTransaction(plan));
      setIssueSignature(signature);
      setStatus(
        plan.shouldExecute
          ? "Permit issued. Execute transaction is ready."
          : "BLOCK permit issued. No execute transaction by design."
      );
    } catch (caught) {
      setError(friendlyError(caught, "Issue transaction failed."));
      setStatus("Issue transaction did not complete.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExecute() {
    if (!plan) {
      setError("Build and issue a permit before execution.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      setStatus("Waiting for wallet signature to execute payout...");
      const signature = await sendAndConfirm(buildExecutePayoutTransaction(plan));
      setExecuteSignature(signature);
      setStatus("Payout execution confirmed on devnet.");
    } catch (caught) {
      setError(friendlyError(caught, "Execute transaction failed."));
      setStatus("Execute transaction did not complete.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="live-panel">
      <div className="live-copy">
        <p className="eyebrow">Devnet only</p>
        <h2>Live Wallet Mode</h2>
        <p>
          Static evidence is already captured. Live Wallet Mode lets a judge run
          a fresh guarded payout with their own devnet wallet.
        </p>
      </div>

      <div className="live-steps">
        {liveFlowSteps.map((step, index) => (
          <span key={step}>
            {index + 1}. {step}
          </span>
        ))}
      </div>

      <div className="wallet-bar">
        <div>
          <strong>
            {publicKey ? shortHash(publicKey.toBase58()) : "No wallet connected"}
          </strong>
          <span>
            {publicKey
              ? balance === null
                ? balanceError ?? "Reading devnet balance..."
                : `${balance.toFixed(3)} SOL on devnet`
              : getWalletUnavailableMessage(wallets.length)}
          </span>
        </div>
        {connected ? (
          <button className="secondary-action" onClick={() => void disconnect()} type="button">
            Disconnect
          </button>
        ) : (
          <button
            className="primary-action"
            disabled={!wallet || connecting}
            onClick={() => void handleConnect()}
            type="button"
          >
            {connecting ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>

      <div className="wallet-list">
        {wallets.length === 0 ? (
          <span>No Solana wallet detected in this browser.</span>
        ) : (
          wallets.map((item) => (
            <button
              aria-pressed={wallet?.adapter.name === item.adapter.name}
              key={item.adapter.name}
              onClick={() => select(item.adapter.name)}
              type="button"
            >
              {item.adapter.name}
            </button>
          ))
        )}
      </div>

      {insufficientBalance ? (
        <p className="warning">
          Connected wallet needs about {requiredSol.toFixed(2)} devnet SOL for
          this scenario. Evidence Mode remains available.
        </p>
      ) : null}

      <div className="live-command">
        <p>{command.label}</p>
        <div className="live-actions">
          <button
            className="secondary-action"
            disabled={!connected || insufficientBalance || isLoading}
            onClick={() => void handleBuild()}
            type="button"
          >
            Build permit
          </button>
          <button
            className="primary-action"
            disabled={!plan || Boolean(issueSignature) || insufficientBalance || isLoading}
            onClick={() => void handleIssue()}
            type="button"
          >
            Issue permit
          </button>
          <button
            className="primary-action"
            disabled={
              !plan ||
              !issueSignature ||
              !plan.shouldExecute ||
              Boolean(executeSignature) ||
              insufficientBalance ||
              isLoading
            }
            onClick={() => void handleExecute()}
            type="button"
          >
            {selectedId === "block" ? "No execute by design" : "Execute payout"}
          </button>
        </div>
      </div>

      <p className={error ? "status error" : isLoading ? "status loading" : "status"}>
        {isLoading && <span className="spinner" aria-hidden="true" />}
        {error ?? status}
      </p>

      {plan ? (
        <dl className="evidence-list live-evidence">
          <EvidenceRow
            href={plan.permitUrl}
            label="Permit PDA"
            value={shortHash(plan.permitPda.toBase58())}
          />
          <EvidenceRow label="Decision" value={plan.decision.decision} />
          <EvidenceRow
            label="Requested"
            value={formatLamports(plan.requestedAmountLamports)}
          />
          <EvidenceRow
            label="Approved"
            value={formatLamports(plan.approvedAmountLamports)}
          />
          {issueSignature ? (
            <EvidenceRow
              href={plan.issueUrl(issueSignature)}
              label="Issue signature"
              value={shortHash(issueSignature)}
            />
          ) : null}
          {executeSignature ? (
            <EvidenceRow
              href={plan.executeUrl(executeSignature)}
              label="Execute signature"
              value={shortHash(executeSignature)}
            />
          ) : plan.shouldExecute ? null : (
            <EvidenceRow
              label="Execute signature"
              value="No execute transaction by design"
            />
          )}
        </dl>
      ) : null}
    </section>
  );
}

function AppContent() {
  const [mode, setMode] = useState<DemoMode>("evidence");
  const [selectedId, setSelectedId] = useState<ScenarioId>("release");

  return (
    <main>
      <section className="workspace">
        <header className="topline">
          <div className="hero-copy">
            <div className="brand-lockup">
              <span className="brand-mark" aria-hidden="true">
                <span />
              </span>
              <p className="eyebrow">Solana devnet primitive</p>
            </div>
            <h1>ProofMesh Guard</h1>
            <p className="tagline">
              Trust permits before Solana agent payments move funds.
            </p>
            <div className="proof-strip" aria-label="Submission proof points">
              <div>
                <span>Permit object</span>
                <strong>TrustPermit PDA</strong>
              </div>
              <div>
                <span>Execution path</span>
                <strong>Guarded SOL payout</strong>
              </div>
              <div>
                <span>Judge evidence</span>
                <strong>All checks pass</strong>
              </div>
            </div>
          </div>
          <div className="program-link">
            <span>Program</span>
            <ExternalLink href={programEvidence.explorerUrl}>
              {shortHash(programEvidence.programId)}
            </ExternalLink>
          </div>
        </header>

        <ModeSwitch mode={mode} onSelect={setMode} />

        {mode === "evidence" ? (
          <EvidenceMode selectedId={selectedId} onSelect={setSelectedId} />
        ) : mode === "ledger" ? (
          <LedgerVerifyMode />
        ) : (
          <>
            <nav aria-label="Live scenario selection" className="scenario-picker compact">
              {scenarios.map((item) => (
                <ScenarioButton
                  active={item.id === selectedId}
                  id={item.id}
                  key={item.id}
                  onSelect={setSelectedId}
                />
              ))}
            </nav>
            <LiveWalletMode selectedId={selectedId} />
          </>
        )}
      </section>

      <section className="ledger">
        <div className="section-heading">
          <p className="eyebrow">Explorer-verifiable ledger</p>
          <h2>Captured devnet evidence</h2>
        </div>
        <div className="ledger-table" role="table" aria-label="Devnet evidence ledger">
          {ledgerRows.map((row) => (
            <a
              className="ledger-row"
              href={row.url}
              key={`${row.scenario}-${row.kind}`}
              rel="noreferrer"
              target="_blank"
            >
              <span>{row.scenario}</span>
              <strong>{row.kind}</strong>
              <em>{row.label}</em>
            </a>
          ))}
        </div>
      </section>

      <section className="builders-section">
        <div className="section-heading">
          <p className="eyebrow">Open-source SDK</p>
          <h2>Built for builders</h2>
          <p className="tagline">
            Integrate the trust permit step before your payout moves funds.
          </p>
        </div>
        <div className="builder-cards">
          <div className="builder-card">
            <strong>Agent Wallet</strong>
            <p>
              An autonomous agent checks a permit before signing a SOL transfer.
              RELEASE executes, CAP limits, BLOCK stops.
            </p>
          </div>
          <div className="builder-card">
            <strong>DAO Treasury</strong>
            <p>
              A treasury bot evaluates a proposal payout against policy. The
              permit PDA anchors the decision before funds leave.
            </p>
          </div>
          <div className="builder-card">
            <strong>Payment Bot</strong>
            <p>
              A batch payment runner verifies each payout intent. Only permitted
              transfers execute; risky payouts are blocked with evidence.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function App() {
  const wallets = useStandardWalletAdapters([]);

  return (
    <ConnectionProvider endpoint={DEVNET_RPC_URL}>
      <WalletProvider autoConnect={false} wallets={wallets}>
        <AppContent />
      </WalletProvider>
    </ConnectionProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
