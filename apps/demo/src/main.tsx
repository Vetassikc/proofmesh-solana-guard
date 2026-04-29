import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  flowSteps,
  formatLamports,
  getScenario,
  ledgerRows,
  programEvidence,
  scenarios,
  shortHash,
  type ScenarioId
} from "./evidence";
import "./styles.css";

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
        <small>{scenario.label}</small>
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

function App() {
  const [selectedId, setSelectedId] = useState<ScenarioId>("release");
  const scenario = getScenario(selectedId);
  const activeStep = useMemo(() => {
    if (scenario.decision === "BLOCK") {
      return 5;
    }

    return 6;
  }, [scenario.decision]);

  return (
    <main>
      <section className="workspace">
        <header className="topline">
          <div>
            <p className="eyebrow">Solana devnet primitive</p>
            <h1>ProofMesh Guard</h1>
            <p className="tagline">
              Trust permits before Solana agent payments move funds.
            </p>
          </div>
          <ExternalLink href={programEvidence.explorerUrl}>
            Program {shortHash(programEvidence.programId)}
          </ExternalLink>
        </header>

        <section aria-label="ProofMesh Guard flow" className="flow-rail">
          {flowSteps.map((step, index) => (
            <div
              className={index + 1 <= activeStep ? "flow-step active" : "flow-step"}
              key={step}
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
                onSelect={setSelectedId}
              />
            ))}
          </nav>

          <section className="scenario-detail" aria-live="polite">
            <div className="decision-header">
              <div>
                <p className="eyebrow">{scenario.label}</p>
                <h2>{scenario.decision}</h2>
              </div>
              <span className={`decision-pill decision-${scenario.decision.toLowerCase()}`}>
                {scenario.decision === "BLOCK" ? "No payout" : "Executed"}
              </span>
            </div>

            <p className="summary">{scenario.summary}</p>

            <div className="amounts">
              <div>
                <span>Requested</span>
                <strong>{formatLamports(scenario.requestedAmountLamports)}</strong>
              </div>
              <div>
                <span>Approved</span>
                <strong>{formatLamports(scenario.approvedAmountLamports)}</strong>
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
                <EvidenceRow
                  label="Execute transaction"
                  value="None by design"
                />
              )}
            </dl>

            <p className="result-note">{scenario.result}</p>
          </section>
        </section>
      </section>

      <section className="ledger">
        <div className="section-heading">
          <p className="eyebrow">Explorer-verifiable ledger</p>
          <h2>Captured devnet evidence</h2>
        </div>
        <div className="ledger-table" role="table" aria-label="Devnet evidence ledger">
          {ledgerRows.map((row) => (
            <a className="ledger-row" href={row.url} key={`${row.scenario}-${row.kind}`} rel="noreferrer" target="_blank">
              <span>{row.scenario}</span>
              <strong>{row.kind}</strong>
              <em>{row.label}</em>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
