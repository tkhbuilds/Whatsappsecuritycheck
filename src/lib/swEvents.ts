type UpdateFn = (reloadPage?: boolean) => Promise<void>;

declare global {
  interface Window {
    __fpcUpdateSW?: UpdateFn;
  }
}

export function setUpdateSW(fn: UpdateFn) {
  window.__fpcUpdateSW = fn;
}

export function requestSWRefreshBanner() {
  window.dispatchEvent(new CustomEvent('fpc:sw-need-refresh'));
}

export function onSWNeedRefresh(cb: () => void) {
  const handler = () => cb();
  window.addEventListener('fpc:sw-need-refresh', handler);
  return () => window.removeEventListener('fpc:sw-need-refresh', handler);
}
