import { state } from './state.js';
import { playSound } from './audio.js';
import { renderLearnView } from './views/learn.js';
import { renderSandboxView } from './views/sandbox.js';
import { renderReviewView } from './views/review.js';
import { renderFeelingsView } from './views/feelings.js';
import { renderReadingView } from './views/reading.js';
import { renderRewardsView, applyActiveTheme } from './views/rewards.js';
import { renderParentsView, promptParentPin } from './views/parents.js';
import { renderLessonView } from './views/lesson.js';

export let isParentAuthorized = false;

export function setParentAuthorized(val) {
  isParentAuthorized = val;
}

// Update standard UI stats
export function updateStatsUI() {
  const xpVal = document.getElementById('stat-xp-val');
  const heartsVal = document.getElementById('stat-hearts-val');
  const streakVal = document.getElementById('stat-streak-val');
  const gemsVal = document.getElementById('stat-gems-val');

  if (xpVal) xpVal.innerText = state.xp;
  if (heartsVal) heartsVal.innerText = state.hearts;
  if (streakVal) streakVal.innerText = state.streak;
  if (gemsVal) gemsVal.innerText = state.gems;
}

// Switch between views
export function switchView(view) {
  playSound('click');
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.remove('open');
  
  // Clear slideshow reviews
  if (state.reviewTimer) {
    clearInterval(state.reviewTimer);
    state.reviewTimer = null;
  }
  
  // Guard the parents view with PIN
  if (view === 'parents' && !isParentAuthorized) {
    promptParentPin(
      () => {
        isParentAuthorized = true;
        switchView('parents');
      },
      () => {
        // Reset navigation highlight to the current view
        updateNavHighlights(state.activeView);
      }
    );
    return;
  }
  
  updateNavHighlights(view);
  state.activeView = view;
  renderView();
}

export function updateNavHighlights(view) {
  // Update menu active highlights
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
  
  const ids = {
    learn: 'nav-learn',
    sandbox: 'nav-sandbox',
    review: 'nav-review',
    feelings: 'nav-feelings',
    reading: 'nav-reading',
    rewards: 'nav-rewards',
    parents: 'nav-parents'
  };

  const navId = ids[view];
  if (navId) {
    const el = document.getElementById(navId);
    if (el) el.classList.add('active');
  }

  const bottomEl = document.querySelector(`.bottom-nav-item[data-view="${view}"]`);
  if (bottomEl) bottomEl.classList.add('active');
}

// --- Main Views Router ---
export function renderView() {
  applyActiveTheme();
  updateStatsUI();
  
  if (state.activeView === 'learn') {
    renderLearnView();
  } else if (state.activeView === 'sandbox') {
    renderSandboxView();
  } else if (state.activeView === 'review') {
    renderReviewView();
  } else if (state.activeView === 'feelings') {
    renderFeelingsView();
  } else if (state.activeView === 'reading') {
    renderReadingView();
  } else if (state.activeView === 'rewards') {
    renderRewardsView();
  } else if (state.activeView === 'parents') {
    renderParentsView();
  } else if (state.activeView === 'lesson') {
    renderLessonView();
  }
}
