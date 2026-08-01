import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth, getUserProfile as apiGetUserProfile, saveUserProfile as apiSaveUserProfile, loginUser, registerUser, googleLoginUser } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('vg_token') || null);
  const [userId, setUserId] = useState(() => localStorage.getItem('vg_userId') || null);
  const [language, setLanguageState] = useState(() => localStorage.getItem('vg_language') || 'en');
  const [profile, setProfile] = useState(null);
  
  const [isHealthOk, setIsHealthOk] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  const isAuthenticated = !!authToken;

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('vg_language', lang);
  };

  // Check Backend health on load
  useEffect(() => {
    const verifyBackend = async () => {
      const res = await checkHealth();
      if (res && res.status === 'OK') {
        setIsHealthOk(true);
      } else {
        setIsHealthOk(false);
      }
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user profile whenever userId changes and we are authenticated
  useEffect(() => {
    if (!userId || !isAuthenticated) {
      setProfile(null);
      return;
    }
    
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await apiGetUserProfile(userId);
        if (res && res.success && res.profile) {
          setProfile(res.profile);
          if (res.profile.preferredLanguage) {
            setLanguageState(res.profile.preferredLanguage);
            localStorage.setItem('vg_language', res.profile.preferredLanguage);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        // Profile not created yet for this userId — 404 is expected, ignore silently
        if (err?.response?.status !== 404) {
          console.warn('[UserContext] Unexpected error loading profile:', err.message);
        }
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [userId, isAuthenticated]);

  const saveProfile = async (profileData) => {
    setLoadingProfile(true);
    try {
      const fullData = { ...profileData, userId };
      const res = await apiSaveUserProfile(fullData);
      if (res && res.success) {
        setProfile(res.profile);
        showToast('Profile saved & synchronized with AI model!', 'success');
        return true;
      }
      throw new Error(res.error || 'Failed to save profile');
    } catch (err) {
      showToast(err.message || 'Error saving profile', 'error');
      return false;
    } finally {
      setLoadingProfile(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        setAuthToken(res.token);
        setUserId(res.user.userId);
        localStorage.setItem('vg_token', res.token);
        localStorage.setItem('vg_userId', res.user.userId);
        showToast('Logged in successfully', 'success');
        return true;
      }
      throw new Error(res.error || 'Login failed');
    } catch (err) {
      showToast(err?.response?.data?.error || err.message || 'Error logging in', 'error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await registerUser({ name, email, password });
      if (res.success) {
        setAuthToken(res.token);
        setUserId(res.user.userId);
        localStorage.setItem('vg_token', res.token);
        localStorage.setItem('vg_userId', res.user.userId);
        showToast('Registered successfully', 'success');
        return true;
      }
      throw new Error(res.error || 'Registration failed');
    } catch (err) {
      showToast(err?.response?.data?.error || err.message || 'Error registering', 'error');
      return false;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const res = await googleLoginUser({ credential });
      if (res.success) {
        setAuthToken(res.token);
        setUserId(res.user.userId);
        localStorage.setItem('vg_token', res.token);
        localStorage.setItem('vg_userId', res.user.userId);
        showToast('Signed in with Google successfully', 'success');
        return true;
      }
      throw new Error(res.error || 'Google login failed');
    } catch (err) {
      showToast(err?.response?.data?.error || err.message || 'Error signing in with Google', 'error');
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUserId(null);
    setProfile(null);
    localStorage.removeItem('vg_token');
    localStorage.removeItem('vg_userId');
    showToast('Logged out successfully', 'info');
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        language,
        setLanguage,
        profile,
        saveProfile,
        loadingProfile,
        isHealthOk,
        toastMessage,
        showToast,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
