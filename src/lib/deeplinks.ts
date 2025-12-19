export type DeepLinkAttempt = {
  url: string;
  label: string;
};

type OS = 'Android' | 'iOS';
type WhatsAppVariant = 'WhatsApp' | 'Business';

function buildWhatsAppMessageText() {
  return 'Family Privacy Copilot deeplink test';
}

function waWebSendUrl(text: string) {
  // Works as a universal link on many devices; will fall back to web if app cannot open.
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function waApiSendUrl(text: string) {
  // Alternate https fallback that sometimes works better in certain browsers.
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

function waAppSendUrl(text: string) {
  // App scheme (best effort).
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

function waAndroidIntentUrl(params: {
  text: string;
  variant: WhatsAppVariant;
  fallbackUrl: string;
}) {
  // Chrome on Android supports intent:// URLs; this can improve reliability vs plain scheme links.
  // Note: We include a browser fallback URL so the user still lands somewhere useful.
  const pkg = params.variant === 'Business' ? 'com.whatsapp.w4b' : 'com.whatsapp';
  const fallback = encodeURIComponent(params.fallbackUrl);
  const text = encodeURIComponent(params.text);
  return (
    `intent://send?text=${text}` +
    `#Intent;scheme=whatsapp;package=${pkg};S.browser_fallback_url=${fallback};end`
  );
}

export function whatsappDeepLinkAttempts(opts?: {
  os?: OS;
  variant?: WhatsAppVariant;
  text?: string;
}): DeepLinkAttempt[] {
  // Notes:
  // - There is no reliable, official deep link into specific WhatsApp settings screens.
  // - Browsers cannot reliably detect whether the app opened.
  // - We provide best-effort scheme + https fallbacks; user confirms outcome.
  const os = opts?.os;
  const variant: WhatsAppVariant = opts?.variant ?? 'WhatsApp';
  const text = opts?.text ?? buildWhatsAppMessageText();

  const httpsPrimary = waWebSendUrl(text);
  const httpsAlt = waApiSendUrl(text);
  const scheme = waAppSendUrl(text);

  const attempts: DeepLinkAttempt[] = [];

  if (os === 'Android') {
    attempts.push({
      label: 'Open WhatsApp via Android intent link (recommended on Android/Chrome)',
      url: waAndroidIntentUrl({ text, variant, fallbackUrl: httpsPrimary })
    });
  }

  attempts.push(
    {
      label: 'Open WhatsApp via app link',
      url: scheme
    },
    {
      label: 'Open WhatsApp via wa.me (https fallback)',
      url: httpsPrimary
    },
    {
      label: 'Open WhatsApp via api.whatsapp.com (alternate https fallback)',
      url: httpsAlt
    }
  );

  // iOS sometimes behaves better with https first (universal link), but we still show all options.
  return attempts;
}

export function attemptDeepLink(url: string) {
  // Best-effort navigation. Some browsers require user interaction.
  window.location.assign(url);
}

export async function resetOfflineCacheAndReload() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    // ignore
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // ignore
  }

  // Cache-bust reload
  const u = new URL(window.location.href);
  u.searchParams.set('__reload', String(Date.now()));
  window.location.replace(u.toString());
}
