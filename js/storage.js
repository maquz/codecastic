/**
 * CodeCastic Local Storage & Data Manager
 * Handles attempt tracking, custom question CRUD, persistence,
 * high score calculation, and JSON backup/restore.
 */

var GHANA_REGIONS = [
  "Ahafo Region",
  "Ashanti Region",
  "Bono Region",
  "Bono East Region",
  "Central Region",
  "Eastern Region",
  "Greater Accra Region",
  "North East Region",
  "Northern Region",
  "Oti Region",
  "Savannah Region",
  "Upper East Region",
  "Upper West Region",
  "Volta Region",
  "Western Region",
  "Western North Region"
];

var STORAGE_KEYS = {
  QUESTIONS: "codecastic_questions_v1",
  ATTEMPTS: "codecastic_attempts_v1",
  ADMIN_PASS: "codecastic_admin_pass_v1",
  SETTINGS: "codecastic_settings_v1",
  CANDIDATE: "codecastic_candidate_profile_v1",
  CANDIDATE_ACCOUNTS: "codecastic_candidate_accounts_v1"
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
      } else if (Array.isArray(parsed)) {
        // Direct array of question objects
        this.saveQuestions(parsed);
        return { success: true, count: parsed.length };
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
   * Generate downloadable CSV template
   */
  generateCSVTemplate: function() {
    return `Level,Category,Question,Option A,Option B,Option C,Option D,Correct Option,Explanation
AD_II,Educational Law & Policy,"Under Act 1023, which body is legally empowered to license teachers in Ghana?",NaCCA,National Teaching Council (NTC),NaSIA,GESC,B,"Act 1023 established the NTC to regulate and issue teaching licenses in Ghana."
AD_I,Financial Regulations,"Who serves as the Covered Entity Head in a Senior High School under Act 921?",Assistant Headmaster,Headmaster / Headmistress,School Bursar,PTA Chairman,B,"Act 921 designates the Headmaster/Headmistress as the chief accounting officer."
DD,Educational Governance,"Which statutory committee oversees basic education delivery at the district level?",District Education Oversight Committee (DEOC),NAGRAT,CHASS,WAEC,A,"The DEOC manages educational policy implementation and monitoring at the district level."
DIR_II,Executive Leadership,"The Free SHS policy incorporates which constitutional directive principle?",Article 25(1)(b),Article 106,Article 190,Article 210,A,"Article 25(1)(b) mandates that secondary education shall be made progressively free."`;
  },

  /**
   * Generate downloadable JSON template
   */
  generateJSONTemplate: function() {
    const template = [
      {
        level: "AD_II",
        levelName: "Assistant Director II",
        category: "Educational Law & Policy",
        q: "Under Act 1023, which body is legally empowered to license teachers in Ghana?",
        options: [
          "NaCCA",
          "National Teaching Council (NTC)",
          "NaSIA",
          "GESC"
        ],
        correct: 1,
        explanation: "Act 1023 established the NTC to regulate and issue teaching licenses in Ghana."
      },
      {
        level: "AD_I",
        levelName: "Assistant Director I",
        category: "Financial Regulations",
        q: "Who serves as the Covered Entity Head in a Senior High School under Act 921?",
        options: [
          "Assistant Headmaster",
          "Headmaster / Headmistress",
          "School Bursar",
          "PTA Chairman"
        ],
        correct: 1,
        explanation: "Act 921 designates the Headmaster/Headmistress as the chief accounting officer."
      }
    ];
    return JSON.stringify(template, null, 2);
  },

  /**
   * Parse CSV line handling quoted fields
   */
  parseCSVLine: function(text) {
    const p = [''];
    let idx = 0;
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          p[idx] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        idx++;
        p.push('');
      } else {
        p[idx] += c;
      }
    }
    return p.map(s => s.trim());
  },

  /**
   * Import questions from CSV string
   */
  importCSV: function(csvText) {
    try {
      const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        return { success: false, error: "CSV file is empty or missing data rows." };
      }

      const rankMap = {
        "AD_II": "Assistant Director II",
        "AD_I": "Assistant Director I",
        "DD": "Deputy Director",
        "DIR_II": "Director II"
      };

      const newQuestions = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.parseCSVLine(lines[i]);
        if (cols.length < 8) continue;

        const rawLevel = cols[0].toUpperCase().replace(/\s+/g, "_");
        const level = rankMap[rawLevel] ? rawLevel : "AD_II";
        const levelName = rankMap[level] || "Assistant Director II";
        const category = cols[1] || "GES Administration";
        const questionText = cols[2];
        const optA = cols[3];
        const optB = cols[4];
        const optC = cols[5];
        const optD = cols[6];

        let correctIdx = 0;
        const rawCorrect = (cols[7] || "").trim().toUpperCase();
        if (rawCorrect === "A" || rawCorrect === "0") correctIdx = 0;
        else if (rawCorrect === "B" || rawCorrect === "1") correctIdx = 1;
        else if (rawCorrect === "C" || rawCorrect === "2") correctIdx = 2;
        else if (rawCorrect === "D" || rawCorrect === "3") correctIdx = 3;

        const explanation = cols[8] || "GES promotion assessment reference.";

        if (questionText && optA && optB && optC && optD) {
          newQuestions.push({
            id: 'codecastic_q_' + Date.now() + '_' + i,
            level: level,
            levelName: levelName,
            category: category,
            q: questionText,
            options: [optA, optB, optC, optD],
            correct: correctIdx,
            explanation: explanation
          });
        }
      }

      if (newQuestions.length === 0) {
        return { success: false, error: "No valid question rows found in CSV." };
      }

      const existing = this.getQuestions();
      const updatedList = [...newQuestions, ...existing];
      this.saveQuestions(updatedList);

      return { success: true, count: newQuestions.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Generate downloadable Microsoft Word Document (.doc) template
   */
  generateWordTemplate: function() {
    return `====================================================================
  CODECASTIC - GHANA EDUCATION SERVICE PROMOTION QUESTION TEMPLATE
====================================================================
Instructions for Administrators:
1. Fill in your questions following the structured blocks below.
2. Separate each question with three dashes: ---
3. Valid Ranks: AD_II (Assistant Director II), AD_I (Assistant Director I), DD (Deputy Director), DIR_II (Director II).
4. Correct choices: A, B, C, or D.

---

Rank: AD_II
Category: Educational Law & Policy
Question: Under Act 1023, which body is legally empowered to license professional teachers in Ghana?
A) National Council for Curriculum and Assessment (NaCCA)
B) National Teaching Council (NTC)
C) National Inspectorate Authority (NaSIA)
D) Ghana Education Service Council (GESC)
Correct: B
Explanation: Act 1023 established the NTC to regulate and issue teaching licenses in Ghana.

---

Rank: AD_I
Category: Financial Regulations
Question: Who serves as the Covered Entity Head in a Senior High School under Act 921?
A) Assistant Headmaster
B) Headmaster / Headmistress
C) School Bursar
D) PTA Chairman
Correct: B
Explanation: Act 921 designates the Headmaster/Headmistress as the chief accounting officer.

---

Rank: DD
Category: Educational Governance
Question: Which statutory committee oversees basic education delivery at the district level?
A) District Education Oversight Committee (DEOC)
B) NAGRAT
C) CHASS
D) WAEC
Correct: A
Explanation: The DEOC manages educational policy implementation and monitoring at the district level.

---

Rank: DIR_II
Category: Executive Leadership
Question: The Free SHS policy incorporates which constitutional directive principle?
A) Article 25(1)(b) of the 1992 Constitution
B) Article 106
C) Article 190
D) Article 210
Correct: A
Explanation: Article 25(1)(b) mandates that secondary education shall be made progressively free.
`;
  },

  /**
   * Extract clean text from Word (.docx/.doc) or text content
   */
  extractTextFromWordContent: function(rawContent) {
    if (typeof rawContent !== "string") return "";
    
    // If rawContent contains Word XML tags (<w:t>), extract text inside <w:t> tags
    if (rawContent.includes("<w:t") || rawContent.includes("<w:p")) {
      const paragraphs = [];
      const pMatches = rawContent.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/gi);
      if (pMatches) {
        pMatches.forEach(pXml => {
          const tMatches = pXml.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
          if (tMatches) {
            const pText = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
            paragraphs.push(pText);
          }
        });
        return paragraphs.join('\n');
      }
      return rawContent.replace(/<w:t[^>]*>(.*?)<\/w:t>/gi, '$1\n').replace(/<[^>]+>/g, '');
    }
    
    return rawContent;
  },

  /**
   * Import questions from Microsoft Word / Text Document
   */
  importWordDocument: function(rawContent) {
    try {
      const plainText = this.extractTextFromWordContent(rawContent);
      const blocks = plainText.split(/(?:---|(?=Rank:)|(?=Level:))/i).map(b => b.trim()).filter(b => b.length > 20);

      const rankMap = {
        "AD_II": "Assistant Director II",
        "AD_I": "Assistant Director I",
        "DD": "Deputy Director",
        "DIR_II": "Director II",
        "ASSISTANT_DIRECTOR_II": "Assistant Director II",
        "ASSISTANT_DIRECTOR_I": "Assistant Director I",
        "DEPUTY_DIRECTOR": "Deputy Director",
        "DIRECTOR_II": "Director II"
      };

      const newQuestions = [];

      blocks.forEach((block, idx) => {
        const lines = block.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        
        let level = "AD_II";
        let category = "GES Administration";
        let questionText = "";
        let optA = "", optB = "", optC = "", optD = "";
        let correctIdx = 0;
        let explanation = "GES promotion assessment reference.";

        lines.forEach(line => {
          const lower = line.toLowerCase();
          
          if (lower.startsWith("rank:") || lower.startsWith("level:")) {
            const val = line.substring(line.indexOf(":") + 1).trim().toUpperCase().replace(/\s+/g, "_");
            if (rankMap[val]) level = val;
            else if (val.includes("AD_I") || val.includes("ASSISTANT_DIRECTOR_I")) level = "AD_I";
            else if (val.includes("AD_II") || val.includes("ASSISTANT_DIRECTOR_II")) level = "AD_II";
            else if (val.includes("DD") || val.includes("DEPUTY")) level = "DD";
            else if (val.includes("DIR") || val.includes("DIRECTOR")) level = "DIR_II";
          } else if (lower.startsWith("category:") || lower.startsWith("topic:")) {
            category = line.substring(line.indexOf(":") + 1).trim();
          } else if (lower.startsWith("question:") || lower.startsWith("q:")) {
            questionText = line.substring(line.indexOf(":") + 1).trim();
          } else if (lower.startsWith("a)") || lower.startsWith("a.") || lower.startsWith("option a:")) {
            optA = line.replace(/^(a\)|a\.|option a:)/i, "").trim();
          } else if (lower.startsWith("b)") || lower.startsWith("b.") || lower.startsWith("option b:")) {
            optB = line.replace(/^(b\)|b\.|option b:)/i, "").trim();
          } else if (lower.startsWith("c)") || lower.startsWith("c.") || lower.startsWith("option c:")) {
            optC = line.replace(/^(c\)|c\.|option c:)/i, "").trim();
          } else if (lower.startsWith("d)") || lower.startsWith("d.") || lower.startsWith("option d:")) {
            optD = line.replace(/^(d\)|d\.|option d:)/i, "").trim();
          } else if (lower.startsWith("correct:") || lower.startsWith("answer:") || lower.startsWith("correct option:")) {
            const ansVal = line.substring(line.indexOf(":") + 1).trim().toUpperCase();
            if (ansVal.includes("A") || ansVal === "0") correctIdx = 0;
            else if (ansVal.includes("B") || ansVal === "1") correctIdx = 1;
            else if (ansVal.includes("C") || ansVal === "2") correctIdx = 2;
            else if (ansVal.includes("D") || ansVal === "3") correctIdx = 3;
          } else if (lower.startsWith("explanation:") || lower.startsWith("rationale:")) {
            explanation = line.substring(line.indexOf(":") + 1).trim();
          } else if (!questionText && !line.includes(":") && line.length > 10) {
            questionText = line;
          }
        });

        const levelName = rankMap[level] || "Assistant Director II";

        if (questionText && optA && optB && optC && optD) {
          newQuestions.push({
            id: 'codecastic_q_word_' + Date.now() + '_' + idx,
            level: level,
            levelName: levelName,
            category: category,
            q: questionText,
            options: [optA, optB, optC, optD],
            correct: correctIdx,
            explanation: explanation
          });
        }
      });

      if (newQuestions.length === 0) {
        return { success: false, error: "No structured question blocks found in the Word document. Please follow the Word template format." };
      }

      const existing = this.getQuestions();
      const updatedList = [...newQuestions, ...existing];
      this.saveQuestions(updatedList);

      return { success: true, count: newQuestions.length };
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
  },

  /**
   * Get Candidate Registration Profile
   */
  getCandidateProfile: function() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Save Candidate Registration Profile
   */
  saveCandidateProfile: function(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.CANDIDATE, JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error("Failed to save candidate profile:", e);
      return false;
    }
  },

  /**
   * Clear Candidate Profile (Log out candidate)
   */
  clearCandidateProfile: function() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CANDIDATE);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get all registered candidate accounts
   */
  getCandidateAccounts: function() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATE_ACCOUNTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Register a new candidate account or update existing by email
   */
  registerCandidateAccount: function(accountData) {
    try {
      const accounts = this.getCandidateAccounts();
      const cleanEmail = (accountData.email || "").toLowerCase().trim();
      const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);
      
      const updatedAccount = {
        ...accountData,
        email: cleanEmail,
        registeredAt: Date.now()
      };

      if (existingIdx !== -1) {
        accounts[existingIdx] = updatedAccount;
      } else {
        accounts.push(updatedAccount);
      }

      localStorage.setItem(STORAGE_KEYS.CANDIDATE_ACCOUNTS, JSON.stringify(accounts));
      this.saveCandidateProfile(updatedAccount);
      return { success: true, account: updatedAccount };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Log in candidate with Email and Password
   */
  loginCandidate: function(email, password) {
    const accounts = this.getCandidateAccounts();
    const cleanEmail = (email || "").toLowerCase().trim();
    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);
    
    if (found) {
      this.saveCandidateProfile(found);
      return { success: true, account: found };
    }
    return { success: false, error: "Invalid Email Address or Password. Please check your details." };
  },

  /**
   * Recover Candidate Password via Email & Registered Ghana Region
   */
  recoverCandidatePassword: function(email, region) {
    const accounts = this.getCandidateAccounts();
    const cleanEmail = (email || "").toLowerCase().trim();
    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.region === region);
    
    if (found) {
      return { success: true, password: found.password, name: found.name };
    }
    return { success: false, error: "No candidate account found matching this Email Address and Ghana Region." };
  }
};

if (typeof window !== 'undefined') {
  window.GHANA_REGIONS = GHANA_REGIONS;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.StorageManager = StorageManager;
}
