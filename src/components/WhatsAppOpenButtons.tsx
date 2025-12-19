import React from 'react';

import { Button } from './Button';
import { attemptDeepLink, whatsappDeepLinkAttempts } from '../lib/deeplinks';

export function WhatsAppOpenButtons(props: { title?: string; subtitle?: string }) {
  const attempts = whatsappDeepLinkAttempts();

  return (
    <div className="stack">
      <div className="kv">
        <div className="kv__k">{props.title ?? 'Open WhatsApp'}</div>
        <div className="small muted">
          {props.subtitle ?? 'Use these buttons to open WhatsApp, then follow the tap path above.'}
        </div>
      </div>
      <div className="row">
        {attempts.map((a) => (
          <Button key={a.url} variant="secondary" onClick={() => attemptDeepLink(a.url)}>
            {a.label}
          </Button>
        ))}
      </div>
      <div className="small muted">If nothing happens, use Safari/Chrome (in-app browsers often block app links).</div>
    </div>
  );
}
