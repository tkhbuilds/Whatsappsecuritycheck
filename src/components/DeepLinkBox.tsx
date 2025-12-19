import React from 'react';

import { WhatsAppOpenButtons } from './WhatsAppOpenButtons';

export function DeepLinkBox() {
  return (
    <WhatsAppOpenButtons
      title="WhatsApp deep link test"
      subtitle="Tap to try opening WhatsApp. Come back here and record whether it worked."
    />
  );
}
