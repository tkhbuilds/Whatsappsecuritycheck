import React from 'react';

import { Button } from './Button';
import { onSWNeedRefresh } from '../lib/swEvents';
import { resetOfflineCacheAndReload } from '../lib/deeplinks';

export function UpdateBanner() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    return onSWNeedRefresh(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div className="card" style={{ marginBottom: 12, borderColor: 'rgba(6,182,212,0.35)' }}>
      <div className="stack">
        <div style={{ fontWeight: 900 }}>Update available</div>
        <div className="small muted">
          If you don’t see recent changes, reload. If it still doesn’t update, reset the offline cache.
        </div>
        <div className="row">
          <Button
            onClick={() => {
              void window.__fpcUpdateSW?.(true);
            }}
          >
            Reload now
          </Button>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Not now
          </Button>
          <Button variant="ghost" onClick={() => void resetOfflineCacheAndReload()}>
            Reset cache
          </Button>
        </div>
      </div>
    </div>
  );
}
