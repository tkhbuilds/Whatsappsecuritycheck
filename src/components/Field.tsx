import React from 'react';

export function Field(props: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="kv">
      <div className="kv__k">{props.label}</div>
      <div>{props.children}</div>
      {props.hint ? <div className="small muted">{props.hint}</div> : null}
    </div>
  );
}
