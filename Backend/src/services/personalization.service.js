const User = require('../models/User');
const mongoose = require('mongoose');

// In-memory profile cache fallback
const profileCache = new Map();

/**
 * Checks whether MongoDB is connected
 * @returns {boolean}
 */
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Fetches user profile by userId.
 * 
 * @param {string} userId - User identifier
 * @returns {Promise<Object|null>} User profile object or null
 */
async function getUserProfile(userId) {
  if (!userId) return null;

  try {
    if (isDbConnected()) {
      const userDoc = await User.findOne({ userId: String(userId) }).exec();
      if (userDoc) {
        return userDoc.toObject();
      }
    } else {
      return profileCache.get(String(userId)) || null;
    }
  } catch (error) {
    console.error('[Personalization Service Error - getUserProfile]:', error.message || error);
  }

  return profileCache.get(String(userId)) || null;
}

/**
 * Creates or updates user profile in database or fallback cache.
 * 
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile details
 * @returns {Promise<Object>} Updated profile
 */
async function upsertUserProfile(userId, profileData = {}) {
  if (!userId) {
    throw new Error('userId is required to save user profile.');
  }

  const payload = {
    userId: String(userId),
    name: profileData.name || 'Student',
    email: profileData.email || '',
    preferredLanguage: profileData.preferredLanguage || 'en',
    department: profileData.department || '',
    semester: profileData.semester || '',
    learningGoal: profileData.learningGoal || '',
    interests: Array.isArray(profileData.interests) ? profileData.interests : [],
  };

  try {
    if (isDbConnected()) {
      const updated = await User.findOneAndUpdate(
        { userId: String(userId) },
        { $set: payload },
        { upsert: true, returnDocument: 'after' }
      ).exec();
      return updated.toObject();
    }
  } catch (error) {
    console.error('[Personalization Service Error - upsertUserProfile]:', error.message || error);
  }

  profileCache.set(String(userId), payload);
  return payload;
}

/**
 * Constructs personalized system prompt instructions using user profile details.
 * 
 * @param {Object|null} profile - User profile object
 * @returns {string} Personalization system instruction string
 */
function buildPersonalizedInstruction(profile) {
  if (!profile || typeof profile !== 'object' || !profile.name) {
    return '';
  }

  const name = profile.name;
  const dept = profile.department ? `Department: ${profile.department}` : '';
  const sem = profile.semester ? `Semester: ${profile.semester}` : '';
  const goal = profile.learningGoal ? `Learning Goal: ${profile.learningGoal}` : '';
  const interests = Array.isArray(profile.interests) && profile.interests.length > 0
    ? `Interests: ${profile.interests.join(', ')}`
    : '';

  const academicInfo = [dept, sem, goal, interests].filter(Boolean).join(' | ');

  return `
[PERSONALIZATION CONTEXT]:
The user's name is ${name}.${academicInfo ? ` Profile Info: [${academicInfo}].` : ''}

AI PERSONALIZATION RULES:
- Address the user warmly as ${name}.
- Tailor explanations, complexity level, and real-world examples specifically for a ${profile.department || 'general'} student (${profile.semester || 'undergraduate'}).
- Relate concepts directly to their learning goal (${profile.learningGoal || 'academic mastery'}).
- Maintain an encouraging, structured, and personalized guide tone.`.trim();
}

module.exports = {
  getUserProfile,
  upsertUserProfile,
  buildPersonalizedInstruction,
};
