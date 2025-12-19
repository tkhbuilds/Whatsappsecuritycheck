import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';

import { AppShell } from './shell/AppShell';
import { HomeRoute } from './routes/HomeRoute';
import { NewProfileRoute } from './routes/NewProfileRoute';
import { AuditModeRoute } from './routes/AuditModeRoute';
import { StrangerCheckRoute } from './routes/StrangerCheckRoute';
import { AdditionalSettingsRoute } from './routes/AdditionalSettingsRoute';
import { FixStepsRoute } from './routes/FixStepsRoute';
import { ReportRoute } from './routes/ReportRoute';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'profiles/new', element: <NewProfileRoute /> },
      { path: 'audit/:runId/mode', element: <AuditModeRoute /> },
      { path: 'audit/:runId/stranger/:checkKey', element: <StrangerCheckRoute /> },
      { path: 'audit/:runId/additional', element: <AdditionalSettingsRoute /> },
      { path: 'audit/:runId/additional/:checkKey', element: <AdditionalSettingsRoute /> },
      { path: 'audit/:runId/fix', element: <FixStepsRoute /> },
      { path: 'report/:runId', element: <ReportRoute /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
