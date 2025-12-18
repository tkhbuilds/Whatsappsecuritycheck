import type { CheckKey, OS, WhatsAppVariant } from '../db/schema';

export type FixStep = {
  title: string;
  desired: string;
  pathAndroid: string[];
  pathIOS: string[];
  notes?: string[];
};

const steps: Record<CheckKey, FixStep> = {
  profilePhoto: {
    title: 'Profile Photo privacy',
    desired: 'Set Profile photo to “Nobody” (or at least “My contacts”).',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Privacy', 'Profile photo'],
    pathIOS: ['WhatsApp', 'Settings', 'Privacy', 'Profile Photo'],
    notes: ['If you choose “My contacts except…”, exclude unknown numbers.']
  },
  about: {
    title: 'About privacy',
    desired: 'Set About to “Nobody” (or at least “My contacts”).',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Privacy', 'About'],
    pathIOS: ['WhatsApp', 'Settings', 'Privacy', 'About'],
    notes: ['About often leaks identity details—keep it minimal.']
  },
  lastSeenOnline: {
    title: 'Last seen & Online privacy',
    desired: 'Set Last seen to “Nobody”. Set Online to “Same as last seen” when available.',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Privacy', 'Last seen and online'],
    pathIOS: ['WhatsApp', 'Settings', 'Privacy', 'Last Seen & Online'],
    notes: ['If Online privacy is not shown, update WhatsApp to latest version.']
  },
  status: {
    title: 'Status privacy',
    desired: 'Set Status to “My contacts” (or “My contacts except…”).',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Privacy', 'Status'],
    pathIOS: ['WhatsApp', 'Settings', 'Privacy', 'Status'],
    notes: ['Avoid public status visibility.']
  },
  groups: {
    title: 'Groups privacy',
    desired: 'Set Groups to “My contacts” (or “My contacts except…”).',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Privacy', 'Groups'],
    pathIOS: ['WhatsApp', 'Settings', 'Privacy', 'Groups'],
    notes: ['This reduces unwanted group add spam.']
  },
  silenceUnknownCallers: {
    title: 'Silence unknown callers',
    desired: 'Turn ON “Silence unknown callers”.',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Privacy', 'Calls', 'Silence unknown callers'],
    pathIOS: ['WhatsApp', 'Settings', 'Privacy', 'Calls', 'Silence Unknown Callers'],
    notes: ['You can still see missed calls in Calls tab.']
  },
  twoStepVerification: {
    title: 'Two-step verification',
    desired: 'Turn ON 2-step verification and set a PIN you will remember.',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Account', 'Two-step verification'],
    pathIOS: ['WhatsApp', 'Settings', 'Account', 'Two-step verification'],
    notes: ['Add an email to recover the PIN if you forget it.']
  },
  linkedDevices: {
    title: 'Linked devices review',
    desired: 'Remove any device you do not recognize.',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Linked devices'],
    pathIOS: ['WhatsApp', 'Settings', 'Linked Devices'],
    notes: ['If unsure, log out everything and relink only your own devices.']
  },
  backupEncryption: {
    title: 'Backup encryption',
    desired: 'Turn ON end-to-end encrypted backups (if you use backups).',
    pathAndroid: ['WhatsApp', '⋮ Menu', 'Settings', 'Chats', 'Chat backup', 'End-to-end encrypted backup'],
    pathIOS: ['WhatsApp', 'Settings', 'Chats', 'Chat Backup', 'End-to-end Encrypted Backup'],
    notes: ['Keep the encryption password/key safe.']
  }
};

export function getFixStep(key: CheckKey, _variant: WhatsAppVariant): FixStep {
  // Variant kept for future differences; today we show same paths.
  return steps[key];
}

export function pathForOS(os: OS, step: FixStep): string {
  const parts = os === 'Android' ? step.pathAndroid : step.pathIOS;
  return parts.join(' → ');
}
