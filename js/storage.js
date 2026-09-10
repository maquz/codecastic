/**
 * CodeCastic Local Storage & Data Manager
 * Handles attempt tracking, custom question CRUD, persistence,
 * high score calculation, and JSON backup/restore.
 */

var STORAGE_KEYS = {
  QUESTIONS: "codecastic_questions_v1",
  ATTEMPTS: "codecastic_attempts_v1",
  ADMIN_PASS: "codecastic_admin_pass_v1",
  SETTINGS: "codecastic_settings_v1"
};

var StorageManager = {
  /**
   * Get all questions (custom storage or defaults)
   */
  getQuestions: function() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error loading custom questions from localStorage:", e);
    }
    return (typeof DEFAULT_QUESTIONS !== 'undefined' ? DEFAULT_QUESTIONS : (typeof window !== 'undefined' ? window.DEFAULT_QUESTIONS : []));
  },

  /**
   * Save questions list to localStorage
   */
  saveQuestions: function(questions) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      return true;
    } catch (e) {
      console.error("Failed to save questions to localStorage:", e);
      return false;
    }
  },

  /**
   * Reset question bank back to original default questions
   */
  resetQuestionsToDefault: function() {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      return DEFAULT_QUESTIONS;
    } catch (e) {
      console.error("Failed to reset questions:", e);
      return DEFAULT_QUESTIONS;
    }
  },

  /**
   * Add a new question to storage
   */
  addQuestion: function(newQ) {
    const list = this.getQuestions();
    newQ.id = 'codecastic_q_' + Date.now();
    list.unshift(newQ);
    this.saveQuestions(list);
    return newQ;
  },

  /**
   * Update an existing question by ID
   */
  updateQuestion: function(id, updatedData) {
    const list = this.getQuestions();
    const index = list.findIndex(q => q.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.saveQuestions(list);
      return true;
    }
    return false;
  },

  /**
   * Delete a question by ID
   */
  deleteQuestion: function(id) {
    let list = this.getQuestions();
    const initialLen = list.length;
    list = list.filter(q => q.id !== id);
    if (list.length < initialLen) {
      this.saveQuestions(list);
      return true;
    }
    return false;
  },

  /**
   * Get attempt history from localStorage
   */
  getAttemptHistory: function() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Error loading attempt history:", e);
      return [];
    }
  },

  /**
   * Save a completed exam attempt
   */
  saveAttempt: function(attemptRecord) {
    const history = this.getAttemptHistory();
    const record = {
      id: 'att_' + Date.now(),
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ...attemptRecord
    };
    history.unshift(record);
    // Keep last 100 attempts
    const trimmed = history.slice(0, 100);
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(trimmed));
    } catch (e) {
      console.error("Failed to save attempt record:", e);
    }
    return record;
  },

  /**
   * Clear all attempt history
   */
  clearHistory: function() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      return true;
    } catch (e) {
      console.error("Failed to clear history:", e);
      return false;
    }
  },

  /**
   * Get high scores and statistics grouped by rank
   */
  getStats: function() {
    const history = this.getAttemptHistory();
    if (history.length === 0) {
      return {
        totalAttempts: 0,
        overallBest: 0,
        passRate: 0,
        rankStats: {}
      };
    }

    const totalAttempts = history.length;
    const passes = history.filter(a => a.pass).length;
    const overallBest = history.reduce((max, a) => a.percentage > max ? a.percentage : max, 0);
    const passRate = Math.round((passes / totalAttempts) * 100);

    const rankStats = {};
    GES_RANKS.forEach(r => {
      const rankAttempts = history.filter(a => a.rankId === r.id);
      if (rankAttempts.length > 0) {
        const best = rankAttempts.reduce((max, a) => a.percentage > max ? a.percentage : max, 0);
        const avg = Math.round(rankAttempts.reduce((sum, a) => sum + a.percentage, 0) / rankAttempts.length);
        rankStats[r.id] = {
          count: rankAttempts.length,
          bestScore: best,
          avgScore: avg
        };
      }
    });

    return {
      totalAttempts,
      overallBest,
      passRate,
      rankStats
    };
  },

  /**
   * Export all CodeCastic data (Questions & History) as JSON string
   */
  exportJSON: function() {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      questions: this.getQuestions(),
      attempts: this.getAttemptHistory()
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from JSON string
   */
  importJSON: function(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        this.saveQuestions(parsed.questions);
      }
      if (parsed.attempts && Array.isArray(parsed.attempts)) {
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(parsed.attempts));
      }
      return { success: true, count: parsed.questions ? parsed.questions.length : 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Get Admin passcode (defaults to 'admin123')
   */
  getAdminPasscode: function() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS);
      return saved || "admin123";
    } catch (e) {
      return "admin123";
    }
  },

  /**
   * Verify entered Admin passcode
   */
  verifyAdminPasscode: function(inputPass) {
    return inputPass === this.getAdminPasscode();
  },

  /**
   * Update Admin passcode
   */
  setAdminPasscode: function(newPass) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
      return true;
    } catch (e) {
      console.error("Failed to update admin passcode:", e);
      return false;
    }
  }
};

if (typeof window !== 'undefined') {
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.StorageManager = StorageManager;
}
