import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Volume2, VolumeX, Trash2, ShieldCheck, Copy, Check, Mic } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useVoicePlayer } from '../hooks/useVoicePlayer';
import VoicePlayer from '../components/VoicePlayer';

export default function ChatPage() {
  const { userId, language, profile, showToast } = useUser();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am your AI Virtual Guide. ${
        profile ? `Welcome back, ${profile.name}!` : 'Configure your student profile to receive customized guidance.'
      } How can I assist you with your studies or career today?`,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [promptType, setPromptType] = useState('general');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const messagesEndRef = useRef(null);

  // Custom Speech Hooks
  const {
    isListening,
    transcript,
    interimTranscript,
    error: sttError,
    isSupported: isSttSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    isPlaying,
    isMuted,
    audioUrl,
    playAudio,
    stopAudio,
    replayAudio,
    toggleMute,
  } = useVoicePlayer();

  // Scroll message list to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, loading]);

  // Handle finished speech input
  useEffect(() => {
    if (transcript && transcript.trim().length > 0 && !isListening) {
      handleSend(transcript.trim());
      resetTranscript();
    }
  }, [transcript, isListening]);

  // STT Error handling
  useEffect(() => {
    if (sttError) {
      showToast(sttError, 'error');
    }
  }, [sttError]);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      if (!userId) return;
      try {
        const res = await getChatHistory(userId);
        if (res.success && res.history && res.history.length > 0) {
          const loadedMessages = res.history.map((msg, idx) => ({
            id: `history_${idx}_${Date.now()}`,
            role: msg.role === 'user' ? 'user' : 'assistant',
            text: msg.text,
          }));
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }
    loadHistory();
  }, [userId]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    stopAudio();
    setInputMessage('');

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChatMessage({
        message: text,
        userId: userId,
        sessionId: sessionId,
        type: promptType,
        language: language,
        voiceEnabled: voiceEnabled,
      });

      if (data && data.success && data.response) {
        const aiMsg = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: data.response,
          audioUrl: data.audioContent,
          personalized: data.personalized,
          userProfile: data.userProfile,
          language: data.language || language,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (voiceEnabled && data.audioContent) {
          playAudio(data.audioContent);
        }
      } else {
        throw new Error(data?.error || 'Failed to receive reply from AI service.');
      }
    } catch (err) {
      console.error('Chat error:', err);
      showToast(err.message || 'Error communicating with AI backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied text to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory(userId);
      setMessages([
        {
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          text: 'Chat history reset. Ask me a question!',
        },
      ]);
      stopAudio();
      showToast('Conversation cleared', 'info');
    } catch (err) {
      console.error('Failed to clear history:', err);
      showToast('Failed to clear conversation history', 'error');
    }
  };

  const promptTypes = [
    { id: 'general', label: 'General Guide' },
    { id: 'academic', label: 'Academic Help' },
    { id: 'career', label: 'Career Advisor' },
    { id: 'study_plan', label: 'Study Planner' },
  ];

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex flex-col justify-between space-y-4">
      
      {/* Top Header & Control Toolbar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors duration-300">
        
        {/* Prompt Modes Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-1 hidden sm:inline">
            Mode:
          </span>
          {promptTypes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPromptType(mode.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                promptType === mode.id
                  ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Action Widgets */}
        <div className="flex items-center space-x-3">
          {/* Voice Response Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              voiceEnabled
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
            }`}
            title="Toggle AI voice audio response"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />}
            <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Voice Equalizer Player Widget */}
          <VoicePlayer
            isPlaying={isPlaying}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onReplay={replayAudio}
            hasAudio={!!audioUrl}
          />

          {/* Reset Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border border-slate-200 dark:border-slate-800"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Messages Scrolling Viewport */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner transition-colors duration-300">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[78%] p-4 sm:p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Message Metadata Header */}
              <div className="flex items-center justify-between mb-2.5 text-[10px] font-semibold uppercase tracking-wider opacity-80 border-b border-slate-200/50 dark:border-slate-700/50 pb-2">
                <span className="flex items-center space-x-1.5">
                  {msg.role === 'user' ? (
                    <>
                      <UserIcon className="w-3 h-3 text-blue-200" />
                      <span className="text-blue-100">You</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span className="font-bold text-blue-600 dark:text-blue-400">Virtual Guide AI</span>
                    </>
                  )}
                </span>

                <div className="flex items-center space-x-2">
                  {msg.personalized && (
                    <span className="flex items-center space-x-1 text-[9px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full lowercase">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Personalized</span>
                    </span>
                  )}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 text-slate-400 dark:text-slate-500"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                  {msg.audioUrl && (
                    <button
                      onClick={() => playAudio(msg.audioUrl)}
                      className="hover:underline flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-[10px] font-bold"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Play Voice</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Interim STT Live Transcript */}
        {interimTranscript && (
          <div className="flex flex-col items-end">
            <div className="max-w-[75%] p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs italic animate-pulse shadow-sm">
              Listening: "{interimTranscript}..."
            </div>
          </div>
        )}

        {/* AI Thinking Spinner */}
        {loading && (
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl w-max shadow-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              AI is reasoning & synthesizing response...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Chat Input Bar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-sm space-y-3 transition-colors duration-300">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? 'Listening... Speak into your microphone' : 'Ask any academic question, study advice, or career topic...'}
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
          />

          {/* Mic Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (isListening) {
                stopListening();
              } else {
                stopAudio();
                startListening(language);
              }
            }}
            disabled={loading || !isSttSupported}
            className={`p-3.5 rounded-2xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            title={isListening ? 'Stop Listening' : 'Voice Input'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Bottom Pro Tip Bar */}
        <div className="flex items-center justify-end px-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Active User: <strong className="text-blue-600 dark:text-blue-400">{profile ? profile.name : userId}</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
