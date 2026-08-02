import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Bell, Moon, Sun, Brain, Sparkles, Zap, Award, FileText,
  MessageSquare, Mic, BookOpen, Clock, CheckCircle2, TrendingUp,
  ArrowRight, Flame, ChevronRight, CheckSquare, Square, Layers,
  Compass, BarChart3, User, Sparkle, Plus, Trash2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardPage({ setActiveTab }) {
  const { profile } = useUser();
  const { theme, toggleTheme } = useTheme();

  // State Management
  const [weakestTopic, setWeakestTopic] = useState('Deadlocks');
  const [streak, setStreak] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Good Day');

  const [newGoalText, setNewGoalText] = useState('');

  // Interactive Daily Goals
  const [dailyGoals, setDailyGoals] = useState(() => {
    const saved = localStorage.getItem('dailyGoals');
    const savedTopic = localStorage.getItem('weakestTopic') || 'Deadlocks';
    return saved ? JSON.parse(saved) : [
      { id: 1, text: `Review Operating Systems & ${savedTopic} concept`, completed: true },
      { id: 2, text: 'Complete 1 Mock Viva session with AI Examiner', completed: false },
      { id: 3, text: 'Upload & index textbook PDF in RAG memory', completed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  const toggleGoal = (id) => {
    setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: Date.now(),
      text: newGoalText.trim(),
      completed: false,
    };
    setDailyGoals(prev => [...prev, newGoal]);
    setNewGoalText('');
  };

  const handleDeleteGoal = (id, e) => {
    e.stopPropagation();
    setDailyGoals(prev => prev.filter(g => g.id !== id));
  };

  useEffect(() => {
    // Determine time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // 1. Fetch Weakest Topic for Insights
    const savedTopic = localStorage.getItem('weakestTopic') || 'Deadlocks';
    setWeakestTopic(savedTopic);

    // 2. Fetch Study Streak
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
  }, []);

  const handleGenerateInsightNotes = () => {
    localStorage.setItem('studyTopic', weakestTopic);
    setActiveTab('study');
  };

  const handleStartPracticeViva = () => {
    localStorage.setItem('vivaTopic', weakestTopic);
    setActiveTab('viva');
  };

  const completedGoalsCount = dailyGoals.filter(g => g.completed).length;
  const goalProgressPercent = Math.round((completedGoalsCount / dailyGoals.length) * 100);

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto pb-12 overflow-x-hidden">
      
      {/* 1. Header Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study notes, PDFs, or ask AI..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
            </button>
          </div>

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
                {profile?.name || 'Student'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {profile?.semester || 'Semester 6'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Welcome Banner & Study Streak */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl"
      >
        {/* Animated Background Decorative Blurs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aether AI Academic Companion</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">{profile?.name || 'Student'}</span>!
            </h1>
            
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm font-medium">
              Ready to elevate your learning today? Your personalized AI guide has indexed your notes and configured practice mock viva modules.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-semibold">
                🎓 {profile?.department || 'Computer Science & Engineering'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-semibold">
                📚 {profile?.semester || 'Semester 6'}
              </span>
            </div>
          </div>
          
          {/* Study Streak Badge Card */}
          <div className="w-full lg:w-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl flex items-center justify-between lg:justify-start space-x-4">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center">
              <Flame className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-2xl font-black text-white leading-none flex items-center space-x-1">
                <span>{streak}</span>
                <span className="text-amber-400 text-lg">Days</span>
              </div>
              <p className="text-xs font-bold text-amber-200/90 uppercase tracking-wider mt-1">Study Streak</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Keep learning daily to level up!</p>
            </div>
          </div>

        </div>
      </motion.div>



      {/* 4. Aether AI Insights & Focus Area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden"
      >
        <Brain className="absolute -bottom-10 -right-10 w-56 h-56 text-white/10 rotate-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-200" />
              <h3 className="text-lg font-black tracking-tight text-white">Aether AI Personal Insight</h3>
            </div>
            
            <p className="text-sm leading-relaxed text-blue-100/90 font-medium">
              Based on your recent mock evaluations and study sessions, your core concepts are strong! However, you can improve confidence in <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold text-white border border-white/20">{weakestTopic}</span>.
            </p>
            <p className="text-xs text-blue-200/80">
              Generating a focused mind map or trying a 5-minute AI mock viva will solidify your comprehension.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative z-10">
            <button 
              onClick={handleGenerateInsightNotes} 
              className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 shadow-lg rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 group"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Generate Notes for {weakestTopic}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleStartPracticeViva} 
              className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Mock Viva Practice</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 5. Quick Access Feature Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Quick Assistant Access</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Click to launch feature</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Feature 1: AI Voice Chat */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setActiveTab('chat')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-max mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              AI Voice Chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Real-time voice & text interactive student assistant.
            </p>
            <div className="mt-4 flex items-center text-xs font-extrabold text-blue-600 dark:text-blue-400">
              <span>Start Chatting</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Feature 2: Interview Simulator */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setActiveTab('viva')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-max mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Interview Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Mock viva voice examination with instant grading & report.
            </p>
            <div className="mt-4 flex items-center text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              <span>Launch Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Feature 3: Auto Study Kit */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setActiveTab('study')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-max mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Auto Study Kit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Generate notes, Mermaid mindmaps, & solved PYQs.
            </p>
            <div className="mt-4 flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <span>Create Notes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Feature 4: PDF Guide RAG */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setActiveTab('document')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 w-max mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              PDF Guide (RAG)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Upload textbook PDFs & query vector memory with AI.
            </p>
            <div className="mt-4 flex items-center text-xs font-extrabold text-purple-600 dark:text-purple-400">
              <span>Explore RAG Memory</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* 6. Daily Goals Section */}
      <div>
        
        {/* Daily Study Targets */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Today's Learning Targets</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                {completedGoalsCount} of {dailyGoals.length} Completed
              </span>
            </div>

            {/* Goal Progress Bar */}
            <div className="mb-6 space-y-1.5">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${goalProgressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Daily Target Progress</span>
                <span>{goalProgressPercent}%</span>
              </div>
            </div>

            {/* Goal List */}
            <div className="space-y-3">
              {dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 group ${
                    goal.completed
                      ? 'bg-slate-50 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 line-through'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                  }`}
                >
                  <div className={`p-1 rounded-lg transition-colors ${goal.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {goal.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-semibold flex-1">{goal.text}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteGoal(goal.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all rounded-lg"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Goal Input */}
            <form onSubmit={handleAddGoal} className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Add a new target..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400 dark:placeholder-slate-600"
              />
              <button
                type="submit"
                disabled={!newGoalText.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
                title="Add Target"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              💡 Tip: Click any target above to toggle completion, or add your custom goals!
            </p>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
