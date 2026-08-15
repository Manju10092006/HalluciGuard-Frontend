'use client';

import React, { useState } from 'react';
import { LandingView } from '@/components/views/LandingView';
import { WorkspaceView } from '@/components/views/WorkspaceView';

export default function HomePage() {
  const [view, setView] = useState<'landing' | 'studio'>('landing');

  if (view === 'studio') {
    return <WorkspaceView onBackToLanding={() => setView('landing')} />;
  }

  return <LandingView onEnterStudio={() => setView('studio')} />;
}
