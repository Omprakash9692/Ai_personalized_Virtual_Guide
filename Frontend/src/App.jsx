import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ChatPage from './pages/ChatPage';
import DocumentPage from './pages/DocumentPage';
import ProfilePage from './pages/ProfilePage';
import StudyGeneratorPage from './pages/StudyGeneratorPage';
import VivaSimulatorPage from './pages/VivaSimulatorPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans relative select-none">

      {/* Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport Workspace */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto z-10 flex flex-col p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'viva' && <VivaSimulatorPage />}
          {activeTab === 'study' && <StudyGeneratorPage />}
          {activeTab === 'document' && <DocumentPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </main>

      {/* Toast Notification Banner */}
      <Toast />
    </div>
  );
}

function AppController() {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <AppContent /> : <AuthPage />;
}

export default function App() {
  return (
    <UserProvider>
      <AppController />
    </UserProvider>
  );
}
