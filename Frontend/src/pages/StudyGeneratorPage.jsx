import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  GitFork,
  HelpCircle,
  Search,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { generateStudyMaterial } from '../services/api';
import MermaidDiagram from '../components/MermaidDiagram';
import MarkdownViewer from '../components/MarkdownViewer';

const PRESET_TOPICS = [
  'DBMS Normalization',
  'OS Deadlocks & Prevention',
  'TCP/IP vs OSI Model',
  'React Virtual DOM & Reconciliation',
  'Binary Search Tree & AVL Trees',
  'Object-Oriented Programming Polymorphism',
];

export default function StudyGeneratorPage() {
  const { showToast } = useUser();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'mindmap' | 'pyqs'
  const [studyData, setStudyData] = useState(null);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState({});
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    const savedTopic = localStorage.getItem('studyTopic');
    if (savedTopic) {
      setTopic(savedTopic);
      localStorage.removeItem('studyTopic'); // Clear it after reading
      // Automatically trigger generation
      setTimeout(() => handleGenerate(savedTopic), 500);
    }
  }, []);

  const handleGenerate = async (targetTopic) => {
    const queryTopic = targetTopic || topic;
    if (!queryTopic || !queryTopic.trim()) {
      showToast('Please enter an academic topic.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await generateStudyMaterial({ topic: queryTopic.trim() });
      if (response && response.success && response.data) {
        setStudyData(response.data);
        showToast(`Study Kit generated successfully for "${queryTopic.trim()}"!`, 'success');
      } else {
        throw new Error(response?.error || 'Failed to generate study materials.');
      }
    } catch (err) {
      console.error('[Study Generator Error]:', err);
      showToast(err.message || 'Error generating study kit. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNotes = () => {
    if (!studyData?.notes) return;
    navigator.clipboard.writeText(studyData.notes);
    setCopiedNotes(true);
    showToast('1-Page Notes copied to clipboard!', 'success');
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadNotes = () => {
    if (!studyData?.notes) return;
    const element = document.createElement('a');
    const file = new Blob([studyData.notes], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${studyData.topic.replace(/\s+/g, '_')}_Notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Downloaded notes as Markdown file!', 'success');
  };

  const toggleSolution = (id) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPyqs =
    studyData?.pyqs?.filter((item) => {
      if (difficultyFilter === 'All') return true;
      return item.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
    }) || [];

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto pb-12 transition-colors duration-300">
      
      {/* Hero Header Banner */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-2xl text-amber-500 shadow-sm">
              <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Auto Notes + Mindmap Generator
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Type any subject or exam topic to instantly receive 1-Page Notes, an interactive Mindmap Diagram, and 5 High-Yield PYQs.
              </p>
            </div>
          </div>

          {/* Topic Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. DBMS Normalization, Operating System Deadlocks, TCP/IP..."
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Study Kit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Material</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Topics Chips */}
          <div className="flex items-center flex-wrap gap-2 pt-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Popular Topics:
            </span>
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(preset);
                  handleGenerate(preset);
                }}
                disabled={loading}
                className="text-xs bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 px-3 py-1 rounded-xl transition-all"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Material Display Area */}
      {studyData ? (
        <div className="space-y-6">
          
          {/* 3 Tab Navigation Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1-Page Notes</span>
              </button>

              <button
                onClick={() => setActiveTab('mindmap')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'mindmap'
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span>Mindmap Diagram</span>
              </button>

              <button
                onClick={() => setActiveTab('pyqs')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'pyqs'
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>5 Important PYQs</span>
              </button>
            </div>

            {/* Topic Badge */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <span>Topic:</span>
              <strong className="text-blue-700 dark:text-blue-400">{studyData.topic}</strong>
            </div>

          </div>

          {/* TAB 1: 1-PAGE NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    1-Page High-Yield Notes: {studyData.topic}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyNotes}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-all"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotes ? 'Copied' : 'Copy Notes'}</span>
                  </button>

                  <button
                    onClick={handleDownloadNotes}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export (.md)</span>
                  </button>
                </div>
              </div>

              {/* Notes Body Content */}
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-sans shadow-inner">
                <MarkdownViewer content={studyData.notes} />
              </div>
            </div>
          )}

          {/* TAB 2: MINDMAP DIAGRAM */}
          {activeTab === 'mindmap' && (
            <div className="space-y-4">
              <MermaidDiagram chart={studyData.mindmap} />
            </div>
          )}

          {/* TAB 3: 5 IMPORTANT PYQS */}
          {activeTab === 'pyqs' && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Header & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span>5 High-Yield Previous Year Questions</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Curated exam questions with step-by-step solutions and scoring tips.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        difficultyFilter === diff
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* PYQ List */}
              <div className="space-y-4">
                {filteredPyqs.length > 0 ? (
                  filteredPyqs.map((pyq, index) => {
                    const isExpanded = !!expandedSolutions[pyq.id || index];
                    const difficultyColor =
                      pyq.difficulty === 'Easy'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : pyq.difficulty === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';

                    return (
                      <div
                        key={pyq.id || index}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 transition-all space-y-4"
                      >
                        {/* Question Metadata Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center">
                              Q{pyq.id || index + 1}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${difficultyColor}`}>
                              {pyq.difficulty || 'Medium'}
                            </span>
                            {pyq.marks && (
                              <span className="text-[10px] bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full font-mono">
                                {pyq.marks}
                              </span>
                            )}
                          </div>

                          {pyq.type && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                              Category: {pyq.type}
                            </span>
                          )}
                        </div>

                        {/* Question Text */}
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {pyq.question}
                        </p>

                        {/* Expand Solution Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => toggleSolution(pyq.id || index)}
                            className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Solution' : 'View Solution & Exam Strategy'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Solution Panel */}
                        {isExpanded && (
                          <div className="mt-3 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl">
                            <div className="space-y-1">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                                Step-by-Step Answer Key
                              </h4>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                                {pyq.solution}
                              </p>
                            </div>

                            {pyq.examTip && (
                              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 flex items-start space-x-2">
                                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-[11px] text-amber-800 dark:text-amber-400">
                                  <strong className="font-bold text-amber-700 dark:text-amber-500">Examiner's Scoring Tip: </strong>
                                  {pyq.examTip}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                    No PYQs found matching difficulty filter.
                  </p>
                )}
              </div>

            </div>
          )}

        </div>
      ) : (
        /* Empty State Illustration */
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-3xl flex items-center justify-center mx-auto text-blue-500 dark:text-blue-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Ready to generate instant study material?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter any academic topic above (like "DBMS Normalization") or click one of the popular topic chips to generate notes, mindmaps, and PYQs in parallel.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
