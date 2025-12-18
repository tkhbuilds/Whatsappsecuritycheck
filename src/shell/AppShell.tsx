import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { ButtonLink } from '../components/ButtonLink';

export function AppShell() {
  const loc = useLocation();
  const onHome = loc.pathname === '/';

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__left">
          <Link to="/" className="brand">
            <span className="brand__title">Family Privacy Copilot</span>
            <span className="brand__subtitle">WhatsApp Privacy (Stranger View)</span>
          </Link>
        </div>
        <div className="topbar__right">
          {!onHome ? <ButtonLink to="/" variant="ghost">Home</ButtonLink> : null}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <span className="muted">Local-first. No WhatsApp access. No background monitoring.</span>
      </footer>
    </div>
  );
}
