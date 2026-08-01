import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Award,
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Brain,
  MessageSquare,
  Briefcase,
  Layers,
  Users
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { getVivaQuestion, submitVivaAnswer, synthesizeVoice } from '../services/api';

const ROUNDS = [
  {
    id: 'Aptitude & Reasoning',
    name: 'Aptitude & Reasoning Round',
    role: 'Logical & Quantitative Assessment',
    badge: 'Logic Test',
    avatarBg: 'from-purple-500 to-indigo-700',
    description: 'Tests your problem-solving, mathematical logic, and critical reasoning abilities.',
    icon: Brain
  },
  {
    id: 'Technical Round',
    name: 'Technical Interview',
    role: 'Domain Expertise Assessment',
    badge: 'Core Skills',
    avatarBg: 'from-blue-600 to-blue-800',
    description: 'Deep dive into your technical skills, system design, and role-specific knowledge.',
    icon: Layers
  },
  {
    id: 'HR Interview',
    name: 'HR & Behavioral Round',
    role: 'Cultural Fit & Soft Skills',
    badge: 'STAR Method',
    avatarBg: 'from-emerald-500 to-teal-700',
    description: 'Assesses teamwork, communication, and behavioral responses to situational scenarios.',
    icon: Users
  },
];

export default function VivaSimulatorPage() {
  const { showToast, language, profile } = useUser();
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Session settings
  const [jobRoleInput, setJobRoleInput] = useState('Software Engineer');
  const [selectedRound, setSelectedRound] = useState('Technical Round');
  const [sessionActive, setSessionActive] = useState(false);

  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [history, setHistory] = useState([]);

  // Sync transcript from speech recognition hook to local input state
  useEffect(() => {
    if (transcript) {
      setStudentAnswerText((prev) => {
        return transcript;
      });
    }
  }, [transcript]);

  // Unlocks browser audio autoplay policies on user interaction
  const unlockAudio = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startSession = async () => {
    unlockAudio();
    setSessionActive(true);
    setScorecard(null);
    setHistory([]);
    await fetchNextQuestion();
  };

  const handleNextQuestionClick = (isFollowup = false, customQuestionText = null) => {
    unlockAudio();
    fetchNextQuestion(isFollowup, customQuestionText);
  };

  const fetchNextQuestion = async (isFollowup = false, customQuestionText = null) => {
    if (customQuestionText) {
      setCurrentQuestion({
        question: customQuestionText,
        topic: selectedRound,
        difficulty: 'Medium',
      });
      setStudentAnswerText('');
      resetTranscript();
      setScorecard(null);
      return;
    }

    setLoadingQuestion(true);
    setScorecard(null);
    setStudentAnswerText('');
    resetTranscript();

    try {
      const response = await getVivaQuestion({
        jobRole: jobRoleInput,
        round: selectedRound,
        previousTurns: history,
      });

      if (response && response.success && response.data) {
        setCurrentQuestion(response.data);
      } else {
        throw new Error(response?.error || 'Failed to fetch interview question.');
      }
    } catch (err) {
      console.error('[Interview Question Error]:', err);
      showToast(err.message || 'Error generating interview question.', 'error');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSpeakQuestion = async (textToSpeak) => {
    const text = typeof textToSpeak === 'string' ? textToSpeak : currentQuestion?.question;
    if (!text) return;
    setIsPlayingAudio(true);
    
    const fallbackSpeak = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    };

    try {
      const res = await synthesizeVoice({
        text: text,
        language: 'en',
      });
      if (res && res.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${res.audioContent}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackSpeak();
        
        audio.play().catch((e) => {
          console.warn('Audio autoplay blocked, falling back to browser TTS:', e);
          fallbackSpeak();
        });
      } else {
        fallbackSpeak();
      }
    } catch (e) {
      console.warn('Voice Synthesis API failed, using fallback:', e);
      fallbackSpeak();
    }
  };

  // Auto-play the question when it is generated
  useEffect(() => {
    if (sessionActive && currentQuestion?.question) {
      handleSpeakQuestion(currentQuestion.question);
    }
  }, [currentQuestion?.question]);

  const handleToggleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening(language || 'en');
    }
  };

  const handleSubmitAnswer = async () => {
    const finalAnswer = studentAnswerText.trim();
    if (!finalAnswer) {
      showToast('Please record or type your answer before submitting.', 'error');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setEvaluating(true);
    try {
      const response = await submitVivaAnswer({
        question: currentQuestion.question,
        studentAnswer: finalAnswer,
        jobRole: jobRoleInput,
        round: selectedRound,
      });

      if (response && response.success && response.data) {
        setScorecard(response.data);
        setHistory((prev) => [
          ...prev,
          {
            question: currentQuestion.question,
            answer: finalAnswer,
            scorecard: response.data,
          },
        ]);
        const newScorePercent = Math.round((response.data.score / 10) * 100);
        
        // Dynamic Skill Tracker Calculation
        const currentRole = jobRoleInput || 'Software Engineer';
        const savedProgressStr = localStorage.getItem('subjectProgress');
        let progressArray = savedProgressStr ? JSON.parse(savedProgressStr) : [];
        
        const existingSkillIndex = progressArray.findIndex(s => s.name === currentRole);
        if (existingSkillIndex >= 0) {
          // Calculate running average
          progressArray[existingSkillIndex].progress = Math.round((progressArray[existingSkillIndex].progress + newScorePercent) / 2);
        } else {
          // Pick a random vibrant color for new skill
          const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          progressArray.push({ name: currentRole, progress: newScorePercent, color: randomColor });
        }
        localStorage.setItem('subjectProgress', JSON.stringify(progressArray));

        if (response.data.score < 8) {
          localStorage.setItem('weakestTopic', currentRole);
        }

        showToast(`Answer evaluated! Score: ${response.data.score}/10`, 'success');
      } else {
        throw new Error(response?.error || 'Failed to evaluate answer.');
      }
    } catch (err) {
      console.error('[Interview Evaluation Error]:', err);
      showToast(err.message || 'Error evaluating interview response.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const activeRoundObj = ROUNDS.find((p) => p.id === selectedRound) || ROUNDS[1];

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto pb-12 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-2xl text-blue-600 dark:text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Mock Interview Simulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Experience a realistic 3-round interview process with voice evaluations & scoring tailored to your job role.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!sessionActive ? (
        /* SETUP BOARD */
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm transition-colors duration-300">
          
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4 flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Step 1: Define Target Job Role</span>
            </h3>
            
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Target Job Role:</label>
              <input
                type="text"
                value={jobRoleInput}
                onChange={(e) => setJobRoleInput(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Scientist, Product Manager..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Round Selection */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4 flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Step 2: Choose Interview Round</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROUNDS.map((round) => {
                const isSelected = selectedRound === round.id;
                const Icon = round.icon;

                return (
                  <div
                    key={round.id}
                    onClick={() => setSelectedRound(round.id)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all space-y-3 relative ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${round.avatarBg} flex items-center justify-center text-white font-black text-sm shadow-sm`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{round.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{round.role}</p>
                      </div>
                    </div>

                    <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {round.badge}
                    </span>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {round.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={startSession}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center space-x-3"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>Start Mock Interview</span>
            </button>
          </div>

        </div>
      ) : (
        /* ACTIVE INTERVIEW ROOM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interviewer Card & Answer Console (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Interviewer & Question Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm relative transition-colors duration-300">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${activeRoundObj.avatarBg} flex items-center justify-center text-white shadow-sm`}
                  >
                    <activeRoundObj.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeRoundObj.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Role: {jobRoleInput}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSessionActive(false)}
                  className="text-xs bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                >
                  Change Setup
                </button>
              </div>

              {/* Question Viewport */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Interviewer Question</span>
                  </span>

                  <button
                    onClick={handleSpeakQuestion}
                    disabled={isPlayingAudio || loadingQuestion}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg transition-all disabled:opacity-50"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-amber-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{isPlayingAudio ? 'Speaking...' : 'Listen Question'}</span>
                  </button>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[100px] flex items-center">
                  {loadingQuestion ? (
                    <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-xs">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Formulating realistic interview question...</span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      "{currentQuestion?.question}"
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Student Voice Answer Console */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm transition-colors duration-300">
              
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>Your Voice Answer</span>
                </h4>
                {isListening && (
                  <span className="text-[10px] bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    ● Recording Voice
                  </span>
                )}
              </div>

              {/* Big Mic Button */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <button
                  onClick={handleToggleRecord}
                  disabled={loadingQuestion || evaluating}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-800'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isListening ? 'Click mic to finish recording' : 'Click mic to speak your answer'}
                </p>
              </div>

              {/* Transcript / Text Input Area */}
              <div className="space-y-2">
                <textarea
                  value={studentAnswerText}
                  onChange={(e) => setStudentAnswerText(e.target.value)}
                  placeholder="Your recorded voice answer will transcribe here... Or type your answer directly."
                  rows={4}
                  disabled={evaluating}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Action Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleNextQuestionClick()}
                  disabled={loadingQuestion || evaluating}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Skip Question</span>
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={evaluating || !studentAnswerText.trim() || loadingQuestion}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {evaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Answer for Grading</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Scorecard & Feedback Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {scorecard ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm transition-colors duration-300">
                
                {/* Score & Grade Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Evaluation Scorecard
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{scorecard.score}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ 10</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-black px-4 py-1.5 rounded-2xl border ${
                        scorecard.score >= 8
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : scorecard.score >= 6
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      Grade: {scorecard.grade || 'B'}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  "{scorecard.summary}"
                </p>

                {/* Covered Concepts */}
                {scorecard.coveredConcepts && scorecard.coveredConcepts.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Key Concepts Covered</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {scorecard.coveredConcepts.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full"
                        >
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missed Concepts */}
                {scorecard.missedConcepts && scorecard.missedConcepts.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Missed / Incorrect Concepts</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {scorecard.missedConcepts.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full"
                        >
                          ✕ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tone Feedback */}
                {scorecard.toneFeedback && (
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
                      <Brain className="w-4 h-4" />
                      <span>Tone & Confidence Feedback</span>
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {scorecard.toneFeedback}
                    </p>
                  </div>
                )}

                {/* Model 10/10 Answer */}
                {scorecard.modelAnswer && (
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                      <Award className="w-4 h-4" />
                      <span>10/10 Model Reference Answer</span>
                    </h5>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {scorecard.modelAnswer}
                    </p>
                  </div>
                )}

                {/* Next Steps Buttons */}
                <div className="space-y-2 pt-2">
                  {scorecard.followupQuestion && (
                    <button
                      onClick={() => handleNextQuestionClick(true, scorecard.followupQuestion)}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Take Follow-up Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleNextQuestionClick()}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                  >
                    Next Mock Question
                  </button>
                </div>

              </div>
            ) : (
              /* Waiting for Evaluation Empty State */
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm transition-colors duration-300">
                <Award className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Evaluation Scorecard Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record your spoken answer on the left and submit to receive instant feedback and grade scores.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
