import type { CheckCategory, CheckKey } from '../db/schema';

export type CheckDefinition = {
  key: CheckKey;
  title: string;
  category: CheckCategory;
  weight: number;
  description: string;
  strangerView: boolean;
};

export const CHECKS: CheckDefinition[] = [
  {
    key: 'profilePhoto',
    title: 'Profile Photo',
    category: 'critical',
    weight: 25,
    description: 'Can a stranger see your profile photo?',
    strangerView: true
  },
  {
    key: 'about',
    title: 'About',
    category: 'critical',
    weight: 25,
    description: 'Can a stranger see your About info?',
    strangerView: true
  },
  {
    key: 'lastSeenOnline',
    title: 'Last seen & Online',
    category: 'critical',
    weight: 25,
    description: 'Can a stranger see your last seen or online status?',
    strangerView: true
  },
  {
    key: 'status',
    title: 'Status',
    category: 'critical',
    weight: 25,
    description: 'Can a stranger see your status updates?',
    strangerView: true
  },

  {
    key: 'groups',
    title: 'Groups',
    category: 'important',
    weight: 10,
    description: 'Who can add you to groups?',
    strangerView: false
  },
  {
    key: 'silenceUnknownCallers',
    title: 'Silence unknown callers',
    category: 'important',
    weight: 10,
    description: 'Reduce spam calls from unknown numbers.',
    strangerView: false
  },
  {
    key: 'twoStepVerification',
    title: 'Two-step verification',
    category: 'important',
    weight: 10,
    description: 'Adds a PIN to protect your account.',
    strangerView: false
  },
  {
    key: 'twoStepRecoveryEmail',
    title: 'Recovery email for 2-step',
    category: 'important',
    weight: 10,
    description: 'Set an email address so you can reset the PIN if you forget it.',
    strangerView: false
  },

  {
    key: 'linkedDevices',
    title: 'Linked devices',
    category: 'info',
    weight: 2,
    description: 'Review and remove any unknown linked devices.',
    strangerView: false
  },
  {
    key: 'backupEncryption',
    title: 'Backup encryption',
    category: 'info',
    weight: 2,
    description: 'Turn on end-to-end encrypted backups if you use backups.',
    strangerView: false
  },
  {
    key: 'whatsappDeepLink',
    title: 'WhatsApp deep links',
    category: 'info',
    weight: 2,
    description: 'Can this device open WhatsApp from a link (useful for guided fix steps)?',
    strangerView: false
  }
];

export const STRANGER_CHECK_ORDER: CheckKey[] = ['profilePhoto', 'about', 'lastSeenOnline', 'status'];
export const ADDITIONAL_CHECK_ORDER: CheckKey[] = [
  'groups',
  'silenceUnknownCallers',
  'twoStepVerification',
  'twoStepRecoveryEmail',
  'linkedDevices',
  'backupEncryption',
  'whatsappDeepLink'
];

export function getCheckDef(key: CheckKey): CheckDefinition {
  const def = CHECKS.find((c) => c.key === key);
  if (!def) throw new Error(`Unknown check key: ${key}`);
  return def;
}
