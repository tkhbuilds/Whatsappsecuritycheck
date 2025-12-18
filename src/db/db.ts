import Dexie, { type Table } from 'dexie';

import type { AuditRun, CheckResult, TargetProfile } from './schema';

export class FamilyPrivacyCopilotDB extends Dexie {
  profiles!: Table<TargetProfile, string>;
  auditRuns!: Table<AuditRun, string>;
  checkResults!: Table<CheckResult, string>;

  constructor() {
    super('family-privacy-copilot');

    this.version(1).stores({
      profiles: 'id, name, os, variant, createdAt, updatedAt',
      auditRuns: 'id, profileId, type, mode, startedAt, completedAt',
      checkResults: 'id, runId, profileId, key, category, status, weight, createdAt, updatedAt'
    });
  }
}

export const db = new FamilyPrivacyCopilotDB();
