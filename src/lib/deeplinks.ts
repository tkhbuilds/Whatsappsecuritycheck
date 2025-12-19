export type DeepLinkAttempt = {
  url: string;
  label: string;
};

export function whatsappDeepLinkAttempts(): DeepLinkAttempt[] {
  // Notes:
  // - There is no reliable, official deep link into specific WhatsApp settings screens.
  // - Browsers cannot reliably detect whether the app opened.
  // - We provide best-effort scheme + https fallbacks; user confirms outcome.
  return [
    {
      label: 'Open WhatsApp via app link (recommended)',
      url: 'whatsapp://send?text=Family%20Privacy%20Copilot%20deeplink%20test'
    },
    {
      label: 'Open WhatsApp via wa.me (fallback)',
      url: 'https://wa.me/?text=Family%20Privacy%20Copilot%20deeplink%20test'
    }
  ];
}

export function attemptDeepLink(url: string) {
  // Best-effort navigation. Some browsers require user interaction.
  window.location.href = url;
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
