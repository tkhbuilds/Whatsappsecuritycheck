import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { db } from '../db/db';
import type { AuditRun, VerificationMode } from '../db/schema';
import { STRANGER_CHECK_ORDER } from '../lib/checklists';

export function AuditModeRoute() {
  const nav = useNavigate();
  const { runId } = useParams();

  const [run, setRun] = React.useState<AuditRun | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      if (!runId) return;
      const r = await db.auditRuns.get(runId);
      setRun(r ?? null);
      setLoading(false);
    })();
  }, [runId]);

  async function choose(mode: VerificationMode) {
    if (!runId || !run) return;
    const updated: AuditRun = { ...run, mode };
    await db.auditRuns.put(updated);
    nav(`/audit/${runId}/stranger/${STRANGER_CHECK_ORDER[0]}`);
  }

  if (loading) return <div className="card">Loading…</div>;
  if (!runId || !run) return <div className="card">Run not found.</div>;

  return (
    <div className="card stack">
      <h1 className="h1">Verification mode</h1>
      <div className="muted">Pick how you’ll verify what a stranger can see.</div>
      <div className="hr" />

      <Button onClick={() => void choose('StrangerCheck')} fullWidth>
        Stranger Check (recommended)
      </Button>

      <Button onClick={() => void choose('ScreenshotVerify')} variant="secondary" fullWidth>
        Screenshot Verify
      </Button>

      <Button onClick={() => void choose('Attestation')} variant="secondary" fullWidth>
        Attestation (I checked)
      </Button>

      <div className="small muted">
        Non-goals: no chat access, no WhatsApp API usage, no account login automation, no background monitoring.
      </div>
    </div>
  );
}
