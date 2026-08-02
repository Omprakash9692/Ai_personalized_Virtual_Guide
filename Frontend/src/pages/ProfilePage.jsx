import React, { useState, useEffect } from 'react';
import { User, Save, ShieldCheck, Sparkles, GraduationCap, BookOpen, Key, Mail, CheckCircle2, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function ProfilePage() {
  const { userId, setUserId, profile, saveProfile, loadingProfile, language, setLanguage, showToast, logout } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    semester: 'Semester 6',
    learningGoal: 'Artificial Intelligence & Web Development',
    interests: 'Machine Learning, React, Node.js, Cloud Computing',
  });

  // Populate form with existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        department: profile.department || 'Computer Science & Engineering',
        semester: profile.semester || 'Semester 6',
        learningGoal: profile.learningGoal || 'Artificial Intelligence & Web Development',
        interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    const payload = {
      ...formData,
      preferredLanguage: language,
      interests: formData.interests.split(',').map((i) => i.trim()).filter(Boolean),
    };

    const success = await saveProfile(payload);
    if (success) {
      showToast('Profile updated & synchronized with AI model!', 'success');
    }
  };

  return (
    <div className="flex-1 space-y-6 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Student Profile & Personalization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure your academic context to receive personalized AI responses</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-bold w-max">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Memory Synced</span>
          </div>
        </div>
      </div>

      {/* Main Settings Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors duration-300">
        
        {/* Account Sync Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>User Account ID:</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unique identifier for multi-turn history & preferences in MongoDB.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. student_1"
              readOnly
            />
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rahul@university.edu"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Academic Details Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>Academic Background</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Department / Branch
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-medium transition-colors"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Business Administration (MBA)">Business Administration (MBA)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Current Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-medium transition-colors"
              >
                <option value="Semester 1 (1st Year)">Semester 1 (1st Year)</option>
                <option value="Semester 2 (1st Year)">Semester 2 (1st Year)</option>
                <option value="Semester 3 (2nd Year)">Semester 3 (2nd Year)</option>
                <option value="Semester 4 (2nd Year)">Semester 4 (2nd Year)</option>
                <option value="Semester 5 (3rd Year)">Semester 5 (3rd Year)</option>
                <option value="Semester 6 (3rd Year)">Semester 6 (3rd Year)</option>
                <option value="Semester 7 (4th Year)">Semester 7 (4th Year)</option>
                <option value="Semester 8 (4th Year)">Semester 8 (4th Year)</option>
                <option value="Postgraduate / Master's">Postgraduate / Master's</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals & Interests Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>Learning Goals & Focus Areas</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Primary Learning Goal
              </label>
              <input
                type="text"
                name="learningGoal"
                value={formData.learningGoal}
                onChange={handleChange}
                placeholder="e.g. Master Machine Learning algorithms & web development"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Technical Interests (comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g. Python, React, Deep Learning, Cloud Systems"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Preferred Language for AI Guidance
          </label>
          <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'Hindi (हिंदी)' },
              { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
            ].map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  language === l.code
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loadingProfile}
          className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
        >
          {loadingProfile ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Profile to Database...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save & Synchronize Profile</span>
            </>
          )}
        </button>

      </form>

      {/* Account Session & Logout Action */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Session</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign out of your active student session on this device.</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

    </div>
  );
}
