import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { db } from '../db/db';
import type { OS, TargetProfile, WhatsAppVariant } from '../db/schema';
import { setActiveProfileId } from '../lib/appState';
import { id } from '../lib/id';

export function NewProfileRoute() {
  const nav = useNavigate();

  const [name, setName] = React.useState('');
  const [os, setOs] = React.useState<OS>('Android');
  const [variant, setVariant] = React.useState<WhatsAppVariant>('WhatsApp');
  const [error, setError] = React.useState<string | null>(null);

  async function save() {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }

    const now = new Date().toISOString();
    const profile: TargetProfile = {
      id: id(),
      name: trimmed,
      os,
      variant,
      createdAt: now,
      updatedAt: now
    };

    await db.profiles.put(profile);
    setActiveProfileId(profile.id);
    nav('/');
  }

  return (
    <div className="card stack">
      <h1 className="h1">Create Target Profile</h1>
      <div className="muted">This stays on-device (IndexedDB).</div>
      <div className="hr" />

      <Field label="Name">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Mom, Dad, Child" />
      </Field>

      <Field label="OS">
        <select className="input select" value={os} onChange={(e) => setOs(e.target.value as OS)}>
          <option value="Android">Android</option>
          <option value="iOS">iOS</option>
        </select>
      </Field>

      <Field label="WhatsApp variant">
        <select
          className="input select"
          value={variant}
          onChange={(e) => setVariant(e.target.value as WhatsAppVariant)}
        >
          <option value="WhatsApp">WhatsApp</option>
          <option value="Business">WhatsApp Business</option>
        </select>
      </Field>

      {error ? <div className="badge badge--fail">{error}</div> : null}

      <Button onClick={() => void save()} fullWidth>
        Save profile
      </Button>
    </div>
  );
}
