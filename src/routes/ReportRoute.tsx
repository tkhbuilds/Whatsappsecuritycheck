import React from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { db } from '../db/db';
import type { AuditRun, CheckResult, TargetProfile } from '../db/schema';
import { CHECKS, getCheckDef } from '../lib/checklists';
import { computeScore, topFixes } from '../lib/scoring';
import { formatDateTime } from '../lib/format';
import { downloadBlob, uint8ToArrayBuffer } from '../lib/download';
import { buildReportJson, buildReportPdf } from './reporting';

export function ReportRoute() {
  const { runId } = useParams();
  const [run, setRun] = React.useState<AuditRun | null>(null);
  const [profile, setProfile] = React.useState<TargetProfile | null>(null);
  const [results, setResults] = React.useState<CheckResult[]>([]);

  React.useEffect(() => {
    void (async () => {
      if (!runId) return;
      const r = await db.auditRuns.get(runId);
      setRun(r ?? null);
      if (!r) return;
      const p = await db.profiles.get(r.profileId);
      setProfile(p ?? null);
      const rs = await db.checkResults.where('runId').equals(runId).toArray();
      setResults(rs);

      const computed = computeScore(rs);
      if (r.score !== computed || !r.completedAt) {
        await db.auditRuns.put({ ...r, score: computed, completedAt: r.completedAt ?? new Date().toISOString() });
        setRun({ ...r, score: computed, completedAt: r.completedAt ?? new Date().toISOString() });
      }
    })();
  }, [runId]);

  if (!runId) return <div className="card">Run not found.</div>;
  if (!run || !profile) return <div className="card">Loading…</div>;

  const score = run.score ?? computeScore(results);

  const relevantChecks = CHECKS.filter((c) => (run.type === 'Quick' ? c.category === 'critical' : true));
  const byKey = new Map(results.map((r) => [r.key, r]));

  const strangerVisible = relevantChecks
    .filter((c) => c.category === 'critical')
    .map((c) => ({ def: c, res: byKey.get(c.key) }))
    .filter((x) => x.res?.status === 'fail');

  const fixes = topFixes(results, 3);

  async function exportJson() {
    if (!runId) return;
    const data = await buildReportJson(runId);
    downloadBlob(
      `family-privacy-copilot_${runId}.json`,
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );
  }

  async function exportPdf() {
    if (!runId) return;
    const pdfBytes = await buildReportPdf(runId);
    downloadBlob(`family-privacy-copilot_${runId}.pdf`, new Blob([uint8ToArrayBuffer(pdfBytes)], { type: 'application/pdf' }));
  }

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="h1">Report</h1>
          <span className="pill">Score: {score}/100</span>
        </div>

        <div className="row">
          <span className="pill">Target: {profile.name}</span>
          <span className="pill">OS: {profile.os}</span>
          <span className="pill">Variant: {profile.variant}</span>
          <span className="pill">Type: {run.type}</span>
        </div>

        <div className="small muted">Started: {formatDateTime(run.startedAt)} • Completed: {formatDateTime(run.completedAt)}</div>

        <div className="hr" />

        <h2 className="h1">What a stranger can see right now</h2>
        {strangerVisible.length === 0 ? (
          <div className="badge badge--pass">No stranger-visible items recorded as FAIL.</div>
        ) : (
          <div className="stack">
            {strangerVisible.map(({ def }) => (
              <div key={def.key} className="badge badge--fail">
                {def.title} is visible to a stranger
              </div>
            ))}
          </div>
        )}

        <div className="hr" />

        <h2 className="h1">Top 3 fixes</h2>
        {fixes.length === 0 ? (
          <div className="muted">Nothing to fix (based on recorded results).</div>
        ) : (
          <div className="stack">
            {fixes.map((r) => (
              <div key={r.id} className="badge badge--unknown">
                {getCheckDef(r.key).title} (−{r.weight})
              </div>
            ))}
          </div>
        )}

        <div className="hr" />

        <div className="row">
          <Button onClick={() => void exportJson()} variant="ghost">
            Export JSON
          </Button>
          <Button onClick={() => void exportPdf()} variant="ghost">
            Export PDF
          </Button>
        </div>
      </div>

      <div className="card stack">
        <h2 className="h1">Full checklist</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {relevantChecks.map((c) => {
              const r = byKey.get(c.key);
              const status = r?.status ?? 'unknown';
              const cls =
                status === 'pass' ? 'badge badge--pass' : status === 'fail' ? 'badge badge--fail' : 'badge badge--unknown';
              return (
                <tr key={c.key}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{c.title}</div>
                    <div className="small muted">{c.description}</div>
                  </td>
                  <td>
                    <span className={cls}>{status.toUpperCase()}</span>
                  </td>
                  <td className="small muted">{c.weight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
