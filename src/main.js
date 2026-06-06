import './style.css';
import confetti from 'canvas-confetti';
import { LEVELS } from './lessons.js';
import { speak } from './tts.js';
import { translate, generateSVG } from './translate.js';

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
  const challenge = lesson.challenges[state.currentChallengeIdx];
  const progressPercent = Math.round(((state.currentChallengeIdx) / lesson.challenges.length) * 100);
  
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
  
  document.getElementById('lesson-exit-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to exit the lesson? Progress will be lost.")) {
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
      setTimeout(() => {
        alert("Oh no! You ran out of hearts! Let's try again!");
        switchView('learn');
      }, 1000);
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
    alert(`Congratulations! You finished "${lesson.title}" and earned 10 XP!`);
    switchView('learn');
  }
}

// --- 3. Curiosity Sandbox View ---
function renderSandboxView() {
  viewContainer.innerHTML = `
    <div class="sandbox-card">
      <h2>Curiosity Sandbox</h2>
      <p style="color: var(--text-light)">Type a word in English or click quick buttons. The AI will generate an SVG and pronounce it!</p>
      
      <div class="sandbox-canvas" id="sandbox-canvas">
        <div class="svg-display-area" id="svg-display" style="cursor: pointer;" title="Tap to pronounce">
          <span style="font-size: 64px;">💡</span>
          <p style="color: var(--text-light); font-size: 14px; margin-top: 12px;">Type a word to start</p>
        </div>
        <h3 id="sandbox-word-title" style="font-weight: 700; font-size: 24px; min-height: 32px;"></h3>
        <p id="sandbox-translation" style="color: var(--primary-color); font-weight: 600; min-height: 24px;"></p>
      </div>

      <div class="sandbox-input-row">
        <input type="text" class="sandbox-input" id="sandbox-input" placeholder="Type a word (e.g. apple, sun, fish)...">
        <button type="button" class="btn-3d btn-primary" id="sandbox-search-btn">Go!</button>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:8px;">
        <span style="font-weight:700; font-size:14px; color:var(--text-light);">Try these:</span>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="word-block quick-word">Sun</button>
          <button type="button" class="word-block quick-word">Moon</button>
          <button type="button" class="word-block quick-word">Waterdrop</button>
          <button type="button" class="word-block quick-word">Heart</button>
          <button type="button" class="word-block quick-word">Smile</button>
          <button type="button" class="word-block quick-word">Flame</button>
          <button type="button" class="word-block quick-word">Apple</button>
        </div>
      </div>
    </div>
  `;

  const inputEl = document.getElementById('sandbox-input');
  const searchBtn = document.getElementById('sandbox-search-btn');
  const displayEl = document.getElementById('svg-display');
  const titleEl = document.getElementById('sandbox-word-title');
  const transEl = document.getElementById('sandbox-translation');

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

  document.querySelectorAll('.quick-word').forEach(btn => {
    btn.addEventListener('click', () => {
      inputEl.value = btn.innerText;
      triggerSandbox(btn.innerText);
    });
  });
}

// --- 4. Auto Review View (Background Slideshow) ---
function renderReviewView() {
  const vocabulary = [
    { word: "Dog", emoji: "🐶", val: "Con chó" },
    { word: "Cat", emoji: "🐱", val: "Con mèo" },
    { word: "Bird", emoji: "🐦", val: "Con chim" },
    { word: "Fish", emoji: "🐟", val: "Con cá" },
    { word: "Apple", emoji: "🍎", val: "Quả táo" },
    { word: "Banana", emoji: "🍌", val: "Quả chuối" },
    { word: "Water", emoji: "💧", val: "Nước" },
    { word: "Milk", emoji: "🥛", val: "Sữa" },
    { word: "Book", emoji: "📖", val: "Quyển sách" },
    { word: "Sun", emoji: "☀️", val: "Mặt trời" },
    { word: "Moon", emoji: "🌙", val: "Mặt trăng" }
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

  function showNextWord() {
    const item = vocabulary[state.reviewIdx];
    visualEl.innerText = item.emoji;
    wordEl.innerText = item.word;
    transEl.innerText = `"${item.val}"`;
    
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

// --- Initialize App ---
renderView();
