import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { db } from '../db/db';
import type { AuditRun, CheckKey, CheckResult, CheckStatus, TargetProfile } from '../db/schema';
import { nowIso, sha256HexFromFile } from '../lib/crypto';
import { ADDITIONAL_CHECK_ORDER, getCheckDef } from '../lib/checklists';
import { id } from '../lib/id';
import { DeepLinkBox } from '../components/DeepLinkBox';

function isCheckKey(v: string | undefined): v is CheckKey {
  return (
    v === 'profilePhoto' ||
    v === 'about' ||
    v === 'lastSeenOnline' ||
    v === 'status' ||
    v === 'groups' ||
    v === 'silenceUnknownCallers' ||
    v === 'twoStepVerification' ||
    v === 'twoStepRecoveryEmail' ||
    v === 'whatsappDeepLink' ||
    v === 'linkedDevices' ||
    v === 'backupEncryption'
  );
}

export function AdditionalSettingsRoute() {
  const nav = useNavigate();
  const { runId, checkKey: rawKey } = useParams();
  const [sp] = useSearchParams();

  const [run, setRun] = React.useState<AuditRun | null>(null);
  const [profile, setProfile] = React.useState<TargetProfile | null>(null);
  const [existing, setExisting] = React.useState<CheckResult | null>(null);

  const [notes, setNotes] = React.useState('');
  const [evidenceHash, setEvidenceHash] = React.useState<string | null>(null);
  const [evidenceMeta, setEvidenceMeta] = React.useState<{ filename?: string; sizeBytes?: number } | null>(null);
  const [busy, setBusy] = React.useState(false);

  const checkKey = isCheckKey(rawKey) ? rawKey : ADDITIONAL_CHECK_ORDER[0];
  const returnTo = sp.get('return');

  React.useEffect(() => {
    void (async () => {
      if (!runId || !checkKey) return;
      const r = await db.auditRuns.get(runId);
      if (!r) return;
      setRun(r);
      const p = await db.profiles.get(r.profileId);
      setProfile(p ?? null);

      const prior = await db.checkResults
        .where('runId')
        .equals(runId)
        .and((x) => x.key === checkKey)
        .first();

      setExisting(prior ?? null);
      setNotes(prior?.notes ?? '');
      setEvidenceHash(prior?.evidence?.sha256 ?? null);
      setEvidenceMeta(prior?.evidence ? { filename: prior.evidence.filename, sizeBytes: prior.evidence.sizeBytes } : null);
    })();
  }, [runId, checkKey]);

  // If user hits /audit/:runId/additional without a checkKey, normalize URL.
  React.useEffect(() => {
    if (!runId) return;
    if (rawKey) return;
    nav(`/audit/${runId}/additional/${checkKey}`, { replace: true });
  }, [runId, rawKey, checkKey, nav]);

  if (!runId) return <div className="card">Run not found.</div>;

  if (!run || !profile) {
    return <div className="card">Loading…</div>;
  }

  const runIdSafe = runId;
  const profileSafe = profile;
  const checkKeySafe = checkKey;

  const def = getCheckDef(checkKeySafe);
  const idx = ADDITIONAL_CHECK_ORDER.indexOf(checkKeySafe);
  const step = `${idx + 1} / ${ADDITIONAL_CHECK_ORDER.length}`;

  async function onEvidenceFile(file: File | null) {
    if (!file) {
      setEvidenceHash(null);
      setEvidenceMeta(null);
      return;
    }
    const h = await sha256HexFromFile(file);
    setEvidenceHash(h);
    setEvidenceMeta({ filename: file.name, sizeBytes: file.size });
  }

  async function save(status: CheckStatus) {
    setBusy(true);
    try {
      const now = nowIso();
      const base: CheckResult = {
        id: existing?.id ?? id(),
        runId: runIdSafe,
        profileId: profileSafe.id,
        key: checkKeySafe,
        category: def.category,
        weight: def.weight,
        status,
        notes: notes.trim() || undefined,
        evidence: evidenceHash
          ? {
              sha256: evidenceHash,
              timestamp: now,
              notes: notes.trim() || undefined,
              filename: evidenceMeta?.filename,
              sizeBytes: evidenceMeta?.sizeBytes,
              ocrStub: { status: 'not_run', hint: 'Future: on-device OCR stub' }
            }
          : undefined,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      };

      await db.checkResults.put(base);

      if (status === 'fail') {
        const ret = returnTo ?? `/audit/${runIdSafe}/additional/${checkKeySafe}`;
        nav(`/audit/${runIdSafe}/fix?focus=${encodeURIComponent(checkKeySafe)}&return=${encodeURIComponent(ret)}`);
        return;
      }

      const nextKey = ADDITIONAL_CHECK_ORDER[idx + 1];
      if (nextKey) {
        nav(`/audit/${runIdSafe}/additional/${nextKey}`);
        return;
      }

      nav(`/report/${runIdSafe}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="pill">Full audit</div>
        <div className="pill">{step}</div>
      </div>

      <h1 className="h1">{def.title}</h1>
      <div className="muted">{def.description}</div>
      <div className="small muted">Target: {profile.name} ({profile.os}, {profile.variant})</div>

      <div className="hr" />

      {checkKeySafe === 'whatsappDeepLink' ? (
        <>
          <DeepLinkBox />
          <div className="hr" />
        </>
      ) : null}

      <div className="stack">
        <Button onClick={() => void save('pass')} fullWidth disabled={busy}>
          Set correctly
        </Button>
        <Button onClick={() => void save('fail')} variant="danger" fullWidth disabled={busy}>
          Needs fixing
        </Button>
        <Button onClick={() => void save('unknown')} variant="secondary" fullWidth disabled={busy}>
          Not sure
        </Button>
      </div>

      <div className="hr" />

      <Field label="Notes (optional)">
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </Field>

      <Field label="Evidence (optional)" hint="Upload a screenshot to hash it locally (no image is saved).">
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => void onEvidenceFile(e.target.files?.[0] ?? null)}
        />
        {evidenceHash ? (
          <div className="small muted" style={{ wordBreak: 'break-all' }}>
            SHA-256: {evidenceHash}
          </div>
        ) : (
          <div className="small muted">No evidence attached.</div>
        )}
      </Field>

      {existing ? <div className="small muted">Previously recorded: {existing.status.toUpperCase()}</div> : null}
    </div>
  );
}
