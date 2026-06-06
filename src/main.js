import './style.css';
import confetti from 'canvas-confetti';
import { LEVELS } from './lessons.js';
import { speak } from './tts.js';
import { translate, generateSVG } from './translate.js';
import { showModal } from './modal.js';
import { getZenMascotSVG } from './zen-mascot.js';

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
  reviewIdx: 0,
  incorrectInARow: 0
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
  
  const lessonMascot = document.getElementById('lesson-mascot-inline');
  
  if (isCorrect) {
    state.incorrectInARow = 0;
    if (lessonMascot) {
      lessonMascot.innerHTML = getZenMascotSVG('excited', true);
    }
    playSound('correct');
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

