import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/views/Dashboard';
import Schedule from './components/views/Schedule';
import Conflicts from './components/views/Conflicts';
import Settings from './components/views/Settings';
import useTimetableStore from './store/timetableStore';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { fetchVersions } = useTimetableStore();

  useEffect(() => {
    // Fetch initial data when app loads
    fetchVersions();
  }, [fetchVersions]);

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your timetable system' };
      case 'schedule':
        return { title: 'Schedule View', subtitle: 'Manage and view timetable schedules' };
      case 'conflicts':
        return { title: 'Conflict Management', subtitle: 'Review and resolve scheduling conflicts' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Configure your preferences' };
      default:
        return { title: 'Dashboard', subtitle: 'Overview of your timetable system' };
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'schedule':
        return <Schedule />;
      case 'conflicts':
        return <Conflicts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const { title, subtitle } = getViewTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="ml-64">
        <Header title={title} subtitle={subtitle} />

        <main className="p-8">
          <div className="animate-fade-in">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
