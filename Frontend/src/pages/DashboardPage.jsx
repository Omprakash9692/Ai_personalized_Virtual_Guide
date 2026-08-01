import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Bell, Moon, Sun, Brain, Sparkles, Zap, Award
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { FileText } from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { profile } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  // Real Insight Integration
  const [weakestTopic, setWeakestTopic] = useState('Deadlocks');
  const [streak, setStreak] = useState(1);
  const [progressTracker, setProgressTracker] = useState([]);

  useEffect(() => {
    // 1. Fetch Weakest Topic for Insights
    const savedTopic = localStorage.getItem('weakestTopic') || 'Deadlocks';
    setWeakestTopic(savedTopic);

    // 2. Fetch Study Streak (simple localStorage implementation)
    const lastActive = localStorage.getItem('lastActiveDate');
    const currentStreak = parseInt(localStorage.getItem('studyStreak') || '1', 10);
    const today = new Date().toDateString();

    if (lastActive !== today) {
      if (lastActive === new Date(Date.now() - 86400000).toDateString()) {
        localStorage.setItem('studyStreak', (currentStreak + 1).toString());
        setStreak(currentStreak + 1);
      } else if (lastActive) {
        localStorage.setItem('studyStreak', '1');
        setStreak(1);
      }
      localStorage.setItem('lastActiveDate', today);
    } else {
      setStreak(currentStreak);
    }

    // 3. Progress Tracker (Real metrics from local storage history)
    // For presentation, we seed it if empty
    const savedProgress = JSON.parse(localStorage.getItem('subjectProgress')) || [
      { name: savedTopic !== 'Deadlocks' ? savedTopic : 'Operating Systems', progress: 45, color: 'bg-emerald-500' },
      { name: 'Data Structures', progress: 85, color: 'bg-blue-500' },
      { name: 'System Design', progress: 30, color: 'bg-rose-500' },
      { name: 'React.js', progress: 92, color: 'bg-cyan-500' },
    ];
    setProgressTracker(savedProgress);

  }, []);

  const handleGenerateInsightNotes = () => {
    localStorage.setItem('studyTopic', weakestTopic);
    setActiveTab('study');
  };

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto pb-12 overflow-x-hidden">
      
      {/* 1. Top Navbar / Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, PDFs, or ask AI..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white dark:border-slate-800">
            {profile?.name ? profile.name.charAt(0) : 'U'}
          </div>
        </div>
      </div>

      {/* 2. Welcome Section (Study Streak) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{profile?.name || 'Student'}</span>!
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed text-sm">
              "Consistency is the key to mastery. You're doing great—let's conquer today's goals and unlock new knowledge!"
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-inner">
            <div className="flex items-center space-x-3 text-amber-400 mb-2">
              <Zap className="w-8 h-8 fill-current drop-shadow-md" />
              <div className="flex flex-col items-start">
                <span className="font-black text-2xl leading-none">{streak} Day</span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Study Streak</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Progress Tracker & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Real Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span>Skill Progress Tracker</span>
            </h3>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">Live</span>
          </div>
          <div className="space-y-6 flex-1">
            {progressTracker.map(sub => (
              <div key={sub.name} className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span>{sub.name}</span>
                  <span>{sub.progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.progress}%` }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className={`h-full rounded-full ${sub.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-between"
        >
          <Brain className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 rotate-12" />
          
          <div>
            <h3 className="text-lg font-black flex items-center space-x-2 mb-6">
              <Sparkles className="w-6 h-6 text-blue-200" />
              <span>Aether AI Insights</span>
            </h3>
            <p className="text-base leading-relaxed text-blue-50 relative z-10">
              Your overall concepts are strengthening! However, based on your recent mock interviews, you struggled with questions related to <strong className="bg-white/20 px-2 py-1 rounded-md text-white">{weakestTopic}</strong>. 
              <br /><br />
              We highly recommend generating a focused mind map and study notes for this topic today to patch your knowledge gaps.
            </p>
          </div>

          <div className="mt-8 relative z-10">
            <button 
              onClick={handleGenerateInsightNotes} 
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 shadow-lg rounded-xl text-sm font-black transition-all flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Notes for {weakestTopic}</span>
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
