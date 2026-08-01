import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ChatPage from './pages/ChatPage';
import DocumentPage from './pages/DocumentPage';
import ProfilePage from './pages/ProfilePage';
import StudyGeneratorPage from './pages/StudyGeneratorPage';
import VivaSimulatorPage from './pages/VivaSimulatorPage';
import DashboardPage from './pages/DashboardPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row font-sans relative select-none transition-colors duration-300">

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport Workspace */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto z-10 flex flex-col p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'viva' && <VivaSimulatorPage />}
          {activeTab === 'study' && <StudyGeneratorPage />}
          {activeTab === 'document' && <DocumentPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </main>

      <Toast />
    </div>
  );
}

function AppController() {
  const { isAuthenticated } = useUser();
  const [view, setView] = useState('landing'); // 'landing', 'auth', 'app'

  // Automatically go to app if authenticated, unless user explicitly logs out
  useEffect(() => {
    if (isAuthenticated) {
      setView('app');
    } else {
      // If user logs out, go back to landing
      setView('landing');
    }
  }, [isAuthenticated]);

  const handleNavigateToAuth = (isSignup = false) => {
    // Optionally pass isSignup to AuthPage if you want to default to Register tab
    setView('auth');
  };

  if (view === 'app' && isAuthenticated) {
    return <AppContent />;
  }

  if (view === 'auth') {
    return (
      <div className="relative">
        <AuthPage />
        <button 
          onClick={() => setView('landing')} 
          className="absolute top-6 left-6 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all z-50 backdrop-blur-md border border-slate-700/50"
        >
          &larr; Back to Home
        </button>
      </div>
    );
  }

  // Default
  return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppController />
      </UserProvider>
    </ThemeProvider>
  );
}
