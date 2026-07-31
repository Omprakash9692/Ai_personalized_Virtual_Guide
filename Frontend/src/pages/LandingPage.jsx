import React, { useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Globe, 
  Mic, 
  FileText, 
  BookOpen, 
  Code, 
  Database, 
  Server, 
  Zap, 
  Layers, 
  Cpu
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage({ onNavigateToAuth }) {
  const { theme, toggleTheme } = useTheme();

  // Force dark mode on landing page for the premium look
  useEffect(() => {
    if (theme !== 'dark') {
      toggleTheme(); // This toggles it, but a better way is setting it, assuming toggle works for now
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    {
      title: 'Personalized AI',
      description: 'Our neural architecture maps your unique preferences and learning style to deliver context-aware responses that evolve as you do.',
      icon: Brain,
    },
    {
      title: 'Memory Chat',
      description: 'Perfect continuity across sessions. The AI remembers past contexts and nuanced details.',
      icon: MessageSquare,
    },
    {
      title: 'Multilingual Support',
      description: 'Fluent in over 100 languages with native-level cultural nuance and professional terminology.',
      icon: Globe,
    },
    {
      title: 'Voice Assistant',
      description: 'Ultra-low latency speech recognition and natural synthesis for hands-free productivity.',
      icon: Mic,
    },
    {
      title: 'Document Q&A',
      description: 'Upload PDFs, docs, or spreadsheets. The guide parses complex data and answers queries with instant citation accuracy.',
      icon: FileText,
    },
    {
      title: 'Study Guide',
      description: 'Generate curriculum and flashcards tailored to your specific academic or professional goals.',
      icon: BookOpen,
    }
  ];

  const techStack = [
    { name: 'REACT', icon: Code },
    { name: 'NODE.JS', icon: Server },
    { name: 'MONGODB', icon: Database },
    { name: 'GEMINI', icon: Zap },
    { name: 'LANGCHAIN', icon: Layers },
    { name: 'VECTOR DB', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">Aether AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onNavigateToAuth(false)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Login
          </button>
          <button onClick={() => onNavigateToAuth(true)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-full transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]">
            Get Started
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative">
        
        {/* Ambient Glow behind hero */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="space-y-8 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Next-Gen Intelligence</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            AI Personalized <br className="hidden lg:block" />
            Virtual Guide
          </h1>
          
          <p className="text-base lg:text-lg text-slate-400 leading-relaxed max-w-lg">
            Your intelligent, multilingual assistant with memory, voice interaction, and document-based learning. Experience a new era of cognitive assistance.
          </p>

          <div className="flex items-center space-x-4 pt-4">
            <button onClick={() => onNavigateToAuth(true)} className="px-8 py-4 bg-indigo-200 hover:bg-indigo-300 text-indigo-950 font-extrabold rounded-2xl transition-colors">
              Get Started
            </button>
            <button onClick={() => onNavigateToAuth(false)} className="px-8 py-4 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-white font-bold rounded-2xl transition-all">
              Login
            </button>
          </div>
        </div>

        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900/50 p-2 border border-slate-800/80 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-3xl -z-10"></div>
            <img 
              src="/hero_ai_robot.png" 
              alt="AI Virtual Guide Robot" 
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>
        </div>
      </main>

      <section className="bg-[#0D111A] py-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-white">Unmatched Capabilities</h2>
            <p className="text-sm text-slate-400">
              Precision engineering meets neural processing. Our virtual guide adapts to your specific workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-[#121826] border border-slate-800 hover:border-indigo-500/50 p-8 rounded-3xl transition-all duration-300 group shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="w-12 h-12 bg-slate-800/80 group-hover:bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-3">{feat.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0A0D14] border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-2">
             <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">The Engine Room</span>
             <h2 className="text-2xl font-bold text-white">Forged in Cutting-Edge Tech</h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {techStack.map((tech, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#121826] border border-slate-800 flex items-center justify-center text-slate-400">
                  <tech.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-bold tracking-wider text-slate-500">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="bg-gradient-to-b from-[#121826] to-[#0A0D14] border border-slate-800 p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden">
            {/* Glow inside CTA */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white">Start Your Journey Today</h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Join 50,000+ professionals and students who are augmenting their intelligence with Aether AI.
              </p>
              <div className="pt-8">
                <button onClick={() => onNavigateToAuth(true)} className="px-10 py-4 bg-indigo-200 hover:bg-indigo-300 text-indigo-950 font-extrabold rounded-2xl transition-colors shadow-[0_0_30px_rgba(199,210,254,0.1)]">
                  Initialize Core Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
