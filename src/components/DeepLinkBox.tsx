import React from 'react';

import { WhatsAppOpenButtons } from './WhatsAppOpenButtons';
import type { OS, WhatsAppVariant } from '../db/schema';

export function DeepLinkBox(props: { os?: OS; variant?: WhatsAppVariant }) {
  return (
    <WhatsAppOpenButtons
      title="WhatsApp deep link test"
      subtitle="Tap to try opening WhatsApp. Come back here and record whether it worked."
      os={props.os}
      variant={props.variant}
    />
  );
}
