import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { db } from '../db/db';
import type { AuditRun, CheckKey, TargetProfile } from '../db/schema';
import { getCheckDef } from '../lib/checklists';
import { getFixStep, pathForOS } from '../lib/fixSteps';

function isCheckKey(v: string | null): v is CheckKey {
  return (
    v === 'profilePhoto' ||
    v === 'about' ||
    v === 'lastSeenOnline' ||
    v === 'status' ||
    v === 'groups' ||
    v === 'silenceUnknownCallers' ||
    v === 'twoStepVerification' ||
    v === 'linkedDevices' ||
    v === 'backupEncryption'
  );
}

export function FixStepsRoute() {
  const nav = useNavigate();
  const { runId } = useParams();
  const [sp] = useSearchParams();

  const focusRaw = sp.get('focus');
  const returnTo = sp.get('return') ?? '/';

  const [run, setRun] = React.useState<AuditRun | null>(null);
  const [profile, setProfile] = React.useState<TargetProfile | null>(null);

  const focus = isCheckKey(focusRaw) ? focusRaw : null;

  React.useEffect(() => {
    void (async () => {
      if (!runId) return;
      const r = await db.auditRuns.get(runId);
      setRun(r ?? null);
      if (r) {
        const p = await db.profiles.get(r.profileId);
        setProfile(p ?? null);
      }
    })();
  }, [runId]);

  if (!runId || !run || !profile || !focus) {
    return <div className="card">Loading…</div>;
  }

  const def = getCheckDef(focus);
  const step = getFixStep(focus, profile.variant);

  return (
    <div className="card stack">
      <div className="pill">Fix steps</div>
      <h1 className="h1">Fix: {def.title}</h1>

      <div className="stack">
        <div className="kv">
          <div className="kv__k">Desired value</div>
          <div className="kv__v">{step.desired}</div>
        </div>
        <div className="kv">
          <div className="kv__k">Tap path ({profile.os})</div>
          <div className="kv__v">{pathForOS(profile.os, step)}</div>
        </div>
        {step.notes?.length ? (
          <div className="kv">
            <div className="kv__k">Notes</div>
            <div className="kv__v">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {step.notes.map((n) => (
                  <li key={n} className="small muted">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hr" />

      <div className="small muted">
        After changing this setting, re-check from the stranger device and update the result.
      </div>

      <Button onClick={() => nav(returnTo)} fullWidth>
        Back to audit
      </Button>
      <Button onClick={() => nav(`/report/${runId}`)} variant="secondary" fullWidth>
        View report
      </Button>
    </div>
  );
}
