import React from 'react';

import { Button } from './Button';
import { attemptDeepLink, whatsappDeepLinkAttempts } from '../lib/deeplinks';

export function DeepLinkBox() {
  const attempts = whatsappDeepLinkAttempts();

  return (
    <div className="stack">
      <div className="kv">
        <div className="kv__k">WhatsApp deep link test</div>
        <div className="small muted">
          Tap a button to try opening WhatsApp. Come back here and record whether it worked.
        </div>
      </div>

      <div className="row">
        {attempts.map((a) => (
          <Button key={a.url} variant="secondary" onClick={() => attemptDeepLink(a.url)}>
            {a.label}
          </Button>
        ))}
      </div>

      <div className="small muted">
        Note: Browsers can’t reliably auto-detect if the app opened; this is user-verified.
      </div>
    </div>
  );
}
