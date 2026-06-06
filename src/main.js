import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { state, initDynamicVocabulary } from './state.js';
import { playSound } from './audio.js';
import { renderView, switchView } from './router.js';
import { checkStreakFreezeAndProgress } from './views/rewards.js';
import { initProfilesIfNeeded, renderProfileSelectionOverlay, triggerTimeLimitLock, isLockedByTimeLimit } from './views/parents.js';

// --- PWA Service Worker ---
registerSW({ immediate: true });

// --- Sidebar Menu Open/Close ---
const sidebar = document.getElementById('app-sidebar');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle && sidebar) {
  mobileMenuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// --- Navigation Handling ---
const navIds = ['learn', 'sandbox', 'review', 'feelings', 'reading', 'rewards', 'parents'];
navIds.forEach(id => {
  const btn = document.getElementById(`nav-${id}`);
  if (btn) {
    btn.addEventListener('click', () => switchView(id));
  }
});

// Wire up bottom nav buttons
document.querySelectorAll('.bottom-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    if (view) switchView(view);
  });
});

// --- Theme Toggling ---
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    playSound('click');
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    const span = themeToggle.querySelector('span');
    if (span) {
      span.innerText = isDark ? '☀️' : '🌙';
    }
  });
}

// --- Initialize App & Core Managers ---
initDynamicVocabulary();
checkStreakFreezeAndProgress();
initProfilesIfNeeded();

// Check if time limits were exceeded previously today
const todayStrCheck = new Date().toDateString();
if (state.lastMinutesSpentDate === todayStrCheck && state.dailyTimeLimit > 0 && state.todayMinutesSpent >= state.dailyTimeLimit) {
  triggerTimeLimitLock();
}

// Set up 1-minute increment timer
setInterval(() => {
  if (document.hidden || isLockedByTimeLimit) return;
  const todayStr = new Date().toDateString();
  if (state.lastMinutesSpentDate !== todayStr) {
    state.lastMinutesSpentDate = todayStr;
    state.todayMinutesSpent = 0;
  }
  state.todayMinutesSpent++;
  localStorage.setItem('zd_today_minutes_spent', state.todayMinutesSpent.toString());
  localStorage.setItem('zd_last_minutes_spent_date', state.lastMinutesSpentDate);
  
  if (state.dailyTimeLimit > 0 && state.todayMinutesSpent >= state.dailyTimeLimit) {
    triggerTimeLimitLock();
  }
}, 60000);

// If currentProfileId has just been initialized or is null, force selection overlay
if (localStorage.getItem('zd_current_profile_id') === null) {
  renderProfileSelectionOverlay();
} else {
  renderView();
}
