import './style.css';
import confetti from 'canvas-confetti';
import { LEVELS as staticLevels } from './lessons.js';
import { speak } from './tts.js';
import { translate, generateSVG } from './translate.js';
import { showModal } from './modal.js';
import { getZenMascotSVG } from './zen-mascot.js';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

// --- Smart Learning Engine Configuration & State ---
const CURIOSITY_CATEGORIES = {
  dinosaur: {
    name: "Dinosaur World",
    emoji: "🦖",
    keywords: ["dinosaur", "trex", "t-rex", "raptor", "volcano", "fossil", "dino", "egg"],
    words: [
      { text: "T-Rex", emoji: "🦖" },
      { text: "Volcano", emoji: "🌋" },
      { text: "Egg", emoji: "🥚" },
      { text: "Fossil", emoji: "🦴" }
    ]
  },
  space: {
    name: "Space Odyssey",
    emoji: "🚀",
    keywords: ["space", "rocket", "star", "moon", "planet", "alien", "astronaut", "mars", "sun"],
    words: [
      { text: "Rocket", emoji: "🚀" },
      { text: "Moon", emoji: "🌙" },
      { text: "Alien", emoji: "👽" },
      { text: "Planet", emoji: "🪐" }
    ]
  },
  ocean: {
    name: "Deep Ocean",
    emoji: "🐙",
    keywords: ["ocean", "shark", "whale", "fish", "octopus", "coral", "submarine", "sea", "crab"],
    words: [
      { text: "Shark", emoji: "🦈" },
      { text: "Whale", emoji: "🐋" },
      { text: "Octopus", emoji: "🐙" },
      { text: "Crab", emoji: "🦀" }
    ]
  }
};

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
  reviewIdx: 0,
  incorrectInARow: 0,
  
  // Smart learning engine states
  wordStats: JSON.parse(localStorage.getItem('zd_word_stats')) || {},
  rollingResults: JSON.parse(localStorage.getItem('zd_rolling_results')) || [],
  difficulty: localStorage.getItem('zd_difficulty') || 'medium',
  sessionMistakes: [],
  fixItLesson: JSON.parse(localStorage.getItem('zd_fix_it_lesson')) || null,
  sandboxHistory: JSON.parse(localStorage.getItem('zd_sandbox_history')) || [],
  customLevels: JSON.parse(localStorage.getItem('zd_custom_levels')) || []
};

let LEVELS = [...staticLevels, ...(state.customLevels || [])];

function updateDynamicLevels() {
  LEVELS = [...staticLevels, ...(state.customLevels || [])];
}

// --- Save State Helper ---
function saveState() {
  localStorage.setItem('zd_xp', state.xp);
  localStorage.setItem('zd_streak', state.streak);
  localStorage.setItem('zd_unlocked_level', state.unlockedLevelId);
  localStorage.setItem('zd_completed_lessons', JSON.stringify(state.completedLessons));
  localStorage.setItem('zd_word_stats', JSON.stringify(state.wordStats));
  localStorage.setItem('zd_rolling_results', JSON.stringify(state.rollingResults));
  localStorage.setItem('zd_difficulty', state.difficulty);
  localStorage.setItem('zd_fix_it_lesson', JSON.stringify(state.fixItLesson));
  localStorage.setItem('zd_sandbox_history', JSON.stringify(state.sandboxHistory));
  localStorage.setItem('zd_custom_levels', JSON.stringify(state.customLevels));
}

// --- Smart Learning Engine Helpers ---
function trackWordPerformance(word, emoji, isCorrect) {
  if (!word) return;
  const key = word.toLowerCase().trim();
  if (!state.wordStats[key]) {
    state.wordStats[key] = { attempts: 0, correct: 0, score: 3, lastSeen: 0 };
  }
  const stats = state.wordStats[key];
  stats.attempts++;
  if (isCorrect) {
    stats.correct++;
  }
  
  // Leitner score rating (1-5 stars)
  if (isCorrect) {
    stats.score = Math.min(5, stats.score + 1);
  } else {
    stats.score = Math.max(1, stats.score - 1);
    
    // Add to session mistakes for Fix It lesson if not already present
    if (!state.sessionMistakes.some(m => m.word.toLowerCase() === key)) {
      state.sessionMistakes.push({ word, emoji: emoji || '💡' });
    }
  }
  stats.lastSeen = Date.now();
  saveState();
}

function checkCuriosityUnlock(word) {
  const clean = word.toLowerCase().trim();
  if (!state.sandboxHistory.includes(clean)) {
    state.sandboxHistory.push(clean);
  }
  
  for (const [catId, cat] of Object.entries(CURIOSITY_CATEGORIES)) {
    if (state.customLevels.some(l => l.catId === catId)) continue;
    
    const matchedHistory = state.sandboxHistory.filter(w => cat.keywords.includes(w));
    if (matchedHistory.length >= 3) {
      // Build a dynamic level structure
      const newLevelId = LEVELS.length + 1;
      const newLevel = {
        id: newLevelId,
        catId: catId,
        title: `Curiosity: ${cat.name}`,
        icon: cat.emoji,
        lessons: [
          {
            id: `curiosity_${catId}_1`,
            title: `${cat.name} Explorers`,
            challenges: [
              {
                type: "matching",
                instruction: `Match the ${cat.name} elements!`,
                pairs: cat.words.reduce((acc, w) => { acc[w.text] = w.emoji; return acc; }, {})
              },
              {
                type: "yes-no",
                instruction: `Is this a ${cat.words[0].text}?`,
                emoji: cat.words[0].emoji,
                audioText: cat.words[0].text,
                answer: "yes"
              },
              {
                type: "choice",
                instruction: `Find the ${cat.words[1].text}!`,
                options: cat.words.map(w => ({ text: w.text, emoji: w.emoji })),
                answer: cat.words[1].text
              }
            ]
          }
        ]
      };
      
      state.customLevels.push(newLevel);
      updateDynamicLevels();
      saveState();
      
      setTimeout(async () => {
        await showModal('curiosity-unlocked', { catName: cat.name, emoji: cat.emoji });
        if (state.activeView === 'learn') {
          renderMapView();
        }
      }, 1200);
    }
  }
}

// --- Audio Playback Helpers ---
// Modular haptic feedback helper
function triggerHaptic(pattern) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration feedback not supported or blocked:', e);
    }
  }
}

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
    triggerHaptic(15);
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

// Wire up bottom nav buttons
document.querySelectorAll('.bottom-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    switchView(view);
  });
});

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
  document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
  
  if (view === 'learn') {
    document.getElementById('nav-learn').classList.add('active');
    const bottomLearn = document.querySelector('.bottom-nav-item[data-view="learn"]');
    if (bottomLearn) bottomLearn.classList.add('active');
  }
  if (view === 'sandbox') {
    document.getElementById('nav-sandbox').classList.add('active');
    const bottomSandbox = document.querySelector('.bottom-nav-item[data-view="sandbox"]');
    if (bottomSandbox) bottomSandbox.classList.add('active');
  }
  if (view === 'review') {
    document.getElementById('nav-review').classList.add('active');
    const bottomReview = document.querySelector('.bottom-nav-item[data-view="review"]');
    if (bottomReview) bottomReview.classList.add('active');
  }
  if (view === 'feelings') {
    document.getElementById('nav-feelings').classList.add('active');
    const bottomFeelings = document.querySelector('.bottom-nav-item[data-view="feelings"]');
    if (bottomFeelings) bottomFeelings.classList.add('active');
  }
  
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
// --- 1. Learn View (Interactive Winding Milestones Map) ---
function drawPathTrail() {
  const mapContainer = document.getElementById('path-map');
  const svg = document.getElementById('path-map-svg');
  const pathLocked = document.getElementById('path-locked');
  const pathCompleted = document.getElementById('path-completed');
  
  if (!mapContainer || !svg) return;
  
  const mapRect = mapContainer.getBoundingClientRect();
  svg.setAttribute('width', mapRect.width);
  svg.setAttribute('height', mapRect.height);
  svg.style.height = `${mapRect.height}px`;
  
  const nodes = mapContainer.querySelectorAll('.map-node');
  if (nodes.length === 0) return;
  
  const coords = [];
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const parentRect = mapContainer.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top + rect.height / 2;
    coords.push({ x, y, levelId: parseInt(node.dataset.levelId) });
  });
  
  if (coords.length === 0) return;
  
  let completedPathD = "";
  let lockedPathD = "";
  
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i-1];
    const curr = coords[i];
    const midY = (prev.y + curr.y) / 2;
    const segmentD = `M ${prev.x},${prev.y} C ${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`;
    
    const prevLevel = LEVELS.find(l => l.id === prev.levelId);
    const prevCompleted = prevLevel ? prevLevel.lessons.every(l => state.completedLessons.includes(l.id)) : false;
    
    if (prevCompleted && curr.levelId <= state.unlockedLevelId) {
      completedPathD += (completedPathD ? " " : "") + segmentD;
    } else {
      lockedPathD += (lockedPathD ? " " : "") + segmentD;
    }
  }
  
  pathCompleted.setAttribute('d', completedPathD);
  pathLocked.setAttribute('d', lockedPathD);
  
  // Position Zen mascot
  const activeNodeIdx = coords.findIndex(c => c.levelId === state.unlockedLevelId);
  const targetNode = activeNodeIdx !== -1 ? coords[activeNodeIdx] : coords[0];
  
  const mascot = document.getElementById('map-mascot');
  if (mascot && targetNode) {
    const mascotX = targetNode.x - 60;
    const mascotY = targetNode.y - 120;
    mascot.style.left = `${mascotX}px`;
    mascot.style.top = `${mascotY}px`;
    mascot.innerHTML = getZenMascotSVG('happy', false);
    mascot.style.pointerEvents = 'auto';
    
    mascot.onclick = (e) => {
      e.stopPropagation();
      playSound('correct');
      mascot.innerHTML = getZenMascotSVG('excited', true);
      setTimeout(() => {
        if (state.activeView === 'learn') {
          mascot.innerHTML = getZenMascotSVG('happy', false);
        }
      }, 1500);
    };
  }
}

function checkFirstRunOnboarding() {
  if (localStorage.getItem('zd_onboarded')) return;
  
  const onboardingOverlay = document.createElement('div');
  onboardingOverlay.className = 'onboarding-overlay';
  onboardingOverlay.id = 'onboarding-overlay';
  
  const screens = [
    {
      title: "Meet Zen!",
      text: "Xin chào! I'm Zen, your friendly learning guide. I'll be here to study, celebrate, and cheer you on!",
      emotion: "happy",
      audio: "Xin chào! I'm Zen, your friendly learning guide. I'll be here to study, celebrate, and cheer you on!"
    },
    {
      title: "Learn & Play",
      text: "We will play fun games to learn English and Vietnamese! Just tap the colorful path circles to start your journey.",
      emotion: "excited",
      audio: "We will play fun games to learn English and Vietnamese! Just tap the colorful path circles to start your journey."
    },
    {
      title: "Express Feelings",
      text: "Visit the Feelings garden to learn how I feel! Tap me to see me jump, laugh, or rest.",
      emotion: "celebrating",
      audio: "Visit the Feelings garden to learn how I feel! Tap me to see me jump, laugh, or rest."
    }
  ];
  
  let currentScreenIdx = 0;
  
  function renderScreen() {
    const screen = screens[currentScreenIdx];
    speak(screen.audio);
    
    onboardingOverlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-mascot">
          ${getZenMascotSVG(screen.emotion, true)}
        </div>
        <h2 class="onboarding-title">${screen.title}</h2>
        <p class="onboarding-text">${screen.text}</p>
        <div class="onboarding-dots">
          ${screens.map((_, i) => `<span class="onboarding-dot ${i === currentScreenIdx ? 'active' : ''}"></span>`).join('')}
        </div>
        <button class="btn-3d btn-primary" id="onboarding-next">
          ${currentScreenIdx === screens.length - 1 ? "Let's Go! 🚀" : "Next ➡️"}
        </button>
      </div>
    `;
    
    document.getElementById('onboarding-next').onclick = () => {
      playSound('click');
      if (currentScreenIdx < screens.length - 1) {
        currentScreenIdx++;
        renderScreen();
      } else {
        localStorage.setItem('zd_onboarded', 'true');
        onboardingOverlay.remove();
        speak("Let's learn together!");
      }
    };
  }
  
  document.body.appendChild(onboardingOverlay);
  renderScreen();
}

function renderLearnView() {
  viewContainer.innerHTML = `
    <div class="path-map" id="path-map">
      <svg class="path-map-svg" id="path-map-svg">
        <path class="locked" id="path-locked"></path>
        <path class="completed" id="path-completed"></path>
      </svg>
      <div class="map-mascot-container" id="map-mascot"></div>
    </div>
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
    node.dataset.levelId = level.id;
    node.innerHTML = `<span>${level.icon}</span>`;
    
    if (isUnlocked) {
      node.addEventListener('click', () => {
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
  
  if (state.fixItLesson) {
    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'map-node-container';
    
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'map-node-fixit active';
    node.innerHTML = `<span>🩹</span>`;
    
    node.addEventListener('click', () => {
      startLesson(state.fixItLesson);
    });
    
    const label = document.createElement('div');
    label.className = 'node-label';
    label.style.color = '#EF4444';
    label.innerText = 'Fix It!';
    
    nodeWrapper.appendChild(node);
    nodeWrapper.appendChild(label);
    mapContainer.appendChild(nodeWrapper);
  }
  
  if (!window.hasPathMapResizeListener) {
    window.addEventListener('resize', () => {
      if (state.activeView === 'learn') {
        drawPathTrail();
      }
    });
    window.hasPathMapResizeListener = true;
  }
  
  setTimeout(() => {
    if (state.activeView === 'learn') {
      drawPathTrail();
    }
  }, 100);
  
  if (!sessionStorage.getItem('zd_greeted')) {
    sessionStorage.setItem('zd_greeted', 'true');
    const hours = new Date().getHours();
    let greetText = "Good morning! Let's learn together.";
    if (hours >= 12 && hours < 18) {
      greetText = "Good afternoon! Time for some learning.";
    } else if (hours >= 18 || hours < 5) {
      greetText = "Good evening! Let's do a quick lesson before bed.";
    }
    setTimeout(() => speak(greetText), 800);
  }
  
  setTimeout(checkFirstRunOnboarding, 600);
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
  state.yesNoSelection = null;
  state.dragSortAnswers = {};
  state.fillBlankSelection = null;
  state.speakingCorrect = false;
  state.speakingHeard = '';
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
      <div class="lesson-header-row" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div class="lesson-mascot-inline" id="lesson-mascot-inline" style="width: 90px; height: 80px; flex-shrink: 0;"></div>
        <h2 class="question-title" style="margin: 0; flex: 1; font-size: 22px;">${challenge.instruction}</h2>
      </div>
      
      <div id="challenge-content-area"></div>
      
      <div class="lesson-footer">
        <button type="button" class="btn-3d btn-outline" id="lesson-exit-btn">Exit</button>
        <button type="button" class="btn-3d btn-primary" id="lesson-submit-btn" disabled>Check</button>
      </div>
    </div>
  `;
  
  const lessonMascot = document.getElementById('lesson-mascot-inline');
  if (lessonMascot) {
    lessonMascot.innerHTML = getZenMascotSVG('thinking', true);
  }
  
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
  } else if (challenge.type === 'yes-no') {
    renderYesNoChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'drag-sort') {
    renderDragSortChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'fill-blank') {
    renderFillBlankChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'speaking') {
    renderSpeakingChallenge(challenge, contentArea, submitBtn);
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
  
  let options = [...challenge.options];
  if (state.difficulty === 'easy') {
    const correctOpt = options.find(o => o.text === challenge.answer);
    const distractors = options.filter(o => o.text !== challenge.answer);
    options = [correctOpt, distractors[0]].filter(Boolean);
  } else if (state.difficulty === 'hard' && options.length < 4) {
    const extraDistractors = ["Dog", "Cat", "Fish", "Apple", "Banana", "Milk", "Water", "Chair", "Table"]
      .filter(w => w !== challenge.answer && !options.some(o => o.text === w));
    if (extraDistractors.length > 0) {
      options.push({ text: extraDistractors[0], emoji: '💡' });
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  options.forEach(option => {
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
  
  let options = [...challenge.options];
  if (state.difficulty === 'easy') {
    const correctOpt = options.find(o => o.text === challenge.answer);
    const distractors = options.filter(o => o.text !== challenge.answer);
    options = [correctOpt, distractors[0]].filter(Boolean);
  } else if (state.difficulty === 'hard' && options.length < 4) {
    const extraDistractors = ["Dog", "Cat", "Fish", "Apple", "Banana", "Milk", "Water", "Chair", "Table"]
      .filter(w => w !== challenge.answer && !options.some(o => o.text === w));
    if (extraDistractors.length > 0) {
      options.push({ text: extraDistractors[0], emoji: '💡' });
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  options.forEach(option => {
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
  
  let blocks = [...challenge.blocks];
  const targetWords = challenge.targetText.split(' ').map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase());
  
  if (state.difficulty === 'easy') {
    blocks = blocks.filter(b => targetWords.includes(b.toLowerCase()));
  } else if (state.difficulty === 'hard') {
    const potentialDistractors = ["the", "a", "is", "runs", "flies", "swims", "happy", "big", "small"];
    potentialDistractors.forEach(dist => {
      if (!blocks.map(b => b.toLowerCase()).includes(dist) && !targetWords.includes(dist) && blocks.length < 7) {
        blocks.push(dist);
      }
    });
  }
  
  blocks.forEach((word, idx) => {
    const block = document.createElement('button');
    block.type = 'button';
    block.className = 'word-block';
    block.innerText = word;
    block.dataset.idx = idx;
    block.style.touchAction = 'none'; // Prevent browser scrolling while dragging
    
    block.addEventListener('pointerdown', (e) => {
      if (state.isChecking || block.classList.contains('used')) return;
      block.setPointerCapture(e.pointerId);
      
      const startX = e.clientX;
      const startY = e.clientY;
      let dragClone = null;
      let hasDragged = false;
      
      const onPointerMove = (moveEvent) => {
        if (state.isChecking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        if (!hasDragged && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          hasDragged = true;
          
          dragClone = document.createElement('div');
          dragClone.className = 'word-block dragging-ghost';
          dragClone.innerText = word;
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '9999';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.opacity = '0.9';
          dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          dragClone.style.transform = 'scale(1.05)';
          dragClone.style.transition = 'none';
          
          const rect = block.getBoundingClientRect();
          dragClone.style.width = `${rect.width}px`;
          dragClone.style.height = `${rect.height}px`;
          document.body.appendChild(dragClone);
        }
        
        if (dragClone) {
          const rect = block.getBoundingClientRect();
          dragClone.style.left = `${moveEvent.clientX - rect.width / 2}px`;
          dragClone.style.top = `${moveEvent.clientY - rect.height / 2}px`;
          
          const slotRect = slot.getBoundingClientRect();
          const isOver = (
            moveEvent.clientX >= slotRect.left &&
            moveEvent.clientX <= slotRect.right &&
            moveEvent.clientY >= slotRect.top &&
            moveEvent.clientY <= slotRect.bottom
          );
          if (isOver) {
            slot.classList.add('drag-over');
          } else {
            slot.classList.remove('drag-over');
          }
        }
      };
      
      const onPointerUp = (upEvent) => {
        block.releasePointerCapture(e.pointerId);
        block.removeEventListener('pointermove', onPointerMove);
        block.removeEventListener('pointerup', onPointerUp);
        
        if (dragClone) {
          dragClone.remove();
        }
        slot.classList.remove('drag-over');
        
        if (state.isChecking) return;
        
        if (hasDragged) {
          const slotRect = slot.getBoundingClientRect();
          const isOver = (
            upEvent.clientX >= slotRect.left &&
            upEvent.clientX <= slotRect.right &&
            upEvent.clientY >= slotRect.top &&
            upEvent.clientY <= slotRect.bottom
          );
          if (isOver) {
            playSound('click');
            block.classList.add('used');
            addWordToSlot(word, idx, slot, pool);
            speak(word);
            toggleSubmitBtn();
          }
        } else {
          playSound('click');
          speak(word);
          block.classList.add('used');
          addWordToSlot(word, idx, slot, pool);
          toggleSubmitBtn();
        }
      };
      
      block.addEventListener('pointermove', onPointerMove);
      block.addEventListener('pointerup', onPointerUp);
    });
    
    pool.appendChild(block);
  });
  
  function addWordToSlot(word, originalIdx, slotEl, poolEl) {
    const placed = document.createElement('button');
    placed.type = 'button';
    placed.className = 'word-block';
    placed.innerText = word;
    placed.style.touchAction = 'none';
    
    placed.addEventListener('pointerdown', (e) => {
      if (state.isChecking) return;
      placed.setPointerCapture(e.pointerId);
      
      const startX = e.clientX;
      const startY = e.clientY;
      let dragClone = null;
      let hasDragged = false;
      
      const onPointerMove = (moveEvent) => {
        if (state.isChecking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        if (!hasDragged && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          hasDragged = true;
          
          dragClone = document.createElement('div');
          dragClone.className = 'word-block dragging-ghost';
          dragClone.innerText = word;
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '9999';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.opacity = '0.9';
          dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          dragClone.style.transform = 'scale(1.05)';
          dragClone.style.transition = 'none';
          
          const rect = placed.getBoundingClientRect();
          dragClone.style.width = `${rect.width}px`;
          dragClone.style.height = `${rect.height}px`;
          document.body.appendChild(dragClone);
        }
        
        if (dragClone) {
          const rect = placed.getBoundingClientRect();
          dragClone.style.left = `${moveEvent.clientX - rect.width / 2}px`;
          dragClone.style.top = `${moveEvent.clientY - rect.height / 2}px`;
        }
      };
      
      const onPointerUp = (upEvent) => {
        placed.releasePointerCapture(e.pointerId);
        placed.removeEventListener('pointermove', onPointerMove);
        placed.removeEventListener('pointerup', onPointerUp);
        
        if (dragClone) {
          dragClone.remove();
        }
        
        if (state.isChecking) return;
        
        if (hasDragged) {
          const slotRect = slotEl.getBoundingClientRect();
          const isOutsideSlot = (
            upEvent.clientX < slotRect.left ||
            upEvent.clientX > slotRect.right ||
            upEvent.clientY < slotRect.top ||
            upEvent.clientY > slotRect.bottom
          );
          if (isOutsideSlot) {
            playSound('click');
            placed.remove();
            const originalBlock = poolEl.querySelector(`[data-idx="${originalIdx}"]`);
            if (originalBlock) originalBlock.classList.remove('used');
            
            state.sentenceBuilderAnswers = state.sentenceBuilderAnswers.filter(item => item.idx !== originalIdx);
            toggleSubmitBtn();
          }
        } else {
          playSound('click');
          placed.remove();
          const originalBlock = poolEl.querySelector(`[data-idx="${originalIdx}"]`);
          if (originalBlock) originalBlock.classList.remove('used');
          
          state.sentenceBuilderAnswers = state.sentenceBuilderAnswers.filter(item => item.idx !== originalIdx);
          toggleSubmitBtn();
        }
      };
      
      placed.addEventListener('pointermove', onPointerMove);
      placed.addEventListener('pointerup', onPointerUp);
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

// Yes or No challenge renderer
function renderYesNoChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'yes-no-challenge';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.width = '100%';

  const emojiEl = document.createElement('div');
  emojiEl.style.fontSize = '80px';
  emojiEl.style.userSelect = 'none';
  emojiEl.innerText = challenge.emoji;

  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'speaker-btn';
  speaker.innerHTML = '🔊 Hear Word';
  speaker.addEventListener('click', () => {
    playSound('click');
    speak(challenge.audioText);
  });

  const buttonsRow = document.createElement('div');
  buttonsRow.className = 'yes-no-row';
  buttonsRow.style.display = 'flex';
  buttonsRow.style.gap = '24px';
  buttonsRow.style.width = '100%';
  buttonsRow.style.justifyContent = 'center';

  const yesBtn = document.createElement('button');
  yesBtn.type = 'button';
  yesBtn.className = 'btn-3d yes-btn';
  yesBtn.style.flex = '1';
  yesBtn.style.maxWidth = '160px';
  yesBtn.style.setProperty('--btn-bg', '#10B981');
  yesBtn.style.setProperty('--btn-border', '#059669');
  yesBtn.style.setProperty('--btn-shadow', '#047857');
  yesBtn.style.setProperty('--btn-text', '#ffffff');
  yesBtn.innerHTML = '<span>🟢 YES</span>';

  const noBtn = document.createElement('button');
  noBtn.type = 'button';
  noBtn.className = 'btn-3d no-btn';
  noBtn.style.flex = '1';
  noBtn.style.maxWidth = '160px';
  noBtn.style.setProperty('--btn-bg', '#EF4444');
  noBtn.style.setProperty('--btn-border', '#DC2626');
  noBtn.style.setProperty('--btn-shadow', '#B91C1C');
  noBtn.style.setProperty('--btn-text', '#ffffff');
  noBtn.innerHTML = '<span>🔴 NO</span>';

  yesBtn.addEventListener('click', () => {
    if (state.isChecking) return;
    playSound('click');
    yesBtn.style.outline = '4px solid #047857';
    noBtn.style.outline = 'none';
    state.yesNoSelection = 'yes';
    submitBtn.removeAttribute('disabled');
  });

  noBtn.addEventListener('click', () => {
    if (state.isChecking) return;
    playSound('click');
    noBtn.style.outline = '4px solid #B91C1C';
    yesBtn.style.outline = 'none';
    state.yesNoSelection = 'no';
    submitBtn.removeAttribute('disabled');
  });

  wrapper.appendChild(emojiEl);
  wrapper.appendChild(speaker);
  wrapper.appendChild(buttonsRow);
  buttonsRow.appendChild(yesBtn);
  buttonsRow.appendChild(noBtn);
  container.appendChild(wrapper);

  setTimeout(() => {
    if (state.activeView === 'lesson') {
      speak(challenge.audioText);
    }
  }, 700);
}

// Drag to Sort challenge renderer
function renderDragSortChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'drag-sort-challenge';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.width = '100%';

  const bucketsContainer = document.createElement('div');
  bucketsContainer.style.display = 'flex';
  bucketsContainer.style.gap = '20px';
  bucketsContainer.style.width = '100%';
  bucketsContainer.style.justifyContent = 'center';
  bucketsContainer.style.flexWrap = 'wrap';

  const bucketEls = {};
  challenge.buckets.forEach(bucket => {
    const bEl = document.createElement('div');
    bEl.className = 'sort-bucket';
    bEl.dataset.id = bucket.id;
    bEl.style.flex = '1';
    bEl.style.minWidth = '140px';
    bEl.style.minHeight = '140px';
    bEl.style.border = '3px dashed var(--border-color)';
    bEl.style.borderRadius = '16px';
    bEl.style.padding = '12px';
    bEl.style.display = 'flex';
    bEl.style.flexDirection = 'column';
    bEl.style.alignItems = 'center';
    bEl.style.backgroundColor = 'var(--bg-card)';
    bEl.style.transition = 'all 0.2s ease';

    const title = document.createElement('div');
    title.style.fontWeight = '800';
    title.style.fontSize = '16px';
    title.style.marginBottom = '8px';
    title.style.userSelect = 'none';
    title.innerText = `${bucket.emoji} ${bucket.name}`;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'bucket-items';
    itemsContainer.style.display = 'flex';
    itemsContainer.style.flexWrap = 'wrap';
    itemsContainer.style.gap = '6px';
    itemsContainer.style.width = '100%';
    itemsContainer.style.minHeight = '60px';
    itemsContainer.style.justifyContent = 'center';

    bEl.appendChild(title);
    bEl.appendChild(itemsContainer);
    bucketsContainer.appendChild(bEl);
    bucketEls[bucket.id] = bEl;
  });

  const pool = document.createElement('div');
  pool.className = 'sort-pool';
  pool.style.display = 'flex';
  pool.style.flexWrap = 'wrap';
  pool.style.gap = '10px';
  pool.style.padding = '16px';
  pool.style.backgroundColor = 'var(--bg-color)';
  pool.style.borderRadius = '16px';
  pool.style.width = '100%';
  pool.style.minHeight = '80px';
  pool.style.justifyContent = 'center';
  pool.style.alignItems = 'center';

  challenge.items.forEach((item, idx) => {
    const itemEl = document.createElement('button');
    itemEl.type = 'button';
    itemEl.className = 'word-block';
    itemEl.innerText = `${item.emoji} ${item.text}`;
    itemEl.dataset.idx = idx;
    itemEl.style.touchAction = 'none';

    itemEl.addEventListener('pointerdown', (e) => {
      if (state.isChecking) return;
      itemEl.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      let dragClone = null;
      let hasDragged = false;

      const onPointerMove = (moveEvent) => {
        if (state.isChecking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!hasDragged && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          hasDragged = true;

          dragClone = document.createElement('div');
          dragClone.className = 'word-block dragging-ghost';
          dragClone.innerText = itemEl.innerText;
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '9999';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.opacity = '0.9';
          dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          dragClone.style.transform = 'scale(1.05)';

          const rect = itemEl.getBoundingClientRect();
          dragClone.style.width = `${rect.width}px`;
          dragClone.style.height = `${rect.height}px`;
          document.body.appendChild(dragClone);
        }

        if (dragClone) {
          const rect = itemEl.getBoundingClientRect();
          dragClone.style.left = `${moveEvent.clientX - rect.width / 2}px`;
          dragClone.style.top = `${moveEvent.clientY - rect.height / 2}px`;

          challenge.buckets.forEach(bucket => {
            const bEl = bucketEls[bucket.id];
            const bRect = bEl.getBoundingClientRect();
            const isOver = (
              moveEvent.clientX >= bRect.left &&
              moveEvent.clientX <= bRect.right &&
              moveEvent.clientY >= bRect.top &&
              moveEvent.clientY <= bRect.bottom
            );
            if (isOver) {
              bEl.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              bEl.style.borderColor = 'var(--primary-color)';
            } else {
              bEl.style.backgroundColor = 'var(--bg-card)';
              bEl.style.borderColor = 'var(--border-color)';
            }
          });
        }
      };

      const onPointerUp = (upEvent) => {
        itemEl.releasePointerCapture(e.pointerId);
        itemEl.removeEventListener('pointermove', onPointerMove);
        itemEl.removeEventListener('pointerup', onPointerUp);

        if (dragClone) {
          dragClone.remove();
        }

        challenge.buckets.forEach(bucket => {
          const bEl = bucketEls[bucket.id];
          bEl.style.backgroundColor = 'var(--bg-card)';
          bEl.style.borderColor = 'var(--border-color)';
        });

        if (state.isChecking) return;

        if (hasDragged) {
          let hitBucketId = null;
          challenge.buckets.forEach(bucket => {
            const bEl = bucketEls[bucket.id];
            const bRect = bEl.getBoundingClientRect();
            const isOver = (
              upEvent.clientX >= bRect.left &&
              upEvent.clientX <= bRect.right &&
              upEvent.clientY >= bRect.top &&
              upEvent.clientY <= bRect.bottom
            );
            if (isOver) hitBucketId = bucket.id;
          });

          if (hitBucketId) {
            playSound('click');
            bucketEls[hitBucketId].querySelector('.bucket-items').appendChild(itemEl);
            state.dragSortAnswers[idx] = hitBucketId;
            speak(item.text);
            checkAllItemsSorted();
          } else {
            pool.appendChild(itemEl);
            delete state.dragSortAnswers[idx];
            checkAllItemsSorted();
          }
        } else {
          playSound('click');
          speak(item.text);
          if (itemEl.parentElement === pool) {
            const firstBucketId = challenge.buckets[0].id;
            bucketEls[firstBucketId].querySelector('.bucket-items').appendChild(itemEl);
            state.dragSortAnswers[idx] = firstBucketId;
          } else {
            pool.appendChild(itemEl);
            delete state.dragSortAnswers[idx];
          }
          checkAllItemsSorted();
        }
      };

      itemEl.addEventListener('pointermove', onPointerMove);
      itemEl.addEventListener('pointerup', onPointerUp);
    });

    pool.appendChild(itemEl);
  });

  function checkAllItemsSorted() {
    const sortedCount = Object.keys(state.dragSortAnswers).length;
    if (sortedCount === challenge.items.length) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', 'true');
    }
  }

  wrapper.appendChild(bucketsContainer);
  wrapper.appendChild(pool);
  container.appendChild(wrapper);
}

// Fill in the Blank challenge renderer
function renderFillBlankChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'fill-blank-challenge';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '24px';
  wrapper.style.width = '100%';

  const sentenceRow = document.createElement('div');
  sentenceRow.style.fontSize = '24px';
  sentenceRow.style.fontWeight = '800';
  sentenceRow.style.display = 'flex';
  sentenceRow.style.alignItems = 'center';
  sentenceRow.style.gap = '8px';
  sentenceRow.style.justifyContent = 'center';
  sentenceRow.style.margin = '20px 0';

  const beforeText = document.createElement('span');
  beforeText.innerText = challenge.sentenceBefore;

  const blankSlot = document.createElement('span');
  blankSlot.className = 'blank-slot';
  blankSlot.style.minWidth = '80px';
  blankSlot.style.borderBottom = '3px solid var(--border-color)';
  blankSlot.style.textAlign = 'center';
  blankSlot.style.color = 'var(--primary-color)';
  blankSlot.style.padding = '0 8px';
  blankSlot.innerText = '_____';

  const afterText = document.createElement('span');
  afterText.innerText = challenge.sentenceAfter;

  sentenceRow.appendChild(beforeText);
  sentenceRow.appendChild(blankSlot);
  sentenceRow.appendChild(afterText);

  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'speaker-btn';
  speaker.innerHTML = '🔊 Hear Sentence';
  speaker.style.marginBottom = '10px';
  speaker.addEventListener('click', () => {
    playSound('click');
    speak(`${challenge.sentenceBefore} ${challenge.answer} ${challenge.sentenceAfter}`);
  });

  const pool = document.createElement('div');
  pool.style.display = 'flex';
  pool.style.gap = '12px';
  pool.style.justifyContent = 'center';

  challenge.options.forEach(word => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'word-block';
    btn.innerText = word;

    btn.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(word);

      pool.querySelectorAll('.word-block').forEach(b => {
        b.style.outline = 'none';
        b.style.borderColor = 'var(--border-color)';
      });
      btn.style.outline = '4px solid var(--primary-color)';
      btn.style.borderColor = 'var(--primary-color)';

      blankSlot.innerText = word;
      state.fillBlankSelection = word;
      submitBtn.removeAttribute('disabled');
    });

    pool.appendChild(btn);
  });

  wrapper.appendChild(sentenceRow);
  wrapper.appendChild(speaker);
  wrapper.appendChild(pool);
  container.appendChild(wrapper);
}

// Speaking challenge renderer
function renderSpeakingChallenge(challenge, container, submitBtn) {
  submitBtn.innerText = 'Skip';
  submitBtn.className = 'btn-3d btn-secondary';
  submitBtn.removeAttribute('disabled');

  const wrapper = document.createElement('div');
  wrapper.className = 'speaking-container';

  // 1. Emoji Visual Card
  const visualCard = document.createElement('div');
  visualCard.className = 'speaking-visual-card';
  visualCard.innerText = challenge.emoji || '🗣️';
  visualCard.addEventListener('click', () => {
    playSound('click');
    speak(challenge.word);
  });

  // 2. Word with Speaker Icon
  const wordContainer = document.createElement('div');
  wordContainer.className = 'speaking-word-container';
  wordContainer.innerHTML = `
    <span>${challenge.word}</span>
    <svg viewBox="0 0 24 24">
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 .77L6.5 8H3v8h3.5l4.5 4V4zm6 8c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>
  `;
  wordContainer.addEventListener('click', () => {
    playSound('click');
    speak(challenge.word);
  });

  // Speak the word initially with small delay so kid hears it
  setTimeout(() => speak(challenge.word), 400);

  // 3. Mic button container
  const micBtnContainer = document.createElement('div');
  micBtnContainer.className = 'mic-btn-container';

  const micBtn = document.createElement('button');
  micBtn.type = 'button';
  micBtn.className = 'mic-btn';
  micBtn.innerHTML = '🎙️';

  // 4. Feedback label
  const feedback = document.createElement('div');
  feedback.className = 'speaking-feedback';
  feedback.innerText = 'Tap to Speak';

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let autoStopTimeout = null;

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());

        feedback.className = 'speaking-feedback';
        feedback.innerText = 'Zen is thinking... 🧐';
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speaking.webm');

        try {
          const response = await fetch('/api/stt?lang=en', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Transcription error');

          const data = await response.json();
          const heardText = (data.text || '').trim();
          
          if (heardText) {
            const isMatch = checkSpeakingMatch(heardText, challenge.word);
            state.speakingHeard = heardText;
            state.speakingCorrect = isMatch;

            if (isMatch) {
              feedback.className = 'speaking-feedback success';
              feedback.innerText = `Perfect! You said: "${challenge.word}"`;
              micBtn.innerHTML = '✅';
              micBtn.style.backgroundColor = 'var(--primary-color)';
              
              // Mascot celebrates!
              const inlineMascot = document.getElementById('lesson-mascot-inline');
              if (inlineMascot) {
                inlineMascot.innerHTML = getZenMascotSVG('excited', true);
              }

              playSound('correct');
              submitBtn.innerText = 'Continue';
              submitBtn.className = 'btn-3d btn-primary';
              state.isCorrect = true;
              state.isChecking = true;
            } else {
              feedback.className = 'speaking-feedback error';
              feedback.innerText = `Heard: "${heardText}" (Try again!)`;
              micBtn.innerHTML = '🎙️';
              submitBtn.innerText = 'Check';
              submitBtn.className = 'btn-3d btn-primary';
            }
          } else {
            feedback.className = 'speaking-feedback error';
            feedback.innerText = 'No speech heard! Try again 🎙️';
            micBtn.innerHTML = '🎙️';
          }
        } catch (err) {
          console.error(err);
          feedback.className = 'speaking-feedback error';
          feedback.innerText = 'Failed to recognize. Check your microphone!';
          micBtn.innerHTML = '🎙️';
        }
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.className = 'mic-btn recording';
      micBtn.innerHTML = '🛑';
      feedback.innerText = 'Listening... Speak now!';
      triggerHaptic(100);

      // Auto stop after 4 seconds
      autoStopTimeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 4000);

    } catch (err) {
      console.error(err);
      feedback.className = 'speaking-feedback error';
      feedback.innerText = 'Microphone permission denied!';
    }
  }

  function stopRecording() {
    if (autoStopTimeout) {
      clearTimeout(autoStopTimeout);
      autoStopTimeout = null;
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    isRecording = false;
    micBtn.className = 'mic-btn';
    triggerHaptic(50);
  }

  micBtn.addEventListener('click', () => {
    playSound('click');
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  micBtnContainer.appendChild(micBtn);
  wrapper.appendChild(visualCard);
  wrapper.appendChild(wordContainer);
  wrapper.appendChild(micBtnContainer);
  wrapper.appendChild(feedback);
  container.appendChild(wrapper);
}

function checkSpeakingMatch(heard, target) {
  const h = heard.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
  const t = target.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
  return h.includes(t) || t.includes(h);
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
  } else if (challenge.type === 'yes-no') {
    isCorrect = state.yesNoSelection === challenge.answer;
    
    const yesBtn = document.querySelector('.yes-btn');
    const noBtn = document.querySelector('.no-btn');
    if (yesBtn && noBtn) {
      if (challenge.answer === 'yes') {
        yesBtn.style.border = '4px solid var(--primary-color)';
        if (state.yesNoSelection === 'no') {
          noBtn.style.border = '4px solid var(--red-color)';
        }
      } else {
        noBtn.style.border = '4px solid var(--primary-color)';
        if (state.yesNoSelection === 'yes') {
          yesBtn.style.border = '4px solid var(--red-color)';
        }
      }
    }
  } else if (challenge.type === 'drag-sort') {
    isCorrect = challenge.items.every((item, idx) => state.dragSortAnswers[idx] === item.bucket);
    
    document.querySelectorAll('.sort-bucket').forEach(bEl => {
      const bucketId = bEl.dataset.id;
      bEl.querySelectorAll('.word-block').forEach(itemEl => {
        const itemIdx = parseInt(itemEl.dataset.idx);
        const correctBucket = challenge.items[itemIdx].bucket;
        if (bucketId === correctBucket) {
          itemEl.classList.add('correct');
        } else {
          itemEl.classList.add('incorrect');
        }
      });
    });
  } else if (challenge.type === 'fill-blank') {
    isCorrect = state.fillBlankSelection === challenge.answer;
    
    const blankSlot = document.querySelector('.blank-slot');
    if (blankSlot) {
      if (isCorrect) {
        blankSlot.style.color = 'var(--primary-color)';
        blankSlot.style.borderBottomColor = 'var(--primary-color)';
      } else {
        blankSlot.style.color = 'var(--red-color)';
        blankSlot.style.borderBottomColor = 'var(--red-color)';
        
        const helper = document.createElement('div');
        helper.style.color = 'var(--primary-color)';
        helper.style.fontWeight = 'bold';
        helper.style.marginTop = '8px';
        helper.innerText = `Correct: "${challenge.answer}"`;
      }
    }
  } else if (challenge.type === 'speaking') {
    isCorrect = !!state.speakingCorrect;
  }
  
  // Smart Learning Engine: Track word performance based on challenge type
  if (challenge.type === 'matching') {
    Object.entries(challenge.pairs).forEach(([w, em]) => {
      trackWordPerformance(w, em, true);
    });
  } else if (challenge.type === 'choice' || challenge.type === 'listening') {
    const opt = challenge.options.find(o => o.text === challenge.answer);
    trackWordPerformance(challenge.answer, opt ? opt.emoji : '💡', isCorrect);
  } else if (challenge.type === 'yes-no') {
    trackWordPerformance(challenge.audioText, challenge.emoji, isCorrect);
  } else if (challenge.type === 'builder') {
    trackWordPerformance(challenge.targetText, '✍️', isCorrect);
  } else if (challenge.type === 'drag-sort') {
    challenge.items.forEach(item => {
      const itemIdx = challenge.items.findIndex(it => it.text === item.text);
      const isItemCorrect = state.dragSortAnswers[itemIdx] === item.bucket;
      trackWordPerformance(item.text, item.emoji, isItemCorrect);
    });
  } else if (challenge.type === 'fill-blank') {
    trackWordPerformance(challenge.answer, '💡', isCorrect);
  } else if (challenge.type === 'speaking') {
    trackWordPerformance(challenge.word, challenge.emoji || '🗣️', isCorrect);
  }

  state.rollingResults.push(isCorrect);
  if (state.rollingResults.length > 5) {
    state.rollingResults.shift();
  }
  if (state.rollingResults.length >= 3) {
    const correctCount = state.rollingResults.filter(Boolean).length;
    const rate = correctCount / state.rollingResults.length;
    if (rate >= 0.8) {
      state.difficulty = 'hard';
    } else if (rate <= 0.4) {
      state.difficulty = 'easy';
    } else {
      state.difficulty = 'medium';
    }
  }
  saveState();

  state.isChecking = true;
  state.isCorrect = isCorrect;
  
  const lessonMascot = document.getElementById('lesson-mascot-inline');
  
  if (isCorrect) {
    state.incorrectInARow = 0;
    if (lessonMascot) {
      lessonMascot.innerHTML = getZenMascotSVG('excited', true);
    }
    playSound('correct');
    triggerHaptic([80, 50, 80]); // double pulse
    submitBtn.innerText = 'Continue';
    submitBtn.className = 'btn-3d btn-primary';
  } else {
    state.incorrectInARow++;
    if (lessonMascot) {
      lessonMascot.innerHTML = getZenMascotSVG('sad', true);
    }
    if (state.incorrectInARow >= 3) {
      setTimeout(() => speak("Không sao đâu, hãy cố gắng lên nhé!"), 600);
    }
    playSound('incorrect');
    triggerHaptic(250); // long buzz
    state.hearts--;
    heartsVal.innerText = state.hearts;
    submitBtn.innerText = 'Continue';
    submitBtn.className = 'btn-3d btn-secondary';
    
    if (state.hearts <= 0) {
      setTimeout(async () => {
        if (lessonMascot) {
          lessonMascot.innerHTML = getZenMascotSVG('sleeping', true);
        }
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
    triggerHaptic([100, 50, 100, 50, 200]); // triple pulse
    
    // Confetti celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    state.xp += 10;
    let earnedFixIt = false;
    
    if (lesson.isFixIt) {
      state.fixItLesson = null;
    } else {
      if (!state.completedLessons.includes(lesson.id)) {
        state.completedLessons.push(lesson.id);
      }
      
      const currentLevel = LEVELS.find(l => l.lessons.some(les => les.id === lesson.id));
      if (currentLevel) {
        const allLevelLessonsDone = currentLevel.lessons.every(les => state.completedLessons.includes(les.id));
        if (allLevelLessonsDone && currentLevel.id === state.unlockedLevelId && state.unlockedLevelId < LEVELS.length) {
          state.unlockedLevelId++;
        }
      }

      if (state.sessionMistakes.length >= 3) {
        state.fixItLesson = {
          id: "fix_it",
          title: "🩹 Fix It! Mistake Review",
          isFixIt: true,
          challenges: state.sessionMistakes.map(mistake => {
            return {
              type: "choice",
              instruction: `Let's practice: ${mistake.word}!`,
              options: [
                { text: mistake.word, emoji: mistake.emoji },
                { text: mistake.word === 'Dog' ? 'Cat' : 'Dog', emoji: mistake.word === 'Dog' ? '🐱' : '🐶' }
              ],
              answer: mistake.word
            };
          })
        };
        earnedFixIt = true;
      }
    }
    
    state.sessionMistakes = [];
    saveState();
    
    setTimeout(async () => {
      await showModal('lesson-complete', { xp: 10, hearts: state.hearts });
      if (earnedFixIt) {
        speak("Hãy sửa các lỗi sai nhé!");
      }
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
    checkCuriosityUnlock(cleanWord);
    
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
        } else if (challenge.type === 'yes-no') {
          const cleanWord = challenge.audioText.trim();
          if (!seen.has(cleanWord.toLowerCase())) {
            seen.add(cleanWord.toLowerCase());
            list.push({ word: cleanWord, emoji: challenge.emoji, val: '' });
          }
        } else if (challenge.type === 'drag-sort') {
          challenge.items.forEach(item => {
            const cleanWord = item.text.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji: item.emoji, val: '' });
            }
          });
        } else if (challenge.type === 'fill-blank') {
          challenge.options.forEach(word => {
            const cleanWord = word.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji: '💡', val: '' });
            }
          });
        } else if (challenge.type === 'speaking') {
          const cleanWord = challenge.word.trim();
          if (!seen.has(cleanWord.toLowerCase())) {
            seen.add(cleanWord.toLowerCase());
            list.push({ word: cleanWord, emoji: challenge.emoji || '🗣️', val: '' });
          }
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
      
      <div class="sandbox-canvas" style="min-height: 320px; cursor: pointer; width:100%; max-width: 440px;" id="slideshow-trigger">
        <div id="slideshow-visual" style="font-size: 96px; transition: transform 0.3s ease;">🐶</div>
        <h2 id="slideshow-word" style="font-size: 36px; font-weight: 700; margin-top: 16px;">Dog</h2>
        <h3 id="slideshow-trans" style="color: var(--primary-color); font-weight:600;">"Con chó"</h3>
        <div id="slideshow-stars" style="font-size: 20px; margin-top: 10px; color: #F59E0B; letter-spacing: 2px;">⭐⭐⭐☆☆</div>
      </div>
      
      <button type="button" class="btn-3d btn-primary" id="slideshow-play-pause">Pause Slideshow</button>
    </div>
  `;

  const visualEl = document.getElementById('slideshow-visual');
  const wordEl = document.getElementById('slideshow-word');
  const transEl = document.getElementById('slideshow-trans');
  const starsEl = document.getElementById('slideshow-stars');
  const playBtn = document.getElementById('slideshow-play-pause');
  const triggerEl = document.getElementById('slideshow-trigger');

  let isPlaying = true;

  function getLeitnerPriority(item) {
    const key = item.word.toLowerCase().trim();
    const stats = state.wordStats[key];
    if (!stats) return 3;
    
    const score = stats.score || 3;
    let weight = 6 - score;
    
    const timeSinceLastSeen = Date.now() - (stats.lastSeen || 0);
    if (timeSinceLastSeen < 60000) {
      weight = 0.1;
    }
    return weight;
  }

  function selectNextWeightedWord() {
    let totalWeight = 0;
    const entries = vocabulary.map(item => {
      const w = getLeitnerPriority(item);
      totalWeight += w;
      return { item, weight: w };
    });

    let r = Math.random() * totalWeight;
    for (const entry of entries) {
      r -= entry.weight;
      if (r <= 0) {
        return entry.item;
      }
    }
    return vocabulary[0];
  }

  async function showNextWord() {
    const item = selectNextWeightedWord();
    visualEl.innerText = item.emoji || "💡";
    wordEl.innerText = item.word;
    
    const key = item.word.toLowerCase().trim();
    const stats = state.wordStats[key];
    const score = stats ? (stats.score || 3) : 3;
    starsEl.innerText = '⭐'.repeat(score) + '☆'.repeat(5 - score);

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
    
    visualEl.style.transform = 'scale(1.2)';
    setTimeout(() => { visualEl.style.transform = 'scale(1)'; }, 300);
    
    speak(item.word);
  }

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
    instruction: "Tap Zen to make him bounce happily!"
  },
  excited: {
    en: "Excited",
    vi: "Hào hứng",
    emoji: "🤩",
    instruction: "Tap Zen to watch him clap his wings in excitement!"
  },
  sleeping: {
    en: "Sleeping",
    vi: "Đang ngủ",
    emoji: "😴",
    instruction: "Shh... Tap Zen to see him snore gently."
  },
  sad: {
    en: "Sad",
    vi: "Buồn bã",
    emoji: "😢",
    instruction: "Tap Zen to watch him cry gentle tears."
  },
  thinking: {
    en: "Thinking",
    vi: "Suy nghĩ",
    emoji: "🤔",
    instruction: "Tap Zen to watch him tap his foot in deep thought!"
  },
  celebrating: {
    en: "Celebrating",
    vi: "Chúc mừng",
    emoji: "🎉",
    instruction: "Tap Zen to see him celebrate with a party hat!"
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
        <p class="feelings-instruction-hint" id="feelings-hint">Tap Zen to make him bounce happily!</p>
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
    sceneArea.innerHTML = getZenMascotSVG(currentFeelingState, interactiveState);

    // 4. Hook up trigger interactions in the SVG
    const svgEl = sceneArea.querySelector('svg');
    if (svgEl) {
      svgEl.style.cursor = 'pointer';
      svgEl.addEventListener('click', () => {
        interactiveState = !interactiveState;
        
        // Trigger sound effects and animations
        if (currentFeelingState === 'happy' || currentFeelingState === 'excited' || currentFeelingState === 'celebrating') {
          playSound('correct');
          if (currentFeelingState === 'celebrating' || currentFeelingState === 'happy') {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.55 }
            });
          }
        } else if (currentFeelingState === 'sad') {
          playSound('incorrect');
        } else if (currentFeelingState === 'thinking') {
          playSound('click');
        } else if (currentFeelingState === 'sleeping') {
          playSound('click');
        }

        // Re-render display with interactiveState active
        updateFeelingsDisplay();

        // Reset state after a short delay for temporary animation states
        if (['happy', 'excited', 'celebrating', 'thinking'].includes(currentFeelingState)) {
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

// --- Initialize App ---
initDynamicVocabulary();
renderView();

