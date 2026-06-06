import './style.css';
import confetti from 'canvas-confetti';
import { LEVELS } from './lessons.js';
import { speak } from './tts.js';
import { translate, generateSVG } from './translate.js';
import { showModal } from './modal.js';

// --- State Management ---
const state = {
  xp: parseInt(localStorage.getItem('zd_xp')) || 0,
  hearts: 5,
  streak: parseInt(localStorage.getItem('zd_streak')) || 1,
  unlockedLevelId: parseInt(localStorage.getItem('zd_unlocked_level')) || 1,
  completedLessons: JSON.parse(localStorage.getItem('zd_completed_lessons')) || [],
  activeView: 'learn', // 'learn', 'sandbox', 'review', 'lesson'
  currentLesson: null,
  currentChallengeIdx: 0,
  selectedOption: null,
  matchingPairsLeftSelected: null,
  matchingPairsRightSelected: null,
  matchedPairsCount: 0,
  sentenceBuilderAnswers: [],
  isChecking: false, // true during check state before clicking "Continue"
  isCorrect: false,
  reviewTimer: null,
  reviewIdx: 0
};

// --- Save State Helper ---
function saveState() {
  localStorage.setItem('zd_xp', state.xp);
  localStorage.setItem('zd_streak', state.streak);
  localStorage.setItem('zd_unlocked_level', state.unlockedLevelId);
  localStorage.setItem('zd_completed_lessons', JSON.stringify(state.completedLessons));
}

// --- Audio Playback Helpers ---
// Simple Web Audio API Synthesizers for UI feedback
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'correct') {
    // Satisfying cheerful double-chime
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } else if (type === 'incorrect') {
    // Flat buzzer tone
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } else if (type === 'click') {
    // Subtly soft bubble click
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}

// --- DOM References ---
const viewContainer = document.getElementById('view-container');
const xpVal = document.getElementById('stat-xp-val');
const heartsVal = document.getElementById('stat-hearts-val');
const streakVal = document.getElementById('stat-streak-val');
const themeToggle = document.getElementById('theme-toggle');
const sidebar = document.getElementById('app-sidebar');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

// --- Navigation Handling ---
document.getElementById('nav-learn').addEventListener('click', () => switchView('learn'));
document.getElementById('nav-sandbox').addEventListener('click', () => switchView('sandbox'));
document.getElementById('nav-review').addEventListener('click', () => switchView('review'));
document.getElementById('nav-feelings').addEventListener('click', () => switchView('feelings'));
mobileMenuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

// --- Theme Toggling ---
themeToggle.addEventListener('click', () => {
  playSound('click');
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  themeToggle.querySelector('span').innerText = isDark ? '☀️' : '🌙';
});

// Update standard UI stats
function updateStatsUI() {
  xpVal.innerText = state.xp;
  heartsVal.innerText = state.hearts;
  streakVal.innerText = state.streak;
}

// Switch between views
function switchView(view) {
  playSound('click');
  sidebar.classList.remove('open');
  
  // Clear slideshow reviews
  if (state.reviewTimer) {
    clearInterval(state.reviewTimer);
    state.reviewTimer = null;
  }
  
  // Update menu active highlights
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (view === 'learn') document.getElementById('nav-learn').classList.add('active');
  if (view === 'sandbox') document.getElementById('nav-sandbox').classList.add('active');
  if (view === 'review') document.getElementById('nav-review').classList.add('active');
  if (view === 'feelings') document.getElementById('nav-feelings').classList.add('active');
  
  state.activeView = view;
  renderView();
}

// --- Main Views Router ---
function renderView() {
  updateStatsUI();
  
  if (state.activeView === 'learn') {
    renderLearnView();
  } else if (state.activeView === 'sandbox') {
    renderSandboxView();
  } else if (state.activeView === 'review') {
    renderReviewView();
  } else if (state.activeView === 'feelings') {
    renderFeelingsView();
  } else if (state.activeView === 'lesson') {
    renderLessonView();
  }
}

// --- 1. Learn View (Interactive Milestones Map) ---
function renderLearnView() {
  viewContainer.innerHTML = `
    <div class="path-map" id="path-map"></div>
  `;
  
  const mapContainer = document.getElementById('path-map');
  
  LEVELS.forEach((level) => {
    const isUnlocked = level.id <= state.unlockedLevelId;
    const isCompleted = level.lessons.every(l => state.completedLessons.includes(l.id));
    
    let nodeClass = 'locked';
    if (isCompleted) nodeClass = 'completed';
    else if (isUnlocked) nodeClass = 'active';
    
    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'map-node-container';
    
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `map-node ${nodeClass}`;
    node.innerHTML = `<span>${level.icon}</span>`;
    
    if (isUnlocked) {
      node.addEventListener('click', () => {
        // Pick the first incomplete lesson, or restart the first if all are complete
        const nextLesson = level.lessons.find(l => !state.completedLessons.includes(l.id)) || level.lessons[0];
        startLesson(nextLesson);
      });
    }
    
    const label = document.createElement('div');
    label.className = 'node-label';
    label.innerText = level.title;
    
    nodeWrapper.appendChild(node);
    nodeWrapper.appendChild(label);
    mapContainer.appendChild(nodeWrapper);
  });
}

// --- 2. Lesson Execution Flow ---
function startLesson(lesson) {
  playSound('click');
  state.hearts = 5;
  state.currentLesson = lesson;
  state.currentChallengeIdx = 0;
  state.activeView = 'lesson';
  resetChallengeState();
  renderView();
}

function resetChallengeState() {
  state.selectedOption = null;
  state.matchingPairsLeftSelected = null;
  state.matchingPairsRightSelected = null;
  state.matchedPairsCount = 0;
  state.sentenceBuilderAnswers = [];
  state.isChecking = false;
  state.isCorrect = false;
}

function renderLessonView() {
  const lesson = state.currentLesson;
  const challengeIdx = state.currentChallengeIdx;
  const challenge = lesson.challenges[challengeIdx];
  const progressPercent = Math.round(((challengeIdx) / lesson.challenges.length) * 100);
  
  viewContainer.innerHTML = `
    <div class="lesson-card">
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
      <h2 class="question-title">${challenge.instruction}</h2>
      
      <div id="challenge-content-area"></div>
      
      <div class="lesson-footer">
        <button type="button" class="btn-3d btn-outline" id="lesson-exit-btn">Exit</button>
        <button type="button" class="btn-3d btn-primary" id="lesson-submit-btn" disabled>Check</button>
      </div>
    </div>
  `;
  
  document.getElementById('lesson-exit-btn').addEventListener('click', async () => {
    const shouldExit = await showModal('exit-confirm');
    if (shouldExit) {
      switchView('learn');
    }
  });
  
  const submitBtn = document.getElementById('lesson-submit-btn');
  submitBtn.addEventListener('click', () => {
    if (!state.isChecking) {
      checkChallengeAnswer();
    } else {
      nextChallenge();
    }
  });
  
  // Render specific challenge layouts
  const contentArea = document.getElementById('challenge-content-area');
  
  if (challenge.type === 'matching') {
    renderMatchingChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'choice') {
    renderChoiceChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'listening') {
    renderListeningChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'builder') {
    renderBuilderChallenge(challenge, contentArea, submitBtn);
  }

  // Speak challenge instruction with a small delay for child guidance
  setTimeout(() => {
    if (state.activeView === 'lesson' && state.currentChallengeIdx === challengeIdx) {
      speak(challenge.instruction);
    }
  }, 350);
}

// Choice challenge renderer
function renderChoiceChallenge(challenge, container, submitBtn) {
  const grid = document.createElement('div');
  grid.className = 'options-grid';
  
  challenge.options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <div class="option-visual" style="font-size: 54px;">${option.emoji}</div>
      <div class="option-text">${option.text}</div>
    `;
    
    card.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(option.text);
      
      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedOption = option.text;
      submitBtn.removeAttribute('disabled');
    });
    
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
}

// Matching Pairs challenge renderer
function renderMatchingChallenge(challenge, container, submitBtn) {
  const matchContainer = document.createElement('div');
  matchContainer.className = 'matching-container';
  
  const leftList = document.createElement('div');
  leftList.className = 'matching-list';
  
  const rightList = document.createElement('div');
  rightList.className = 'matching-list';
  
  const leftWords = Object.keys(challenge.pairs).sort(() => Math.random() - 0.5);
  const rightEmojis = Object.values(challenge.pairs).sort(() => Math.random() - 0.5);
  
  leftWords.forEach(word => {
    const item = document.createElement('div');
    item.className = 'option-card';
    item.innerText = word;
    item.style.padding = '14px';
    
    item.addEventListener('click', () => {
      if (state.isChecking || item.classList.contains('correct')) return;
      playSound('click');
      speak(word);
      
      leftList.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');
      state.matchingPairsLeftSelected = { element: item, text: word };
      checkPairsMatching(challenge, submitBtn);
    });
    
    leftList.appendChild(item);
  });
  
  rightEmojis.forEach(emoji => {
    const item = document.createElement('div');
    item.className = 'option-card';
    item.innerText = emoji;
    item.style.fontSize = '32px';
    item.style.padding = '8px';
    
    item.addEventListener('click', () => {
      if (state.isChecking || item.classList.contains('correct')) return;
      playSound('click');
      
      rightList.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');
      state.matchingPairsRightSelected = { element: item, emoji: emoji };
      checkPairsMatching(challenge, submitBtn);
    });
    
    rightList.appendChild(item);
  });
  
  matchContainer.appendChild(leftList);
  matchContainer.appendChild(rightList);
  container.appendChild(matchContainer);
}

function checkPairsMatching(challenge, submitBtn) {
  const left = state.matchingPairsLeftSelected;
  const right = state.matchingPairsRightSelected;
  
  if (left && right) {
    const expectedEmoji = challenge.pairs[left.text];
    if (expectedEmoji === right.emoji) {
      playSound('correct');
      left.element.className = 'option-card correct';
      right.element.className = 'option-card correct';
      state.matchedPairsCount++;
      
      state.matchingPairsLeftSelected = null;
      state.matchingPairsRightSelected = null;
      
      if (state.matchedPairsCount === Object.keys(challenge.pairs).length) {
        submitBtn.removeAttribute('disabled');
        submitBtn.click(); // Auto check on perfect matches
      }
    } else {
      playSound('incorrect');
      left.element.className = 'option-card incorrect';
      right.element.className = 'option-card incorrect';
      
      setTimeout(() => {
        left.element.className = 'option-card';
        right.element.className = 'option-card';
      }, 800);
      
      state.matchingPairsLeftSelected = null;
      state.matchingPairsRightSelected = null;
    }
  }
}

// Listening challenge renderer
function renderListeningChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '24px';
  
  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'speaker-btn';
  speaker.innerHTML = '🔊';
  speaker.addEventListener('click', () => {
    playSound('click');
    speak(challenge.audioText);
  });
  
  // Auto-speak initially with minor delay
  setTimeout(() => speak(challenge.audioText), 400);
  
  const grid = document.createElement('div');
  grid.className = 'options-grid';
  grid.style.width = '100%';
  
  challenge.options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <div class="option-visual" style="font-size: 54px;">${option.emoji}</div>
      <div class="option-text">${option.text}</div>
    `;
    
    card.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(option.text);
      
      grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedOption = option.text;
      submitBtn.removeAttribute('disabled');
    });
    
    grid.appendChild(card);
  });
  
  wrapper.appendChild(speaker);
  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

// Sentence Builder challenge renderer
function renderBuilderChallenge(challenge, container, submitBtn) {
  const builderWrapper = document.createElement('div');
  builderWrapper.className = 'sentence-builder';
  
  const helpRow = document.createElement('div');
  helpRow.style.fontSize = '20px';
  helpRow.style.color = 'var(--text-light)';
  helpRow.innerText = `"${challenge.promptText}"`;
  
  const slot = document.createElement('div');
  slot.className = 'build-slot';
  
  const pool = document.createElement('div');
  pool.className = 'word-pool';
  
  challenge.blocks.forEach((word, idx) => {
    const block = document.createElement('button');
    block.type = 'button';
    block.className = 'word-block';
    block.innerText = word;
    block.dataset.idx = idx;
    
    block.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(word);
      
      if (!block.classList.contains('used')) {
        block.classList.add('used');
        addWordToSlot(word, idx, slot, pool);
      }
      
      toggleSubmitBtn();
    });
    
    pool.appendChild(block);
  });
  
  function addWordToSlot(word, originalIdx, slotEl, poolEl) {
    const placed = document.createElement('button');
    placed.type = 'button';
    placed.className = 'word-block';
    placed.innerText = word;
    
    placed.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      placed.remove();
      const originalBlock = poolEl.querySelector(`[data-idx="${originalIdx}"]`);
      if (originalBlock) originalBlock.classList.remove('used');
      
      state.sentenceBuilderAnswers = state.sentenceBuilderAnswers.filter(item => item.idx !== originalIdx);
      toggleSubmitBtn();
    });
    
    slotEl.appendChild(placed);
    state.sentenceBuilderAnswers.push({ word, idx: originalIdx });
  }
  
  function toggleSubmitBtn() {
    if (state.sentenceBuilderAnswers.length > 0) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', 'true');
    }
  }
  
  builderWrapper.appendChild(helpRow);
  builderWrapper.appendChild(slot);
  builderWrapper.appendChild(pool);
  container.appendChild(builderWrapper);
}

// Verify answer
function checkChallengeAnswer() {
  const challenge = state.currentLesson.challenges[state.currentChallengeIdx];
  const submitBtn = document.getElementById('lesson-submit-btn');
  let isCorrect = false;
  
  if (challenge.type === 'matching') {
    isCorrect = true; // Auto-matched and succeeded
  } else if (challenge.type === 'choice' || challenge.type === 'listening') {
    isCorrect = state.selectedOption === challenge.answer;
    
    // UI Feedback styling
    document.querySelectorAll('.option-card').forEach(card => {
      const cardText = card.querySelector('.option-text')?.innerText;
      if (cardText === challenge.answer) {
        card.className = 'option-card correct';
      } else if (cardText === state.selectedOption) {
        card.className = 'option-card incorrect';
      }
    });
  } else if (challenge.type === 'builder') {
    // Reconstruct builder sentence
    const buildSentence = state.sentenceBuilderAnswers.map(item => item.word).join(' ');
    isCorrect = buildSentence.toLowerCase().trim() === challenge.targetText.toLowerCase().trim();
    
    const slot = document.querySelector('.build-slot');
    if (isCorrect) {
      slot.style.borderBottomColor = 'var(--primary-color)';
      slot.querySelectorAll('.word-block').forEach(b => b.classList.add('correct'));
    } else {
      slot.style.borderBottomColor = 'var(--red-color)';
      slot.querySelectorAll('.word-block').forEach(b => b.classList.add('incorrect'));
      
      // Speak target text so the kid absorbs the correct answer passively
      setTimeout(() => speak(challenge.targetText), 600);
      
      // Render correct text helper below slot
      const helper = document.createElement('div');
      helper.style.color = 'var(--primary-color)';
      helper.style.fontWeight = 'bold';
      helper.style.marginTop = '8px';
      helper.innerText = `Correct: "${challenge.targetText}"`;
      document.querySelector('.sentence-builder').appendChild(helper);
    }
  }
  
  state.isChecking = true;
  state.isCorrect = isCorrect;
  
  if (isCorrect) {
    playSound('correct');
    submitBtn.innerText = 'Continue';
    submitBtn.className = 'btn-3d btn-primary';
  } else {
    playSound('incorrect');
    state.hearts--;
    heartsVal.innerText = state.hearts;
    submitBtn.innerText = 'Continue';
    submitBtn.className = 'btn-3d btn-secondary';
    
    if (state.hearts <= 0) {
      setTimeout(async () => {
        await showModal('hearts-empty');
        switchView('learn');
      }, 800);
    }
  }
}

function nextChallenge() {
  state.currentChallengeIdx++;
  const lesson = state.currentLesson;
  
  if (state.currentChallengeIdx < lesson.challenges.length) {
    resetChallengeState();
    renderLessonView();
  } else {
    // Lesson Complete!
    playSound('correct');
    
    // Confetti celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    state.xp += 10;
    if (!state.completedLessons.includes(lesson.id)) {
      state.completedLessons.push(lesson.id);
    }
    
    // Unlock next level if all level lessons complete
    const currentLevel = LEVELS.find(l => l.lessons.some(les => les.id === lesson.id));
    const allLevelLessonsDone = currentLevel.lessons.every(les => state.completedLessons.includes(les.id));
    if (allLevelLessonsDone && currentLevel.id === state.unlockedLevelId && state.unlockedLevelId < LEVELS.length) {
      state.unlockedLevelId++;
    }
    
    saveState();
    setTimeout(async () => {
      await showModal('lesson-complete', { xp: 10, hearts: state.hearts });
      switchView('learn');
    }, 500);
  }
}

const SANDBOX_CATEGORIES = [
  {
    name: "Animals",
    emoji: "🐶",
    words: [
      { text: "Dog", emoji: "🐶" },
      { text: "Cat", emoji: "🐱" },
      { text: "Bird", emoji: "🐦" },
      { text: "Fish", emoji: "🐟" },
      { text: "Bear", emoji: "🐻" },
      { text: "Rabbit", emoji: "🐰" },
      { text: "Lion", emoji: "🦁" },
      { text: "Elephant", emoji: "🐘" }
    ]
  },
  {
    name: "Food",
    emoji: "🍎",
    words: [
      { text: "Apple", emoji: "🍎" },
      { text: "Banana", emoji: "🍌" },
      { text: "Grapes", emoji: "🍇" },
      { text: "Orange", emoji: "🍊" },
      { text: "Milk", emoji: "🥛" },
      { text: "Water", emoji: "💧" },
      { text: "Bread", emoji: "🍞" },
      { text: "Cake", emoji: "🍰" }
    ]
  },
  {
    name: "Colors",
    emoji: "🌈",
    words: [
      { text: "Red", emoji: "🟥" },
      { text: "Blue", emoji: "🟦" },
      { text: "Yellow", emoji: "🟨" },
      { text: "Green", emoji: "🟩" },
      { text: "Pink", emoji: "🌸" },
      { text: "Purple", emoji: "🍇" },
      { text: "Orange", emoji: "🍊" },
      { text: "Rainbow", emoji: "🌈" }
    ]
  },
  {
    name: "Home",
    emoji: "🏠",
    words: [
      { text: "Book", emoji: "📖" },
      { text: "Pen", emoji: "✏️" },
      { text: "Chair", emoji: "🪑" },
      { text: "Table", emoji: "🪵" },
      { text: "Bed", emoji: "🛏️" },
      { text: "Cup", emoji: "🥤" },
      { text: "Clock", emoji: "⏰" },
      { text: "Toy", emoji: "🧸" }
    ]
  }
];

// --- 3. Curiosity Sandbox View ---
function renderSandboxView() {
  viewContainer.innerHTML = `
    <div class="sandbox-card">
      <h2>Curiosity Sandbox</h2>
      <p style="color: var(--text-light)">Explore words and see them come to life!</p>
      
      <!-- Interactive Grid / Selection Area -->
      <div id="sandbox-interactive-area"></div>
      
      <!-- Canvas Display -->
      <div class="sandbox-canvas" id="sandbox-canvas">
        <div class="svg-display-area" id="svg-display" style="cursor: pointer;" title="Tap to pronounce">
          <span style="font-size: 64px;">💡</span>
          <p style="color: var(--text-light); font-size: 14px; margin-top: 12px;">Tap a picture above to start</p>
        </div>
        <h3 id="sandbox-word-title" style="font-weight: 700; font-size: 24px; min-height: 32px;"></h3>
        <p id="sandbox-translation" style="color: var(--primary-color); font-weight: 600; min-height: 24px;"></p>
      </div>

      <!-- Advanced Mode Toggle -->
      <div class="sandbox-advanced-toggle">
        <button type="button" class="toggle-advanced-btn" id="toggle-advanced-btn">⌨️ Advanced Mode (Type a word)</button>
      </div>

      <!-- Advanced Input Area -->
      <div class="sandbox-advanced-input-area" id="sandbox-input-area">
        <div class="sandbox-input-row">
          <input type="text" class="sandbox-input" id="sandbox-input" placeholder="Type a word (e.g. apple, sun, fish)...">
          <button type="button" class="btn-3d btn-primary" id="sandbox-search-btn">Go!</button>
        </div>
      </div>
    </div>
  `;

  const interactiveArea = document.getElementById('sandbox-interactive-area');
  const inputArea = document.getElementById('sandbox-input-area');
  const toggleAdvancedBtn = document.getElementById('toggle-advanced-btn');
  const inputEl = document.getElementById('sandbox-input');
  const searchBtn = document.getElementById('sandbox-search-btn');
  const displayEl = document.getElementById('svg-display');
  const titleEl = document.getElementById('sandbox-word-title');
  const transEl = document.getElementById('sandbox-translation');

  // Advanced mode toggle handler
  toggleAdvancedBtn.addEventListener('click', () => {
    playSound('click');
    inputArea.classList.toggle('visible');
  });

  async function triggerSandbox(word) {
    if (!word) return;
    const cleanWord = word.trim();
    playSound('click');
    
    // 1. Instantly speak the English word
    speak(cleanWord);
    titleEl.innerText = cleanWord;
    
    // 2. Fetch OCR translation to Vietnamese
    transEl.innerText = "Translating...";
    const translation = await translate(cleanWord);
    transEl.innerText = translation ? `"${translation}"` : "";

    // 3. Display loading and paint SVG
    displayEl.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
      const svgUrl = await generateSVG(cleanWord);
      if (svgUrl) {
        displayEl.innerHTML = `<img src="${svgUrl}" alt="${cleanWord}" style="max-width: 80%; max-height: 80%;" />`;
      } else {
        displayEl.innerHTML = '<span style="font-size: 64px;">❓</span><p>No SVG found</p>';
      }
    } catch (e) {
      displayEl.innerHTML = '<span style="font-size: 64px;">❌</span><p>Error</p>';
    }
  }

  function showCategories() {
    interactiveArea.innerHTML = `
      <div class="sandbox-categories-title">Tap a category:</div>
      <div class="sandbox-category-grid">
        ${SANDBOX_CATEGORIES.map(cat => `
          <div class="category-card" data-category="${cat.name}">
            <div class="category-emoji">${cat.emoji}</div>
            <div class="category-name">${cat.name}</div>
          </div>
        `).join('')}
      </div>
    `;

    interactiveArea.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        playSound('click');
        const catName = card.dataset.category;
        showCategoryWords(catName);
      });
    });
  }

  function showCategoryWords(catName) {
    const category = SANDBOX_CATEGORIES.find(c => c.name === catName);
    if (!category) return;

    interactiveArea.innerHTML = `
      <div class="sandbox-words-container">
        <button type="button" class="sandbox-back-btn" id="sandbox-back-btn">⬅ Back to Categories</button>
        <div class="sandbox-categories-title">Tap an item:</div>
        <div class="word-items-grid">
          ${category.words.map(w => `
            <div class="word-card" data-word="${w.text}">
              <div class="word-card-emoji">${w.emoji}</div>
              <div class="word-card-text">${w.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('sandbox-back-btn').addEventListener('click', () => {
      playSound('click');
      showCategories();
    });

    interactiveArea.querySelectorAll('.word-card').forEach(card => {
      card.addEventListener('click', () => {
        const word = card.dataset.word;
        triggerSandbox(word);
      });
    });
  }

  searchBtn.addEventListener('click', () => triggerSandbox(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerSandbox(inputEl.value);
  });
  
  displayEl.addEventListener('click', () => {
    if (titleEl.innerText) {
      playSound('click');
      speak(titleEl.innerText);
    }
  });

  // Start with category picker active
  showCategories();
}

// Dynamic Vocabulary Index cache
let dynamicVocabulary = [];

async function initDynamicVocabulary() {
  if (dynamicVocabulary.length > 0) return dynamicVocabulary;

  const seen = new Set();
  const list = [];

  LEVELS.forEach(level => {
    level.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        if (challenge.type === 'matching') {
          Object.entries(challenge.pairs).forEach(([word, emoji]) => {
            const cleanWord = word.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji, val: '' });
            }
          });
        } else if (challenge.type === 'choice' || challenge.type === 'listening') {
          challenge.options.forEach(opt => {
            const cleanWord = opt.text.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji: opt.emoji, val: '' });
            }
          });
        }
      });
    });
  });

  if (list.length === 0) {
    list.push(
      { word: "Dog", emoji: "🐶", val: "Con chó" },
      { word: "Cat", emoji: "🐱", val: "Con mèo" }
    );
  }

  dynamicVocabulary = list;

  // Asynchronously translate all words in the background
  list.forEach(async (item) => {
    try {
      const translated = await translate(item.word);
      item.val = translated || item.word;
    } catch (e) {
      item.val = item.word;
    }
  });

  return dynamicVocabulary;
}

// --- 4. Auto Review View (Background Slideshow) ---
function renderReviewView() {
  const vocabulary = dynamicVocabulary.length > 0 ? dynamicVocabulary : [
    { word: "Dog", emoji: "🐶", val: "Con chó" },
    { word: "Cat", emoji: "🐱", val: "Con mèo" },
    { word: "Bird", emoji: "🐦", val: "Con chim" },
    { word: "Fish", emoji: "🐟", val: "Con cá" }
  ];

  viewContainer.innerHTML = `
    <div class="sandbox-card" style="text-align: center; align-items: center;">
      <h2>Auto Review Slideshow</h2>
      <p style="color: var(--text-light); max-width: 480px;">A passive background slideshow. Sit back and absorb terms automatically as the system loops through lessons.</p>
      
      <div class="sandbox-canvas" style="min-height: 300px; cursor: pointer; width:100%; max-width: 440px;" id="slideshow-trigger">
        <div id="slideshow-visual" style="font-size: 96px; transition: transform 0.3s ease;">🐶</div>
        <h2 id="slideshow-word" style="font-size: 36px; font-weight: 700; margin-top: 16px;">Dog</h2>
        <h3 id="slideshow-trans" style="color: var(--primary-color); font-weight:600;">"Con chó"</h3>
      </div>
      
      <button type="button" class="btn-3d btn-primary" id="slideshow-play-pause">Pause Slideshow</button>
    </div>
  `;

  const visualEl = document.getElementById('slideshow-visual');
  const wordEl = document.getElementById('slideshow-word');
  const transEl = document.getElementById('slideshow-trans');
  const playBtn = document.getElementById('slideshow-play-pause');
  const triggerEl = document.getElementById('slideshow-trigger');

  state.reviewIdx = 0;
  let isPlaying = true;

  async function showNextWord() {
    const item = vocabulary[state.reviewIdx];
    visualEl.innerText = item.emoji || "💡";
    wordEl.innerText = item.word;
    
    // If translation is not ready, fetch it
    if (!item.val) {
      transEl.innerText = "...";
      try {
        const translated = await translate(item.word);
        item.val = translated || item.word;
      } catch (e) {
        item.val = item.word;
      }
    }

    if (wordEl.innerText === item.word) {
      transEl.innerText = `"${item.val}"`;
    }
    
    // Bounce scale animation
    visualEl.style.transform = 'scale(1.2)';
    setTimeout(() => { visualEl.style.transform = 'scale(1)'; }, 300);
    
    speak(item.word);
    state.reviewIdx = (state.reviewIdx + 1) % vocabulary.length;
  }

  // Initial call
  showNextWord();
  state.reviewTimer = setInterval(showNextWord, 4000);

  playBtn.addEventListener('click', () => {
    playSound('click');
    if (isPlaying) {
      clearInterval(state.reviewTimer);
      state.reviewTimer = null;
      playBtn.innerText = "Resume Slideshow";
      playBtn.className = "btn-3d btn-secondary";
      isPlaying = false;
    } else {
      showNextWord();
      state.reviewTimer = setInterval(showNextWord, 4000);
      playBtn.innerText = "Pause Slideshow";
      playBtn.className = "btn-3d btn-primary";
      isPlaying = true;
    }
  });

  triggerEl.addEventListener('click', () => {
    playSound('click');
    const item = vocabulary[(state.reviewIdx - 1 + vocabulary.length) % vocabulary.length];
    speak(item.word);
  });
}

// --- 5. Teaching Feelings View ---
const FEELINGS_DATA = {
  happy: {
    en: "Happy",
    vi: "Vui vẻ",
    emoji: "😊",
    instruction: "Tap Zen to make him jump with joy!"
  },
  sad: {
    en: "Sad",
    vi: "Buồn bã",
    emoji: "😢",
    instruction: "Tap Zen to watch him cry gentle tears."
  },
  angry: {
    en: "Angry",
    vi: "Tức giận",
    emoji: "😡",
    instruction: "Tap Zen to see him huff and turn red!"
  },
  surprised: {
    en: "Surprised",
    vi: "Ngạc nhiên",
    emoji: "😮",
    instruction: "Tap the gift box to surprise Zen!"
  }
};

let currentFeelingState = 'happy';
let interactiveState = false;

function renderFeelingsView() {
  viewContainer.innerHTML = `
    <div class="feelings-layout">
      <!-- Sidebar selectors -->
      <div class="feelings-sidebar">
        ${Object.entries(FEELINGS_DATA).map(([key, data]) => `
          <div class="feeling-selector-card ${key === currentFeelingState ? 'active' : ''}" data-feeling="${key}">
            <div class="feeling-card-emoji">${data.emoji}</div>
            <div class="feeling-card-details">
              <div class="feeling-card-en">${data.en}</div>
              <div class="feeling-card-vi">${data.vi}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Main Canvas Display -->
      <div class="feelings-canvas" id="feelings-canvas-card">
        <div class="feelings-scene-wrapper" id="feelings-scene-area"></div>
        <div class="feelings-header-info" id="feelings-info-click" title="Tap to pronounce">
          <h2 class="feelings-title-en" id="feelings-word-en">Happy</h2>
          <h3 class="feelings-title-vi" id="feelings-word-vi">Vui vẻ</h3>
        </div>
        <p class="feelings-instruction-hint" id="feelings-hint">Tap Zen to make him jump with joy!</p>
      </div>
    </div>
  `;

  // Wire up selector button clicks
  document.querySelectorAll('.feeling-selector-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      currentFeelingState = card.dataset.feeling;
      interactiveState = false;
      updateFeelingsDisplay();
    });
  });

  // Wire up header text audio click
  document.getElementById('feelings-info-click').addEventListener('click', () => {
    playSound('click');
    const data = FEELINGS_DATA[currentFeelingState];
    speak(`${data.en}. ${data.vi}`);
  });

  function updateFeelingsDisplay() {
    // 1. Update Selector Active state
    document.querySelectorAll('.feeling-selector-card').forEach(card => {
      if (card.dataset.feeling === currentFeelingState) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // 2. Update text info
    const data = FEELINGS_DATA[currentFeelingState];
    document.getElementById('feelings-word-en').innerText = data.en;
    document.getElementById('feelings-word-vi').innerText = `"${data.vi}"`;
    document.getElementById('feelings-hint').innerText = data.instruction;

    // 3. Render the dynamic SVG scene
    const sceneArea = document.getElementById('feelings-scene-area');
    sceneArea.innerHTML = getFeelingsSVG(currentFeelingState, interactiveState);

    // 4. Hook up trigger interactions in the SVG
    const svgTrigger = document.getElementById('svg-feeling-trigger');
    if (svgTrigger) {
      svgTrigger.addEventListener('click', () => {
        interactiveState = !interactiveState;
        
        // Trigger sound effects and animations
        if (currentFeelingState === 'happy') {
          playSound('correct');
          // Confetti celebration
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.55 }
          });
        } else if (currentFeelingState === 'sad') {
          playSound('incorrect');
        } else if (currentFeelingState === 'angry') {
          playSound('incorrect');
        } else if (currentFeelingState === 'surprised') {
          playSound('correct');
        }

        // Re-render display with interactiveState active
        updateFeelingsDisplay();

        // For happy and surprised, reset state after a short delay
        if (currentFeelingState === 'happy' || currentFeelingState === 'surprised') {
          setTimeout(() => {
            if (interactiveState) {
              interactiveState = false;
              if (state.activeView === 'feelings') {
                updateFeelingsDisplay();
              }
            }
          }, 1500);
        }
      });
    }
  }

  // Initial draw
  updateFeelingsDisplay();
}

function getFeelingsSVG(emotion, active) {
  let innerSVG = '';
  
  if (emotion === 'happy') {
    const jumpClass = active ? 'anim-jump' : '';
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <circle cx="170" cy="30" r="15" fill="#fcd34d" />
        <path d="M 20,130 A 80,80 0 0,1 180,130" fill="none" stroke="#f43f5e" stroke-width="6" opacity="0.6" />
        <path d="M 28,130 A 72,72 0 0,1 172,130" fill="none" stroke="#fb923c" stroke-width="6" opacity="0.6" />
        <path d="M 36,130 A 64,64 0 0,1 164,130" fill="none" stroke="#fbbf24" stroke-width="6" opacity="0.6" />
        <path d="M 44,130 A 56,56 0 0,1 156,130" fill="none" stroke="#34d399" stroke-width="6" opacity="0.6" />
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#e2e8f0" />
        <g class="${jumpClass}" id="svg-feeling-trigger" style="cursor: pointer;">
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <path d="M 100,48 Q 132,48 135,88 Q 138,126 100,126 Q 62,126 65,88 Q 68,48 100,48 Z" fill="#374151" />
          <path d="M 100,58 Q 122,58 124,88 Q 126,120 100,120 Q 74,120 76,88 Q 78,58 100,58 Z" fill="#ffffff" />
          <path d="M 78,124 Q 72,135 84,133 Q 90,131 88,124 Z" fill="#f59e0b" />
          <path d="M 122,124 Q 128,135 116,133 Q 110,131 112,124 Z" fill="#f59e0b" />
          ${active 
            ? `<path d="M 64,88 Q 45,70 52,62 Q 60,60 68,80" fill="#374151" />
               <path d="M 136,88 Q 155,70 148,62 Q 140,60 132,80" fill="#374151" />`
            : `<path d="M 64,88 Q 48,102 54,106 Q 62,106 66,92" fill="#374151" />
               <path d="M 136,88 Q 152,102 146,106 Q 138,106 134,92" fill="#374151" />`
          }
          <path d="M 82,72 Q 88,67 94,72" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M 106,72 Q 112,67 118,72" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
          <circle cx="76" cy="78" r="5" fill="#f472b6" opacity="0.6" />
          <circle cx="124" cy="78" r="5" fill="#f472b6" opacity="0.6" />
          <path d="M 94,76 L 106,76 L 100,86 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
          <line x1="134" y1="88" x2="160" y2="60" stroke="#94a3b8" stroke-width="2" />
          <ellipse cx="165" cy="50" rx="12" ry="16" fill="#f43f5e" />
          <polygon points="161,64 169,64 165,58" fill="#e11d48" />
        </g>
      </svg>
    `;
  } else if (emotion === 'sad') {
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <path d="M 70,30 Q 60,15 80,10 Q 100,5 110,20 Q 125,10 135,22 Q 150,25 140,40 Q 145,50 130,50 L 70,50 Z" fill="#64748b" opacity="0.8" />
        <line x1="80" y1="58" x2="78" y2="70" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.7" />
        <line x1="110" y1="58" x2="108" y2="72" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.7" />
        <line x1="130" y1="58" x2="128" y2="68" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.7" />
        <g id="svg-feeling-trigger" style="cursor: pointer;">
          <ellipse cx="100" cy="138" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <path d="M 100,58 Q 130,58 132,94 Q 134,128 100,128 Q 66,128 68,94 Q 70,58 100,58 Z" fill="#4b5563" />
          <path d="M 100,68 Q 120,68 122,94 Q 124,122 100,122 Q 76,122 78,94 Q 80,68 100,68 Z" fill="#ffffff" />
          <path d="M 80,126 Q 74,134 84,132 Q 90,130 88,126 Z" fill="#d97706" />
          <path d="M 120,126 Q 126,134 116,132 Q 110,130 112,126 Z" fill="#d97706" />
          <path d="M 68,94 Q 52,108 58,112 Q 66,112 70,98" fill="#4b5563" />
          <path d="M 132,94 Q 148,108 142,112 Q 134,112 130,98" fill="#4b5563" />
          <path d="M 80,82 Q 86,88 92,84" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M 108,84 Q 114,88 120,82" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M 94,88 Q 100,82 106,88 Q 100,94 94,88 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
          ${active 
            ? `<circle class="anim-tear-left" cx="84" cy="88" r="3" fill="#38bdf8" />
               <circle class="anim-tear-right" cx="116" cy="88" r="3" fill="#38bdf8" />`
            : ''
          }
        </g>
      </svg>
    `;
  } else if (emotion === 'angry') {
    const faceClass = active ? 'active' : '';
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <g stroke="#ef4444" stroke-width="2" opacity="${active ? '0.6' : '0.1'}">
          <line x1="40" y1="40" x2="50" y2="50" />
          <line x1="160" y1="40" x2="150" y2="50" />
          <line x1="40" y1="120" x2="50" y2="110" />
          <line x1="160" y1="120" x2="150" y2="110" />
        </g>
        ${active
          ? `<g fill="#cbd5e1" opacity="0.8">
               <path class="anim-steam-left" d="M 40,45 A 5,5 0 0 1 50,45 A 5,5 0 0 1 55,50 L 35,50 Z" />
               <path class="anim-steam-right" d="M 150,45 A 5,5 0 0 1 160,45 A 5,5 0 0 1 165,50 L 145,50 Z" />
             </g>`
          : ''
        }
        <g id="svg-feeling-trigger" style="cursor: pointer;">
          <ellipse cx="100" cy="138" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <path d="M 100,54 Q 130,54 133,90 Q 136,126 100,126 Q 64,126 67,90 Q 70,54 100,54 Z" fill="#374151" />
          <path class="anim-angry-face ${faceClass}" d="M 100,64 Q 120,64 122,90 Q 124,120 100,120 Q 76,120 78,90 Q 80,64 100,64 Z" fill="#ffffff" />
          <path d="M 80,124 Q 74,132 84,130 Q 90,128 88,124 Z" fill="#f59e0b" />
          <path d="M 120,124 Q 126,132 116,130 Q 110,128 112,124 Z" fill="#f59e0b" />
          <path d="M 68,90 Q 50,88 56,98 Q 66,104 70,94" fill="#374151" />
          <path d="M 132,90 Q 150,88 144,98 Q 134,104 130,94" fill="#374151" />
          <path d="M 80,72 L 94,78" stroke="#1f2937" stroke-width="4" stroke-linecap="round" />
          <path d="M 120,72 L 106,78" stroke="#1f2937" stroke-width="4" stroke-linecap="round" />
          <circle cx="86" cy="80" r="4" fill="#1f2937" />
          <circle cx="114" cy="80" r="4" fill="#1f2937" />
          <path d="M 94,84 L 106,84 L 100,90 Z" fill="#ea580c" />
        </g>
      </svg>
    `;
  } else if (emotion === 'surprised') {
    const lidClass = active ? 'open' : '';
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        ${active
          ? `<g fill="#fcd34d">
               <polygon class="anim-star-pop" points="160,50 163,56 170,56 165,60 167,66 160,62 153,66 155,60 150,56 157,56" style="--dx: 25px; --dy: -40px;" />
               <polygon class="anim-star-pop" points="135,45 137,49 142,49 138,52 140,56 135,53 130,56 132,52 128,49 133,49" style="--dx: -10px; --dy: -50px;" />
               <polygon class="anim-star-pop" points="165,80 167,83 171,83 168,86 169,90 165,88 161,90 162,86 159,83 163,83" style="--dx: 35px; --dy: -15px;" />
             </g>`
          : ''
        }
        <ellipse cx="70" cy="138" rx="25" ry="5" fill="#000000" opacity="0.1" />
        <ellipse cx="145" cy="138" rx="20" ry="4" fill="#000000" opacity="0.1" />
        <g>
          <path d="M 70,62 Q 95,62 97,92 Q 99,122 70,122 Q 41,122 43,92 Q 45,62 70,62 Z" fill="#374151" />
          <path d="M 70,70 Q 86,70 88,92 Q 90,116 70,116 Q 50,116 52,92 Q 54,70 70,70 Z" fill="#ffffff" />
          <path d="M 54,120 Q 50,128 58,126 Q 62,125 60,120 Z" fill="#f59e0b" />
          <path d="M 86,120 Q 90,128 82,126 Q 78,125 80,120 Z" fill="#f59e0b" />
          <path d="M 43,92 Q 25,82 30,74 Q 38,74 45,86" fill="#374151" />
          <path d="M 97,92 Q 115,82 110,74 Q 102,74 95,86" fill="#374151" />
          ${active
            ? `<circle cx="58" cy="80" r="7" fill="#1f2937" />
               <circle cx="56" cy="78" r="3" fill="#ffffff" />
               <circle cx="82" cy="80" r="7" fill="#1f2937" />
               <circle cx="80" cy="78" r="3" fill="#ffffff" />`
            : `<circle cx="58" cy="80" r="5" fill="#1f2937" />
               <circle cx="57" cy="79" r="1.5" fill="#ffffff" />
               <circle cx="82" cy="80" r="5" fill="#1f2937" />
               <circle cx="81" cy="79" r="1.5" fill="#ffffff" />`
          }
          <circle cx="70" cy="88" r="${active ? '6' : '4'}" fill="#ea580c" stroke="#d97706" stroke-width="1.5" />
          <circle cx="70" cy="88" r="${active ? '3' : '1.5'}" fill="#000000" />
        </g>
        <g id="svg-feeling-trigger" style="cursor: pointer;">
          <rect x="125" y="100" width="40" height="30" fill="#ec4899" rx="3" />
          <rect x="142" y="100" width="6" height="30" fill="#fcd34d" />
          <rect x="125" y="112" width="40" height="6" fill="#fcd34d" />
          <g class="box-lid-closed ${lidClass}">
            <rect x="122" y="92" width="46" height="10" fill="#f43f5e" rx="2" />
            <path d="M 138,92 Q 134,84 145,86 Q 145,92 145,92 Z" fill="#fcd34d" />
            <path d="M 152,92 Q 156,84 145,86 Q 145,92 145,92 Z" fill="#fcd34d" />
          </g>
        </g>
      </svg>
    `;
  }

  return innerSVG;
}

// --- Initialize App ---
initDynamicVocabulary();
renderView();

