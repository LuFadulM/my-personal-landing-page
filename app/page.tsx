'use client';

import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import CandidateTracker from './components/CandidateTracker';
import FollowUpQueue from './components/FollowUpQueue';
import TaskQueue from './components/TaskQueue';
import DailyChecklist from './components/DailyChecklist';
import RolesHealth from './components/RolesHealth';
import { seedDataIfNeeded } from './data/seed';

export default function Home() {
  const [activeSection, setActiveSection] = useState('overview');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDataIfNeeded();
    setReady(true);
  }, []);

  if (!ready) return null;

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview onNavigate={setActiveSection} />;
      case 'candidates':
        return <CandidateTracker />;
      case 'followup':
        return <FollowUpQueue />;
      case 'tasks':
        return <TaskQueue />;
      case 'checklist':
        return <DailyChecklist />;
      case 'roles':
        return <RolesHealth />;
      default:
        return <Overview onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={activeSection} onNavigate={setActiveSection} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {renderSection()}
      </main>
    </div>
  );
}
