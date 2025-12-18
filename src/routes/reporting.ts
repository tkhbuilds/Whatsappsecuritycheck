import { jsPDF } from 'jspdf';

import { db } from '../db/db';
import type { AuditRun, CheckResult, TargetProfile } from '../db/schema';
import { CHECKS, getCheckDef } from '../lib/checklists';
import { computeScore, topFixes } from '../lib/scoring';

export async function buildReportJson(runId: string): Promise<{
  generatedAt: string;
  profile: TargetProfile;
  run: AuditRun;
  results: CheckResult[];
}> {
  const run = await db.auditRuns.get(runId);
  if (!run) throw new Error('Run not found');
  const profile = await db.profiles.get(run.profileId);
  if (!profile) throw new Error('Profile not found');
  const results = await db.checkResults.where('runId').equals(runId).toArray();

  return {
    generatedAt: new Date().toISOString(),
    profile,
    run: { ...run, score: run.score ?? computeScore(results) },
    results
  };
}

export async function buildReportPdf(runId: string): Promise<Uint8Array> {
  const data = await buildReportJson(runId);
  const { profile, run, results } = data;

  const score = run.score ?? computeScore(results);
  const byKey = new Map(results.map((r) => [r.key, r]));

  const relevantChecks = CHECKS.filter((c) => (run.type === 'Quick' ? c.category === 'critical' : true));

  const strangerVisible = relevantChecks
    .filter((c) => c.category === 'critical')
    .filter((c) => byKey.get(c.key)?.status === 'fail');

  const fixes = topFixes(results, 3);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 46;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Family Privacy Copilot', 40, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Module: WhatsApp Privacy (Stranger View)', 40, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.text(`Score: ${score}/100`, 40, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.text(`Target: ${profile.name} (${profile.os}, ${profile.variant})`, 40, y);
  y += 14;
  doc.text(`Audit: ${run.type} • Mode: ${run.mode ?? '—'}`, 40, y);
  y += 14;
  doc.text(`Run ID: ${run.id}`, 40, y);
  y += 18;

  doc.setDrawColor(200);
  doc.line(40, y, 555, y);
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.text('What a stranger can see right now', 40, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  if (strangerVisible.length === 0) {
    doc.text('- No stranger-visible items recorded as FAIL.', 52, y);
    y += 14;
  } else {
    for (const c of strangerVisible) {
      doc.text(`- ${c.title}`, 52, y);
      y += 14;
    }
  }

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Top 3 fixes', 40, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  if (fixes.length === 0) {
    doc.text('- Nothing to fix (based on recorded results).', 52, y);
    y += 14;
  } else {
    for (const f of fixes) {
      doc.text(`- ${getCheckDef(f.key).title} (−${f.weight})`, 52, y);
      y += 14;
    }
  }

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Checklist', 40, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const col1 = 40;
  const col2 = 380;
  const col3 = 480;

  doc.text('Item', col1, y);
  doc.text('Status', col2, y);
  doc.text('Weight', col3, y);
  y += 10;
  doc.line(40, y, 555, y);
  y += 14;

  for (const c of relevantChecks) {
    const r = byKey.get(c.key);
    const status = (r?.status ?? 'unknown').toUpperCase();
    doc.text(c.title, col1, y);
    doc.text(status, col2, y);
    doc.text(String(c.weight), col3, y);
    y += 14;

    if (y > 780) {
      doc.addPage();
      y = 46;
    }
  }

  const buf = doc.output('arraybuffer') as ArrayBuffer;
  return new Uint8Array(buf);
}
