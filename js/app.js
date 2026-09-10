/**
 * CodeCastic - Ghana Education Service (GES) Promotion Exam Readiness Application
 * Core Application Controller
 */

(function() {
  "use strict";

  /* ================= APP STATE ================= */
  let currentRank = "ALL";
  let activeQuestions = [];
  let currentQIndex = 0;
  let examAnswers = []; // Array of { qIndex, questionObj, chosenIdx, isCorrect, timedOut }
  let timerInterval = null;
  let timeLeft = 45;
  let totalTimeUsed = 0;
  let isAnswerLocked = false;
  let editingQuestionId = null;
  let isAdminAuthenticated = false;

  const PASS_THRESHOLD = 70; // 70% passing grade requirement
  const SECONDS_PER_QUESTION = 45;

  /* ================= DOM ELEMENTS ================= */
  const screens = {
    select: document.getElementById("screen-select"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results")
  };

  const navElements = {
    bestScore: document.getElementById("navBestScore"),
    attemptsCount: document.getElementById("navAttemptsCount"),
    themeToggle: document.getElementById("themeToggle"),
    adminOpenBtn: document.getElementById("adminOpenBtn")
  };

  const selectElements = {
    rankGrid: document.getElementById("rankGrid"),
    startBtn: document.getElementById("startBtn"),
    rankHint: document.getElementById("rankHint"),
    historyTableBody: document.getElementById("historyTableBody"),
    historyEmptyState: document.getElementById("historyEmptyState"),
    clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    statTotal: document.getElementById("statTotal"),
    statPassRate: document.getElementById("statPassRate"),
    statBest: document.getElementById("statBest")
  };

  const quizElements = {
    rankTitle: document.getElementById("quizRankTitle"),
    countLabel: document.getElementById("quizCountLabel"),
    timerPill: document.getElementById("timerPill"),
    timerVal: document.getElementById("timerVal"),
    progressFill: document.getElementById("progressFill"),
    categoryTag: document.getElementById("categoryTag"),
    questionText: document.getElementById("questionText"),
    optionsList: document.getElementById("optionsList"),
    feedbackBox: document.getElementById("feedbackBox"),
    nextBtn: document.getElementById("nextBtn")
  };

  const resultElements = {
    scoreRingProgress: document.getElementById("ringProgress"),
    scoreRingVal: document.getElementById("ringVal"),
    rankTitle: document.getElementById("resultRankTitle"),
    summaryText: document.getElementById("resultSummaryText"),
    statusTag: document.getElementById("statusTag"),
    statCorrect: document.getElementById("statCorrect"),
    statIncorrect: document.getElementById("statIncorrect"),
    statTime: document.getElementById("statTime"),
    breakdownList: document.getElementById("breakdownList"),
    retryBtn: document.getElementById("retryBtn"),
    homeBtn: document.getElementById("homeBtn"),
    certificateBtn: document.getElementById("certificateBtn")
  };

  const adminElements = {
    modal: document.getElementById("adminModal"),
    closeBtn: document.getElementById("adminCloseBtn"),
    rankFilter: document.getElementById("adminRankFilter"),
    questionsList: document.getElementById("adminQuestionsList"),
    addQBtn: document.getElementById("adminAddQBtn"),
    resetBtn: document.getElementById("adminResetBtn"),
    exportBtn: document.getElementById("adminExportBtn"),
    importInput: document.getElementById("adminImportInput"),
    
    // Q Form Modal
    formModal: document.getElementById("qFormModal"),
    formCloseBtn: document.getElementById("qFormCloseBtn"),
    formTitle: document.getElementById("qFormTitle"),
    qForm: document.getElementById("qForm"),
    inputLevel: document.getElementById("inputLevel"),
    inputCategory: document.getElementById("inputCategory"),
    inputQ: document.getElementById("inputQ"),
    inputOpt0: document.getElementById("inputOpt0"),
    inputOpt1: document.getElementById("inputOpt1"),
    inputOpt2: document.getElementById("inputOpt2"),
    inputOpt3: document.getElementById("inputOpt3"),
    inputCorrect: document.getElementById("inputCorrect"),
    inputExplanation: document.getElementById("inputExplanation")
  };

  const adminLoginElements = {
    modal: document.getElementById("adminLoginModal"),
    form: document.getElementById("adminLoginForm"),
    passInput: document.getElementById("adminPassInput"),
    errorMsg: document.getElementById("adminLoginError"),
    closeBtn: document.getElementById("adminLoginCloseBtn"),
    cancelBtn: document.getElementById("adminLoginCancelBtn"),
    logoutBtn: document.getElementById("adminLogoutBtn"),
    changePassForm: document.getElementById("changePassForm"),
    newPassInput: document.getElementById("newPassInput"),
    changePassMsg: document.getElementById("changePassMsg")
  };

  const certificateElements = {
    modal: document.getElementById("certificateModal"),
    closeBtn: document.getElementById("certCloseBtn"),
    printBtn: document.getElementById("certPrintBtn"),
    recipientName: document.getElementById("certRecipientName"),
    rankName: document.getElementById("certRankName"),
    scoreVal: document.getElementById("certScoreVal"),
    dateVal: document.getElementById("certDateVal")
  };

  /* ================= INITIALIZATION ================= */
  function initApp() {
    setupTheme();
    renderRankCards();
    updateDashboardStats();
    attachEventListeners();
  }

  function setupTheme() {
    const keys = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : window.STORAGE_KEYS;
    const savedTheme = keys ? localStorage.getItem(keys.SETTINGS) : null;
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }

  /* ================= DASHBOARD & RANK SELECTION ================= */
  function renderRankCards() {
    const questions = StorageManager.getQuestions();
    selectElements.rankGrid.innerHTML = GES_RANKS.map(rank => {
      // Calculate question count per rank
      const count = rank.id === "ALL" 
        ? questions.length 
        : questions.filter(q => q.level === rank.id).length;
      
      const isSelected = rank.id === currentRank ? "selected" : "";
      
      return `
        <div class="rank-card ${isSelected}" data-rank="${rank.id}">
          <div>
            <span class="badge ${rank.badgeClass}">${rank.name}</span>
            <h3>${rank.name} Exam</h3>
            <p>${rank.description}</p>
          </div>
          <div class="rank-meta">
            <span>📚 ${count} Available Questions</span>
            <span>⏱️ 45s / Question</span>
          </div>
        </div>
      `;
    }).join("");

    // Attach card click handlers
    selectElements.rankGrid.querySelectorAll(".rank-card").forEach(card => {
      card.addEventListener("click", () => {
        currentRank = card.getAttribute("data-rank");
        selectElements.rankGrid.querySelectorAll(".rank-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        
        const rankObj = GES_RANKS.find(r => r.id === currentRank);
        selectElements.startBtn.disabled = false;
        selectElements.rankHint.textContent = `Selected: ${rankObj.name} Exam Readiness Test.`;
      });
    });
  }

  function updateDashboardStats() {
    const stats = StorageManager.getStats();
    const history = StorageManager.getAttemptHistory();

    navElements.bestScore.textContent = stats.overallBest > 0 ? `${stats.overallBest}%` : "—";
    navElements.attemptsCount.textContent = stats.totalAttempts;

    selectElements.statTotal.textContent = stats.totalAttempts;
    selectElements.statPassRate.textContent = `${stats.passRate}%`;
    selectElements.statBest.textContent = `${stats.overallBest}%`;

    // Render History Table
    if (history.length === 0) {
      selectElements.historyEmptyState.classList.remove("hidden");
      selectElements.historyTableBody.innerHTML = "";
    } else {
      selectElements.historyEmptyState.classList.add("hidden");
      selectElements.historyTableBody.innerHTML = history.slice(0, 10).map(att => {
        const rankObj = GES_RANKS.find(r => r.id === att.rankId);
        const rankName = rankObj ? rankObj.name : att.rankId;
        const statusPill = att.pass 
          ? `<span class="pill-pass">PASS</span>` 
          : `<span class="pill-fail">FAIL</span>`;

        return `
          <tr>
            <td>${att.dateFormatted}</td>
            <td><strong>${rankName}</strong></td>
            <td>${att.correct} / ${att.total}</td>
            <td><strong>${att.percentage}%</strong></td>
            <td>${statusPill}</td>
          </tr>
        `;
      }).join("");
    }
  }

  /* ================= QUIZ ENGINE ================= */
  function startQuiz() {
    const allQuestions = StorageManager.getQuestions();
    
    // Filter questions by rank
    if (currentRank === "ALL") {
      activeQuestions = [...allQuestions];
    } else {
      activeQuestions = allQuestions.filter(q => q.level === currentRank);
    }

    if (activeQuestions.length === 0) {
      alert("No questions found for the selected promotion level. Please add questions in the Admin panel.");
      return;
    }

    // Shuffle questions slightly for variety
    activeQuestions.sort(() => Math.random() - 0.5);

    currentQIndex = 0;
    examAnswers = [];
    totalTimeUsed = 0;

    const rankObj = GES_RANKS.find(r => r.id === currentRank);
    quizElements.rankTitle.textContent = `${rankObj.name.toUpperCase()} PROMOTION EXAM`;

    showScreen("quiz");
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    isAnswerLocked = false;
    const q = activeQuestions[currentQIndex];

    quizElements.countLabel.textContent = `Question ${currentQIndex + 1} of ${activeQuestions.length}`;
    quizElements.progressFill.style.width = `${(currentQIndex / activeQuestions.length) * 100}%`;
    quizElements.categoryTag.textContent = q.category || q.levelName || "GES Examination Standard";
    quizElements.questionText.textContent = q.q;

    // Reset Feedback and Next Button
    quizElements.feedbackBox.classList.add("hidden");
    quizElements.nextBtn.classList.add("hidden");

    // Render 4 Options
    const keys = ["A", "B", "C", "D"];
    quizElements.optionsList.innerHTML = q.options.map((opt, i) => `
      <button class="option-btn" data-index="${i}" type="button">
        <span class="opt-key">${keys[i]}</span>
        <span>${opt}</span>
      </button>
    `).join("");

    // Attach Option Click Handlers
    quizElements.optionsList.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosenIdx = parseInt(btn.getAttribute("data-index"), 10);
        handleAnswerSelection(chosenIdx, false);
      });
    });

    startQuestionTimer();
  }

  function startQuestionTimer() {
    clearInterval(timerInterval);
    timeLeft = SECONDS_PER_QUESTION;
    quizElements.timerVal.textContent = timeLeft;
    quizElements.timerPill.classList.remove("urgent");

    timerInterval = setInterval(() => {
      timeLeft--;
      totalTimeUsed++;
      quizElements.timerVal.textContent = timeLeft;

      if (timeLeft <= 10) {
        quizElements.timerPill.classList.add("urgent");
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleAnswerSelection(-1, true); // Timed out
      }
    }, 1000);
  }

  function handleAnswerSelection(chosenIdx, isTimeout) {
    if (isAnswerLocked) return;
    isAnswerLocked = true;
    clearInterval(timerInterval);

    const q = activeQuestions[currentQIndex];
    const isCorrect = chosenIdx === q.correct;

    examAnswers.push({
      qIndex: currentQIndex,
      questionObj: q,
      chosenIdx: chosenIdx,
      isCorrect: isCorrect,
      timedOut: isTimeout
    });

    // Style Options
    const buttons = quizElements.optionsList.querySelectorAll(".option-btn");
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add("state-correct");
      } else if (idx === chosenIdx && !isCorrect) {
        btn.classList.add("state-incorrect");
      } else {
        btn.classList.add("state-dim");
      }
    });

    // Show Instant Feedback Banner
    quizElements.feedbackBox.classList.remove("hidden");
    if (isTimeout) {
      quizElements.feedbackBox.className = "feedback-box incorrect";
      quizElements.feedbackBox.innerHTML = `
        <header>⚠️ Time Expired!</header>
        <div>The correct answer is option <strong>${String.fromCharCode(65 + q.correct)}</strong>.</div>
        <div style="margin-top:6px;"><strong>Explanation:</strong> ${q.explanation}</div>
      `;
    } else if (isCorrect) {
      quizElements.feedbackBox.className = "feedback-box correct";
      quizElements.feedbackBox.innerHTML = `
        <header>✓ Correct Answer!</header>
        <div>${q.explanation}</div>
      `;
    } else {
      quizElements.feedbackBox.className = "feedback-box incorrect";
      quizElements.feedbackBox.innerHTML = `
        <header>✕ Incorrect Selection</header>
        <div>The correct choice is option <strong>${String.fromCharCode(65 + q.correct)}</strong>.</div>
        <div style="margin-top:6px;"><strong>Explanation:</strong> ${q.explanation}</div>
      `;
    }

    // Update Progress & Show Next Button
    quizElements.progressFill.style.width = `${((currentQIndex + 1) / activeQuestions.length) * 100}%`;
    quizElements.nextBtn.classList.remove("hidden");
    quizElements.nextBtn.textContent = (currentQIndex === activeQuestions.length - 1)
      ? "Complete & View Scorecard"
      : "Next Question →";
  }

  function advanceQuiz() {
    if (currentQIndex < activeQuestions.length - 1) {
      currentQIndex++;
      renderCurrentQuestion();
    } else {
      finishExam();
    }
  }

  /* ================= RESULTS & SCORECARD ================= */
  function finishExam() {
    clearInterval(timerInterval);
    const total = activeQuestions.length;
    const correctCount = examAnswers.filter(a => a.isCorrect).length;
    const incorrectCount = total - correctCount;
    const percentage = Math.round((correctCount / total) * 100);
    const isPassed = percentage >= PASS_THRESHOLD;

    const rankObj = GES_RANKS.find(r => r.id === currentRank);

    // Save Record
    StorageManager.saveAttempt({
      rankId: currentRank,
      rankName: rankObj.name,
      total: total,
      correct: correctCount,
      percentage: percentage,
      pass: isPassed,
      timeSeconds: totalTimeUsed
    });

    // Populate Results Screen
    resultElements.rankTitle.textContent = `${rankObj.name.toUpperCase()} RESULTS`;
    resultElements.summaryText.textContent = `You scored ${correctCount} out of ${total} questions correctly.`;

    resultElements.statusTag.textContent = isPassed ? "PASS — PROMOTION READY" : "FAIL — FURTHER STUDY REQUIRED";
    resultElements.statusTag.style.background = isPassed ? "var(--emerald-100)" : "var(--crimson-100)";
    resultElements.statusTag.style.color = isPassed ? "var(--emerald-700)" : "var(--crimson-700)";

    resultElements.statCorrect.textContent = correctCount;
    resultElements.statIncorrect.textContent = incorrectCount;
    
    const mins = Math.floor(totalTimeUsed / 60);
    const secs = totalTimeUsed % 60;
    resultElements.statTime.textContent = `${mins}m ${secs}s`;

    // SVG Circular Score Ring Animation
    const CIRCUMFERENCE = 2 * Math.PI * 58; // r=58
    resultElements.scoreRingVal.textContent = `${percentage}%`;
    const offset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
    resultElements.scoreRingProgress.style.strokeDasharray = CIRCUMFERENCE;
    resultElements.scoreRingProgress.style.stroke = isPassed ? "#059669" : "#DC2626";
    
    setTimeout(() => {
      resultElements.scoreRingProgress.style.transition = "stroke-dashoffset 0.8s ease-out";
      resultElements.scoreRingProgress.style.strokeDashoffset = offset;
    }, 100);

    // Show/Hide Certificate Button
    if (isPassed) {
      resultElements.certificateBtn.classList.remove("hidden");
    } else {
      resultElements.certificateBtn.classList.add("hidden");
    }

    // Render Detailed Answer Breakdown
    resultElements.breakdownList.innerHTML = examAnswers.map((ans, idx) => {
      const q = ans.questionObj;
      const keys = ["A", "B", "C", "D"];

      let answerDetail;
      if (ans.timedOut) {
        answerDetail = `<span class="wrong">No answer submitted (Timer Expired)</span> — Correct Answer: <span class="right">${keys[q.correct]}. ${q.options[q.correct]}</span>`;
      } else if (ans.isCorrect) {
        answerDetail = `Your Answer: <span class="right">${keys[ans.chosenIdx]}. ${q.options[ans.chosenIdx]}</span>`;
      } else {
        answerDetail = `Your Answer: <span class="wrong">${keys[ans.chosenIdx]}. ${q.options[ans.chosenIdx]}</span> — Correct Answer: <span class="right">${keys[q.correct]}. ${q.options[q.correct]}</span>`;
      }

      return `
        <div class="review-item">
          <div class="review-icon ${ans.isCorrect ? 'pass' : 'fail'}">
            ${ans.isCorrect ? '✓' : '✕'}
          </div>
          <div class="review-content">
            <div class="review-q">${idx + 1}. ${q.q}</div>
            <div class="review-a">${answerDetail}</div>
            <div class="review-exp"><strong>Explanation:</strong> ${q.explanation}</div>
          </div>
        </div>
      `;
    }).join("");

    updateDashboardStats();
    showScreen("results");
  }

  /* ================= CERTIFICATE MODAL ================= */
  function openCertificateModal() {
    const history = StorageManager.getAttemptHistory();
    const latestAttempt = history[0];
    const rankObj = GES_RANKS.find(r => r.id === (latestAttempt ? latestAttempt.rankId : currentRank));

    certificateElements.recipientName.textContent = "Ghana Education Service Officer";
    certificateElements.rankName.textContent = rankObj ? rankObj.name : "Promotion Exam";
    certificateElements.scoreVal.textContent = latestAttempt ? latestAttempt.percentage : 100;
    certificateElements.dateVal.textContent = new Date().toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    certificateElements.modal.classList.add("active");
  }

  /* ================= ADMIN MANAGEMENT PORTAL ================= */
  function openAdminModal() {
    if (isAdminAuthenticated) {
      renderAdminQuestionsList();
      adminElements.modal.classList.add("active");
    } else {
      adminLoginElements.passInput.value = "";
      adminLoginElements.errorMsg.classList.add("hidden");
      adminLoginElements.modal.classList.add("active");
      setTimeout(() => adminLoginElements.passInput.focus(), 150);
    }
  }

  function renderAdminQuestionsList() {
    const selectedRank = adminElements.rankFilter.value;
    let questions = StorageManager.getQuestions();

    if (selectedRank !== "ALL") {
      questions = questions.filter(q => q.level === selectedRank);
    }

    if (questions.length === 0) {
      adminElements.questionsList.innerHTML = `<p style="color:var(--text-muted); padding:16px;">No questions found for this rank filter.</p>`;
      return;
    }

    adminElements.questionsList.innerHTML = questions.map((q, idx) => `
      <div style="padding:14px; border:1px solid var(--line-color); border-radius:var(--radius-sm); margin-bottom:10px; background:var(--paper-bg); display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
        <div>
          <span class="badge badge-ad2" style="font-size:0.7rem;">${q.levelName || q.level}</span>
          <div style="font-weight:600; margin-top:4px;">${idx + 1}. ${q.q}</div>
          <div style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">Category: ${q.category || 'General'}</div>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button class="btn btn-outline btn-sm edit-q-btn" data-id="${q.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-q-btn" data-id="${q.id}">Delete</button>
        </div>
      </div>
    `).join("");

    // Attach Edit & Delete Handlers
    adminElements.questionsList.querySelectorAll(".edit-q-btn").forEach(btn => {
      btn.addEventListener("click", () => openQFormModal(btn.getAttribute("data-id")));
    });

    adminElements.questionsList.querySelectorAll(".delete-q-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this question?")) {
          StorageManager.deleteQuestion(id);
          renderAdminQuestionsList();
          renderRankCards();
        }
      });
    });
  }

  function openQFormModal(questionId = null) {
    editingQuestionId = questionId;
    if (questionId) {
      adminElements.formTitle.textContent = "Edit Promotion Exam Question";
      const q = StorageManager.getQuestions().find(item => item.id === questionId);
      if (q) {
        adminElements.inputLevel.value = q.level;
        adminElements.inputCategory.value = q.category || "";
        adminElements.inputQ.value = q.q;
        adminElements.inputOpt0.value = q.options[0] || "";
        adminElements.inputOpt1.value = q.options[1] || "";
        adminElements.inputOpt2.value = q.options[2] || "";
        adminElements.inputOpt3.value = q.options[3] || "";
        adminElements.inputCorrect.value = q.correct;
        adminElements.inputExplanation.value = q.explanation || "";
      }
    } else {
      adminElements.formTitle.textContent = "Add New Promotion Question";
      adminElements.qForm.reset();
    }
    adminElements.formModal.classList.add("active");
  }

  function handleQFormSubmit(e) {
    e.preventDefault();
    const rankObj = GES_RANKS.find(r => r.id === adminElements.inputLevel.value);

    const questionData = {
      level: adminElements.inputLevel.value,
      levelName: rankObj ? rankObj.name : adminElements.inputLevel.value,
      category: adminElements.inputCategory.value.trim() || "GES General Administration",
      q: adminElements.inputQ.value.trim(),
      options: [
        adminElements.inputOpt0.value.trim(),
        adminElements.inputOpt1.value.trim(),
        adminElements.inputOpt2.value.trim(),
        adminElements.inputOpt3.value.trim()
      ],
      correct: parseInt(adminElements.inputCorrect.value, 10),
      explanation: adminElements.inputExplanation.value.trim()
    };

    if (editingQuestionId) {
      StorageManager.updateQuestion(editingQuestionId, questionData);
    } else {
      StorageManager.addQuestion(questionData);
    }

    adminElements.formModal.classList.remove("active");
    renderAdminQuestionsList();
    renderRankCards();
  }

  /* ================= HELPER ROUTER ================= */
  function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
      if (key === screenKey) {
        screens[key].classList.remove("hidden");
      } else {
        screens[key].classList.add("hidden");
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ================= EVENT LISTENERS ================= */
  function attachEventListeners() {
    // Theme toggle
    navElements.themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      const keys = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : window.STORAGE_KEYS;
      if (keys) localStorage.setItem(keys.SETTINGS, isDark ? "dark" : "light");
    });

    // Start Exam
    selectElements.startBtn.addEventListener("click", startQuiz);

    // Quiz Navigation
    quizElements.nextBtn.addEventListener("click", advanceQuiz);

    // Results Actions
    resultElements.retryBtn.addEventListener("click", startQuiz);
    resultElements.homeBtn.addEventListener("click", () => {
      showScreen("select");
      updateDashboardStats();
    });

    // Certificate Actions
    resultElements.certificateBtn.addEventListener("click", openCertificateModal);
    certificateElements.closeBtn.addEventListener("click", () => {
      certificateElements.modal.classList.remove("active");
    });
    certificateElements.printBtn.addEventListener("click", () => {
      window.print();
    });

    // Clear History
    selectElements.clearHistoryBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your local attempt history?")) {
        StorageManager.clearHistory();
        updateDashboardStats();
      }
    });

    // Admin Modal & Login
    navElements.adminOpenBtn.addEventListener("click", openAdminModal);

    adminLoginElements.closeBtn.addEventListener("click", () => {
      adminLoginElements.modal.classList.remove("active");
    });
    adminLoginElements.cancelBtn.addEventListener("click", () => {
      adminLoginElements.modal.classList.remove("active");
    });

    adminLoginElements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputPass = adminLoginElements.passInput.value;
      if (StorageManager.verifyAdminPasscode(inputPass)) {
        isAdminAuthenticated = true;
        adminLoginElements.modal.classList.remove("active");
        renderAdminQuestionsList();
        adminElements.modal.classList.add("active");
      } else {
        adminLoginElements.errorMsg.classList.remove("hidden");
        adminLoginElements.passInput.select();
      }
    });

    adminLoginElements.logoutBtn.addEventListener("click", () => {
      isAdminAuthenticated = false;
      adminElements.modal.classList.remove("active");
    });

    adminLoginElements.changePassForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPass = adminLoginElements.newPassInput.value.trim();
      if (newPass) {
        StorageManager.setAdminPasscode(newPass);
        adminLoginElements.changePassMsg.textContent = "Passcode updated successfully!";
        adminLoginElements.newPassInput.value = "";
        setTimeout(() => {
          adminLoginElements.changePassMsg.textContent = "";
        }, 3000);
      }
    });

    adminElements.closeBtn.addEventListener("click", () => {
      adminElements.modal.classList.remove("active");
    });
    adminElements.rankFilter.addEventListener("change", renderAdminQuestionsList);
    adminElements.addQBtn.addEventListener("click", () => openQFormModal(null));

    // Admin Form Close
    if (adminElements.formCloseBtn) {
      adminElements.formCloseBtn.addEventListener("click", () => {
        adminElements.formModal.classList.remove("active");
      });
    }
    const qFormCancelBtn = document.getElementById("qFormCancelBtn");
    if (qFormCancelBtn) {
      qFormCancelBtn.addEventListener("click", () => {
        adminElements.formModal.classList.remove("active");
      });
    }
    adminElements.qForm.addEventListener("submit", handleQFormSubmit);

    // Reset Defaults
    adminElements.resetBtn.addEventListener("click", () => {
      if (confirm("Reset question bank to original default 15 GES questions? This will replace your customized questions.")) {
        StorageManager.resetQuestionsToDefault();
        renderAdminQuestionsList();
        renderRankCards();
        alert("Question bank reset successfully.");
      }
    });

    // Download Word Template
    const downloadWordTemplateBtn = document.getElementById("downloadWordTemplateBtn");
    if (downloadWordTemplateBtn) {
      downloadWordTemplateBtn.addEventListener("click", () => {
        const wordContent = StorageManager.generateWordTemplate();
        const blob = new Blob([wordContent], { type: "application/msword;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "codecastic_question_template.doc";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
      });
    }

    // Download CSV Template
    const downloadCsvTemplateBtn = document.getElementById("downloadCsvTemplateBtn");
    if (downloadCsvTemplateBtn) {
      downloadCsvTemplateBtn.addEventListener("click", () => {
        const csvContent = StorageManager.generateCSVTemplate();
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "codecastic_question_template.csv";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
      });
    }

    // Download JSON Template
    const downloadJsonTemplateBtn = document.getElementById("downloadJsonTemplateBtn");
    if (downloadJsonTemplateBtn) {
      downloadJsonTemplateBtn.addEventListener("click", () => {
        const jsonContent = StorageManager.generateJSONTemplate();
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "codecastic_question_template.json";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
      });
    }

    // Export Backup
    adminElements.exportBtn.addEventListener("click", () => {
      try {
        const jsonString = StorageManager.exportJSON();
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
        const fileName = `codecastic_ges_backup_${Date.now()}.json`;

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          const url = URL.createObjectURL(blob);
          const downloadAnchor = document.createElement('a');
          downloadAnchor.href = url;
          downloadAnchor.download = fileName;
          downloadAnchor.style.display = 'none';
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          
          setTimeout(() => {
            document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(url);
          }, 200);
        }

        alert(`Question bank export generated successfully!\n\nDownloaded file: ${fileName}`);
      } catch (err) {
        console.error("Export error:", err);
        const jsonString = StorageManager.exportJSON();
        prompt("Automatic file download was blocked by your browser settings. You can copy your JSON backup data directly below:", jsonString);
      }
    });

    // Import Word, CSV or JSON File
    adminElements.importInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const content = event.target.result;
          const fileName = file.name.toLowerCase();

          let res;
          if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
            res = StorageManager.importWordDocument(content);
          } else if (fileName.endsWith(".csv")) {
            res = StorageManager.importCSV(content);
          } else if (fileName.endsWith(".txt")) {
            // Try Word format first, fallback to CSV
            res = StorageManager.importWordDocument(content);
            if (!res.success) {
              res = StorageManager.importCSV(content);
            }
          } else {
            res = StorageManager.importJSON(content);
          }

          if (res.success) {
            alert(`🎉 Success! Uploaded and imported ${res.count} question(s) into CodeCastic!`);
            renderAdminQuestionsList();
            renderRankCards();
            updateDashboardStats();
          } else {
            alert("❌ Failed to import file: " + res.error);
          }
          e.target.value = "";
        };
        reader.readAsText(file);
      }
    });
  }

  // Run app on DOMReady
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
