import React from 'react';
import { useNavigate } from 'react-router-dom';

import { db } from '../db/db';
import type { AuditRun, TargetProfile } from '../db/schema';
import { Button } from '../components/Button';
import { ButtonLink } from '../components/ButtonLink';
import { Field } from '../components/Field';
import { getActiveProfileId, setActiveProfileId } from '../lib/appState';
import { id } from '../lib/id';
import { formatDateTime } from '../lib/format';
import { downloadBlob, uint8ToArrayBuffer } from '../lib/download';
import { buildReportJson, buildReportPdf } from './reporting';

export function HomeRoute() {
  const nav = useNavigate();
  const [profiles, setProfiles] = React.useState<TargetProfile[]>([]);
  const [activeProfileId, setActiveId] = React.useState<string | null>(getActiveProfileId());
  const [lastRun, setLastRun] = React.useState<AuditRun | null>(null);

  React.useEffect(() => {
    void (async () => {
      const all = await db.profiles.orderBy('createdAt').toArray();
      setProfiles(all);

      let active = getActiveProfileId();
      if (!active && all[0]) {
        active = all[0].id;
        setActiveProfileId(active);
      }
      setActiveId(active);
    })();
  }, []);

  React.useEffect(() => {
    void (async () => {
      if (!activeProfileId) {
        setLastRun(null);
        return;
      }
      const runs = await db.auditRuns.where('profileId').equals(activeProfileId).sortBy('startedAt');
      const latest = [...runs].reverse()[0] ?? null;
      setLastRun(latest);
    })();
  }, [activeProfileId]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  async function startAudit(type: 'Quick' | 'Full') {
    if (!activeProfile) return;
    const run: AuditRun = {
      id: id(),
      profileId: activeProfile.id,
      type,
      startedAt: new Date().toISOString()
    };
    await db.auditRuns.put(run);
    nav(`/audit/${run.id}/mode`);
  }

  async function exportLastJson() {
    if (!lastRun) return;
    const data = await buildReportJson(lastRun.id);
    downloadBlob(
      `family-privacy-copilot_${lastRun.id}.json`,
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );
  }

  async function exportLastPdf() {
    if (!lastRun) return;
    const pdfBytes = await buildReportPdf(lastRun.id);
    downloadBlob(
      `family-privacy-copilot_${lastRun.id}.pdf`,
      new Blob([uint8ToArrayBuffer(pdfBytes)], { type: 'application/pdf' })
    );
  }

  return (
    <div className="stack">
      <div className="card stack">
        <h1 className="h1">Home</h1>
        <div className="muted">Choose a Target Profile, then run an audit.</div>
        <div className="hr" />

        {profiles.length === 0 ? (
          <div className="stack">
            <div className="muted">No profiles yet.</div>
            <ButtonLink to="/profiles/new" fullWidth>
              Create Target Profile
            </ButtonLink>
          </div>
        ) : (
          <div className="stack">
            <Field label="Target Profile">
              <select
                className="input select"
                value={activeProfileId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setActiveId(v);
                  setActiveProfileId(v);
                }}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.os} — {p.variant}
                  </option>
                ))}
              </select>
            </Field>

            <div className="row">
              <ButtonLink to="/profiles/new" variant="secondary">
                New profile
              </ButtonLink>
            </div>

            <div className="hr" />

            <div className="stack">
              <Button onClick={() => void startAudit('Quick')} fullWidth>
                Quick audit
              </Button>
              <Button onClick={() => void startAudit('Full')} variant="secondary" fullWidth>
                Full audit
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="card stack">
        <h2 className="h1">Last report</h2>
        {!activeProfile ? (
          <div className="muted">Select or create a profile to see reports.</div>
        ) : !lastRun ? (
          <div className="muted">No audits yet for {activeProfile.name}.</div>
        ) : (
          <div className="stack">
            <div className="row">
              <span className="pill">Type: {lastRun.type}</span>
              <span className="pill">Started: {formatDateTime(lastRun.startedAt)}</span>
              <span className="pill">Score: {lastRun.score ?? '—'}</span>
            </div>
            <div className="row">
              <ButtonLink to={`/report/${lastRun.id}`} variant="secondary">
                View report
              </ButtonLink>
              <Button onClick={() => void exportLastJson()} variant="ghost">
                Export JSON
              </Button>
              <Button onClick={() => void exportLastPdf()} variant="ghost">
                Export PDF
              </Button>
            </div>
            <div className="small muted">
              Tip: For “Stranger Check”, use a second phone with a number not in the target’s contacts.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
