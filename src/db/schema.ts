export type OS = 'Android' | 'iOS';
export type WhatsAppVariant = 'WhatsApp' | 'Business';

export type AuditType = 'Quick' | 'Full';
export type VerificationMode = 'StrangerCheck' | 'ScreenshotVerify' | 'Attestation';

export type CheckStatus = 'pass' | 'fail' | 'unknown' | 'na';
export type CheckCategory = 'critical' | 'important' | 'info';

export type CheckKey =
  | 'profilePhoto'
  | 'about'
  | 'lastSeenOnline'
  | 'status'
  | 'groups'
  | 'silenceUnknownCallers'
  | 'twoStepVerification'
  | 'twoStepRecoveryEmail'
  | 'whatsappDeepLink'
  | 'linkedDevices'
  | 'backupEncryption';

export type EvidenceRef = {
  sha256: string;
  timestamp: string;
  notes?: string;
  filename?: string;
  sizeBytes?: number;
  ocrStub?: {
    status: 'not_run';
    hint?: string;
  };
};

export type TargetProfile = {
  id: string;
  name: string;
  os: OS;
  variant: WhatsAppVariant;
  createdAt: string;
  updatedAt: string;
};

export type AuditRun = {
  id: string;
  profileId: string;
  type: AuditType;
  mode?: VerificationMode;
  startedAt: string;
  completedAt?: string;
  score?: number;
};

export type CheckResult = {
  id: string;
  runId: string;
  profileId: string;
  key: CheckKey;
  category: CheckCategory;
  weight: number;
  status: CheckStatus;
  notes?: string;
  evidence?: EvidenceRef;
  createdAt: string;
  updatedAt: string;
};
