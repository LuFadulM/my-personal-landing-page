'use client';

import { useState } from 'react';
import Sidebar, { type Section } from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ClientList from './components/ClientList';
import ForReview from './components/ForReview';
import FollowUpTracker from './components/FollowUpTracker';
import PipelineView from './components/PipelineView';
import { forReviewCandidates } from './data/seed';

export default function Home() {
  const [section, setSection] = useState<Section>('overview');

  const render = () => {
    switch (section) {
      case 'overview':
        return <DashboardOverview onNavigate={setSection} />;
      case 'clients':
        return <ClientList />;
      case 'review':
        return <ForReview />;
      case 'followup':
        return <FollowUpTracker />;
      case 'pipeline':
        return <PipelineView />;
      default:
        return <DashboardOverview onNavigate={setSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        active={section}
        onNavigate={setSection}
        reviewCount={forReviewCandidates.length}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin">
        {render()}
      </main>
    </div>
  );
}
