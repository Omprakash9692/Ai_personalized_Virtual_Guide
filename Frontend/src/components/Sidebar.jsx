import React, { useState } from 'react';
import { MessageSquare, FileText, Mic, User, Sparkles, ShieldCheck, Menu, X, Layers, Activity, Zap, Award, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { language, setLanguage, profile, userId, isHealthOk, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'chat', label: 'AI Voice Chat', icon: MessageSquare, description: 'Voice & text AI assistant' },
    { id: 'viva', label: 'Viva Simulator', icon: Award, badge: 'Voice HOD', description: 'Oral exam with grading' },
    { id: 'study', label: 'Auto Study Kit', icon: Zap, badge: 'AI Notes', description: 'Notes, Mindmaps & PYQs' },
    { id: 'document', label: 'PDF Guide (RAG)', icon: FileText, badge: 'RAG', description: 'Query PDF vector memory' },
    { id: 'profile', label: 'Student Profile', icon: User, badge: profile ? 'Active' : null, description: 'Personalization settings' },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Virtual Guide
            </h1>
            <p className="text-[10px] text-slate-500">Personalized Assistant</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding Section */}
        <div className="space-y-6">
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 rounded-2xl shadow-sm shadow-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base font-black tracking-tight text-slate-900">
                    Virtual Guide
                  </h1>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-blue-100 text-blue-700 border border-blue-200">
                    v2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">AI Student Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Navigation Links */}
          <nav className="space-y-2">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              MAIN NAVIGATION
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'bg-slate-100 border border-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider flex-shrink-0 ml-2 ${
                        isActive
                          ? 'bg-blue-200/50 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Profile Footer */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          
          {/* Active Profile Status Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center space-x-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {profile && profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {profile ? profile.name : 'Guest Student'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {profile ? profile.department : `ID: ${userId}`}
              </p>
            </div>
            {profile && <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Language:
              </span>
              <span className="text-[10px] text-blue-600 font-semibold uppercase">{language}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'or', label: 'ଓଡ଼ିଆ' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                    language === l.code
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Backend Connection Badge & Logout */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
              <span className="text-slate-500 font-medium">Backend Server</span>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isHealthOk ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
                <span className={isHealthOk ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {isHealthOk ? 'Online' : 'Connecting'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center justify-center space-x-2 w-full px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
