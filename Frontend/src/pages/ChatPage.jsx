import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Volume2, VolumeX, Trash2, ShieldCheck, Copy, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { sendChatMessage } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useVoicePlayer } from '../hooks/useVoicePlayer';
import VoiceInput from '../components/VoiceInput';
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

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: 'Chat history reset. Ask me a question!',
      },
    ]);
    stopAudio();
    showToast('Conversation cleared', 'info');
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
      <div className="bg-white border border-slate-200 rounded-3xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
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
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
            title="Toggle AI voice audio response"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
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
            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors border border-slate-200"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Messages Scrolling Viewport */}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[78%] p-4 sm:p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              {/* Message Metadata Header */}
              <div className="flex items-center justify-between mb-2.5 text-[10px] font-semibold uppercase tracking-wider opacity-80 border-b border-slate-200/50 pb-2">
                <span className="flex items-center space-x-1.5">
                  {msg.role === 'user' ? (
                    <>
                      <UserIcon className="w-3 h-3 text-blue-200" />
                      <span className="text-blue-100">You</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-blue-600">Virtual Guide AI</span>
                    </>
                  )}
                </span>

                <div className="flex items-center space-x-2">
                  {msg.personalized && (
                    <span className="flex items-center space-x-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full lowercase">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Personalized</span>
                    </span>
                  )}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-blue-600 transition-colors p-1 text-slate-400"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                  {msg.audioUrl && (
                    <button
                      onClick={() => playAudio(msg.audioUrl)}
                      className="hover:underline flex items-center space-x-1 text-blue-600 text-[10px] font-bold"
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
            <div className="max-w-[75%] p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs italic animate-pulse shadow-sm">
              Listening: "{interimTranscript}..."
            </div>
          </div>
        )}

        {/* AI Thinking Spinner */}
        {loading && (
          <div className="flex items-center space-x-3 bg-white border border-slate-200 p-4 rounded-2xl w-max shadow-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-600">
              AI is reasoning & synthesizing response...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Chat Input Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-3 sm:p-4 shadow-sm space-y-3">
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
            className="flex-1 bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Bottom Mic & Pro Tip Bar */}
        <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-100">
          <VoiceInput
            isListening={isListening}
            onStart={() => {
              stopAudio();
              startListening(language);
            }}
            onStop={stopListening}
            disabled={loading || !isSttSupported}
          />

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Active User: <strong className="text-blue-600">{profile ? profile.name : userId}</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
