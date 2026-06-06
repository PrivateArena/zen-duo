import { state, LEVELS, saveState, findWordEmoji } from '../state.js';
import { playSound } from '../audio.js';
import { speak } from '../tts.js';
import { switchView, updateStatsUI, isParentAuthorized, setParentAuthorized } from '../router.js';

export let activeParentsTab = 'progress';
export let isLockedByTimeLimit = false;

export function setIsLockedByTimeLimit(val) {
  isLockedByTimeLimit = val;
}

export function promptParentPin(onSuccess, onCancel) {
  const isFirstRun = !state.parentPin;
  
  const existing = document.getElementById('parent-pin-overlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'parent-pin-overlay';
  overlay.className = 'parent-pin-overlay';
  
  let currentPin = '';
  
  overlay.innerHTML = `
    <div class="parent-pin-card">
      <div class="parent-pin-icon">🤓</div>
      <h2>${isFirstRun ? 'Create Parent PIN' : 'Parents Only'}</h2>
      <p class="parent-pin-desc">
        ${isFirstRun 
          ? 'Choose a 4-digit PIN to lock learning settings and child profiles.' 
          : 'Please enter your 4-digit Parent PIN to access.'}
      </p>
      
      <div class="pin-dots-row">
        <div class="pin-dot" id="pin-dot-1"></div>
        <div class="pin-dot" id="pin-dot-2"></div>
        <div class="pin-dot" id="pin-dot-3"></div>
        <div class="pin-dot" id="pin-dot-4"></div>
      </div>
      
      <div id="pin-error-msg" class="pin-error-msg"></div>
      
      <div class="pin-keypad">
        <button class="pin-key" data-val="1">1</button>
        <button class="pin-key" data-val="2">2</button>
        <button class="pin-key" data-val="3">3</button>
        
        <button class="pin-key" data-val="4">4</button>
        <button class="pin-key" data-val="5">5</button>
        <button class="pin-key" data-val="6">6</button>
        
        <button class="pin-key" data-val="7">7</button>
        <button class="pin-key" data-val="8">8</button>
        <button class="pin-key" data-val="9">9</button>
        
        <button class="pin-key-action" id="pin-cancel-btn">✕</button>
        <button class="pin-key" data-val="0">0</button>
        <button class="pin-key-action" id="pin-clear-btn">⌫</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  const dots = [
    overlay.querySelector('#pin-dot-1'),
    overlay.querySelector('#pin-dot-2'),
    overlay.querySelector('#pin-dot-3'),
    overlay.querySelector('#pin-dot-4')
  ];
  const errorMsg = overlay.querySelector('#pin-error-msg');
  
  function updateDots() {
    dots.forEach((dot, idx) => {
      if (idx < currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }
  
  overlay.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentPin.length >= 4) return;
      playSound('click');
      currentPin += btn.dataset.val;
      updateDots();
      
      if (currentPin.length === 4) {
        setTimeout(verifyPin, 250);
      }
    });
  });
  
  function verifyPin() {
    if (isFirstRun) {
      playSound('correct');
      state.parentPin = currentPin;
      saveState();
      overlay.remove();
      onSuccess();
    } else {
      if (currentPin === state.parentPin) {
        playSound('correct');
        overlay.remove();
        onSuccess();
      } else {
        playSound('error');
        errorMsg.innerText = 'Incorrect PIN! Please try again.';
        overlay.querySelector('.parent-pin-card').classList.add('shake');
        setTimeout(() => {
          overlay.querySelector('.parent-pin-card').classList.remove('shake');
        }, 500);
        currentPin = '';
        updateDots();
      }
    }
  }
  
  overlay.querySelector('#pin-clear-btn').addEventListener('click', () => {
    playSound('click');
    currentPin = currentPin.slice(0, -1);
    updateDots();
    errorMsg.innerText = '';
  });
  
  overlay.querySelector('#pin-cancel-btn').addEventListener('click', () => {
    playSound('click');
    overlay.remove();
    onCancel();
  });
}

export function renderParentsView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  viewContainer.innerHTML = `
    <div class="parents-container" style="animation: fadeIn 0.4s ease-out;">
      <div class="rewards-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-family:'Fredoka', sans-serif; font-size:32px; font-weight:800; color:var(--text-color); margin:0;">👨‍👩‍👧 Parent Portal</h1>
          <p style="color:var(--text-light); margin:4px 0 0 0; font-size:15px;">Monitor and adjust learning variables for your children</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button id="btn-parents-switch-profile" class="btn btn-outline" style="padding:10px 18px; font-size:14px; font-weight:800; display:flex; align-items:center; gap:6px;">
            🔄 Switch Profile
          </button>
          <button id="btn-parents-exit" class="btn btn-outline" style="padding:10px 18px; font-size:14px; border-color:#EF4444; color:#EF4444;">
            🔒 Lock & Exit
          </button>
        </div>
      </div>
      
      <!-- Tab Controls -->
      <div class="rewards-tabs" style="display:flex; gap:12px; border-bottom: 3px solid var(--border-color); padding-bottom:12px; margin-bottom:24px; overflow-x:auto;">
        <button class="tab-btn ${activeParentsTab === 'progress' ? 'active' : ''}" data-tab="progress" style="padding:10px 20px; font-weight:800; border-radius:12px; border:none; cursor:pointer;">
          📊 Progress
        </button>
        <button class="tab-btn ${activeParentsTab === 'controls' ? 'active' : ''}" data-tab="controls" style="padding:10px 20px; font-weight:800; border-radius:12px; border:none; cursor:pointer;">
          ⚙️ Controls
        </button>
        <button class="tab-btn ${activeParentsTab === 'profiles' ? 'active' : ''}" data-tab="profiles" style="padding:10px 20px; font-weight:800; border-radius:12px; border:none; cursor:pointer;">
          👶 Profiles
        </button>
        <button class="tab-btn ${activeParentsTab === 'export' ? 'active' : ''}" data-tab="export" style="padding:10px 20px; font-weight:800; border-radius:12px; border:none; cursor:pointer;">
          📋 Export & Cards
        </button>
      </div>
      
      <div id="parents-tab-content"></div>
    </div>
  `;
  
  document.getElementById('btn-parents-exit').addEventListener('click', () => {
    playSound('click');
    setParentAuthorized(false);
    switchView('learn');
  });
  
  document.getElementById('btn-parents-switch-profile').addEventListener('click', () => {
    playSound('click');
    renderProfileSelectionOverlay();
  });
  
  viewContainer.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      activeParentsTab = btn.dataset.tab;
      renderParentsView();
    });
  });
  
  if (activeParentsTab === 'progress') {
    renderParentsProgressTab();
  } else if (activeParentsTab === 'controls') {
    renderParentsControlsTab();
  } else if (activeParentsTab === 'profiles') {
    renderParentsProfilesTab();
  } else if (activeParentsTab === 'export') {
    renderParentsExportTab();
  }
}

export function renderParentsProgressTab() {
  const content = document.getElementById('parents-tab-content');
  if (!content) return;
  
  const totalWords = Object.keys(state.wordStats).length;
  const masteredWords = Object.values(state.wordStats).filter(w => w.score >= 4).length;
  const weakWords = Object.values(state.wordStats).filter(w => w.score <= 2).length;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
  const baseMinutes = [12, 8, 15, 20, 10, 0, 0];
  baseMinutes[todayIdx] = state.todayMinutesSpent;
  const maxMin = Math.max(...baseMinutes, 20);
  
  content.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:18px; box-shadow:0 6px 0 var(--border-color);">
          <div style="font-size:32px; margin-bottom:8px;">🌟</div>
          <h3 style="font-size:14px; color:var(--text-light); margin:0;">XP & Gems</h3>
          <p style="font-size:24px; font-weight:800; color:var(--text-color); margin:4px 0 0 0;">${state.xp} XP / ${state.gems} 💎</p>
        </div>
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:18px; box-shadow:0 6px 0 var(--border-color);">
          <div style="font-size:32px; margin-bottom:8px;">🗺️</div>
          <h3 style="font-size:14px; color:var(--text-light); margin:0;">Lessons Mastered</h3>
          <p style="font-size:24px; font-weight:800; color:var(--text-color); margin:4px 0 0 0;">${state.completedLessons.length} / 20 levels</p>
        </div>
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:18px; box-shadow:0 6px 0 var(--border-color);">
          <div style="font-size:32px; margin-bottom:8px;">⏱️</div>
          <h3 style="font-size:14px; color:var(--text-light); margin:0;">Screen Time Today</h3>
          <p style="font-size:24px; font-weight:800; color:var(--text-color); margin:4px 0 0 0;">${state.todayMinutesSpent} / ${state.dailyTimeLimit || '∞'} min</p>
        </div>
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:18px; box-shadow:0 6px 0 var(--border-color);">
          <div style="font-size:32px; margin-bottom:8px;">🧠</div>
          <h3 style="font-size:14px; color:var(--text-light); margin:0;">Word Mastery</h3>
          <p style="font-size:24px; font-weight:800; color:var(--text-color); margin:4px 0 0 0;">${masteredWords} / ${totalWords} Words</p>
        </div>
      </div>
      
      <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:24px; box-shadow:0 6px 0 var(--border-color);">
        <h3 style="font-size:18px; font-weight:800; margin:0 0 16px 0; color:var(--text-color);">Weekly Activity (Minutes Spent)</h3>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; height:150px; padding:0 10px; border-bottom:3px solid var(--border-color);">
          ${days.map((day, idx) => {
            const mins = baseMinutes[idx];
            const pct = (mins / maxMin) * 100;
            const isToday = idx === todayIdx;
            const barBg = isToday ? 'var(--primary-color)' : 'var(--primary-light)';
            const barBorder = isToday ? 'var(--primary-dark)' : 'var(--border-color)';
            return `
              <div style="display:flex; flex-direction:column; align-items:center; width:10%; height:100%; justify-content:flex-end; gap:6px;">
                <span style="font-size:11px; font-weight:800; color:var(--text-light);">${mins}m</span>
                <div style="width:100%; height:${pct}%; background:${barBg}; border:2px solid ${barBorder}; border-bottom:none; border-top-left-radius:8px; border-top-right-radius:8px; transition:height 0.3s ease;"></div>
                <span style="font-size:11px; font-weight:800; color:${isToday ? 'var(--primary-color)' : 'var(--text-light)'}; margin-top:4px;">${day}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:24px; box-shadow:0 6px 0 var(--border-color);">
        <h3 style="font-size:18px; font-weight:800; margin:0 0 16px 0; color:var(--text-color);">Word Strengths & Weaknesses</h3>
        
        ${totalWords === 0 ? `
          <div style="text-align:center; padding:32px; color:var(--text-light);">
            <div style="font-size:48px; margin-bottom:12px;">🗺️</div>
            <p style="margin:0; font-size:15px; font-weight:700;">No word statistics recorded yet. Start practicing lessons on the map!</p>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
            <div>
              <h4 style="font-size:15px; font-weight:800; color:var(--primary-color); margin:0 0 12px 0;">🎉 Mastered Words (${masteredWords})</h4>
              <div style="display:flex; flex-wrap:wrap; gap:8px; max-height:200px; overflow-y:auto; padding:4px;">
                ${Object.entries(state.wordStats).filter(([k, w]) => w.score >= 4).map(([word, stats]) => {
                  const matchingLevelWord = findWordEmoji(word);
                  return `
                    <span style="background:rgba(16, 185, 129, 0.1); color:#047857; border:2px solid #10B981; border-radius:12px; padding:4px 10px; font-size:13px; font-weight:800; display:flex; align-items:center; gap:6px;">
                      <span>${matchingLevelWord ? matchingLevelWord.emoji : '📝'}</span>
                      <span>${word.charAt(0).toUpperCase() + word.slice(1)}</span>
                    </span>
                  `;
                }).join('') || `<span style="font-size:13px; color:var(--text-light); font-style:italic;">None yet</span>`}
              </div>
            </div>
            
            <div>
              <h4 style="font-size:15px; font-weight:800; color:#EF4444; margin:0 0 12px 0;">⚠️ Needs Review (${weakWords})</h4>
              <div style="display:flex; flex-wrap:wrap; gap:8px; max-height:200px; overflow-y:auto; padding:4px;">
                ${Object.entries(state.wordStats).filter(([k, w]) => w.score <= 2).map(([word, stats]) => {
                  const matchingLevelWord = findWordEmoji(word);
                  return `
                    <span style="background:rgba(239, 68, 68, 0.1); color:#B91C1C; border:2px solid #EF4444; border-radius:12px; padding:4px 10px; font-size:13px; font-weight:800; display:flex; align-items:center; gap:6px;">
                      <span>${matchingLevelWord ? matchingLevelWord.emoji : '📝'}</span>
                      <span>${word.charAt(0).toUpperCase() + word.slice(1)}</span>
                    </span>
                  `;
                }).join('') || `<span style="font-size:13px; color:var(--text-light); font-style:italic;">None yet</span>`}
              </div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

export function renderParentsControlsTab() {
  const content = document.getElementById('parents-tab-content');
  if (!content) return;
  
  const categoriesList = [
    { key: 'animals', name: 'Animals 🦖' },
    { key: 'fruits', name: 'Fruit 🍎' },
    { key: 'colors', name: 'Colors 🎨' },
    { key: 'family', name: 'Family 👨‍👩‍👦' },
    { key: 'shapes', name: 'Shapes 📐' },
    { key: 'numbers', name: 'Numbers 🔢' },
    { key: 'space', name: 'Space 🚀' },
    { key: 'ocean', name: 'Ocean 🐙' }
  ];
  
  content.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:20px; box-shadow:0 6px 0 var(--border-color);">
          <h3 style="font-size:18px; font-weight:800; margin:0 0 16px 0; color:var(--text-color);">⏱️ Screen Limits</h3>
          
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:14px; font-weight:800; color:var(--text-light); margin-bottom:8px;">
              Daily Screen Time Limit: <span id="val-time-limit" style="color:var(--primary-color); font-weight:800;">${state.dailyTimeLimit === 0 ? 'No Limit' : state.dailyTimeLimit + ' minutes'}</span>
            </label>
            <input type="range" id="input-time-limit" min="0" max="60" step="5" value="${state.dailyTimeLimit}" style="width:100%; height:8px; border-radius:4px; accent-color:var(--primary-color); cursor:pointer;">
            <span style="font-size:11px; color:var(--text-light); font-style:italic;">Setting to 0 disables screen time lockouts.</span>
          </div>
          
          <div>
            <label style="display:block; font-size:14px; font-weight:800; color:var(--text-light); margin-bottom:8px;">
              Daily Lesson Goal: <span id="val-lesson-goal" style="color:var(--primary-color); font-weight:800;">${state.dailyGoal} ${state.dailyGoal === 1 ? 'lesson' : 'lessons'}</span>
            </label>
            <input type="range" id="input-lesson-goal" min="1" max="5" step="1" value="${state.dailyGoal}" style="width:100%; height:8px; border-radius:4px; accent-color:var(--primary-color); cursor:pointer;">
          </div>
        </div>
        
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:20px; box-shadow:0 6px 0 var(--border-color);">
          <h3 style="font-size:18px; font-weight:800; margin:0 0 16px 0; color:var(--text-color);">🧠 Learning Controls</h3>
          
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:14px; font-weight:800; color:var(--text-light); margin-bottom:8px;">Adaptive Difficulty</label>
            <div style="display:flex; gap:10px;">
              ${['easy', 'medium', 'hard'].map(diff => {
                const isActive = state.difficulty === diff;
                const btnBg = isActive ? 'var(--primary-color)' : 'var(--card-bg)';
                const btnColor = isActive ? 'white' : 'var(--text-color)';
                const btnBorder = isActive ? 'var(--primary-dark)' : 'var(--border-color)';
                return `
                  <button class="btn-diff-select" data-diff="${diff}" style="flex:1; padding:10px 0; font-weight:800; background:${btnBg}; color:${btnColor}; border:3px solid ${btnBorder}; border-radius:12px; cursor:pointer;">
                    ${diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
          
          <div>
            <label style="display:flex; justify-content:space-between; align-items:center; font-size:14px; font-weight:800; color:var(--text-light); cursor:pointer;">
              <span>Hide Vietnamese Translations</span>
              <input type="checkbox" id="input-hide-trans" ${state.hideTranslations ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary-color);">
            </label>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-light); font-style:italic;">Hiding translations challenges toddlers to learn meanings purely by context emojis.</p>
          </div>
        </div>
      </div>
      
      <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:24px; box-shadow:0 6px 0 var(--border-color);">
        <h3 style="font-size:18px; font-weight:800; margin:0 0 8px 0; color:var(--text-color);">📚 Content Filter</h3>
        <p style="color:var(--text-light); margin:0 0 16px 0; font-size:13px;">Enable or disable specific topics on the child's learning path.</p>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:12px;">
          ${categoriesList.map(cat => {
            const isDisabled = state.disabledCategories.includes(cat.key);
            return `
              <label style="display:flex; align-items:center; gap:10px; padding:12px; border:2px solid var(--border-color); border-radius:16px; background:${isDisabled ? 'rgba(0,0,0,0.02)' : 'var(--card-bg)'}; cursor:pointer; font-weight:800; font-size:14px;">
                <input type="checkbox" class="input-cat-toggle" data-cat="${cat.key}" ${!isDisabled ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--primary-color);">
                <span style="opacity:${isDisabled ? 0.5 : 1};">${cat.name}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
  
  const timeSlider = document.getElementById('input-time-limit');
  timeSlider.addEventListener('input', () => {
    state.dailyTimeLimit = parseInt(timeSlider.value);
    document.getElementById('val-time-limit').innerText = state.dailyTimeLimit === 0 ? 'No Limit' : state.dailyTimeLimit + ' minutes';
    saveState();
  });
  
  const goalSlider = document.getElementById('input-lesson-goal');
  goalSlider.addEventListener('input', () => {
    state.dailyGoal = parseInt(goalSlider.value);
    document.getElementById('val-lesson-goal').innerText = state.dailyGoal + (state.dailyGoal === 1 ? ' lesson' : ' lessons');
    saveState();
  });
  
  content.querySelectorAll('.btn-diff-select').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      state.difficulty = btn.dataset.diff;
      saveState();
      renderParentsControlsTab();
    });
  });
  
  const transToggle = document.getElementById('input-hide-trans');
  transToggle.addEventListener('change', () => {
    playSound('click');
    state.hideTranslations = transToggle.checked;
    saveState();
  });
  
  content.querySelectorAll('.input-cat-toggle').forEach(chk => {
    chk.addEventListener('change', () => {
      playSound('click');
      const cat = chk.dataset.cat;
      if (chk.checked) {
        state.disabledCategories = state.disabledCategories.filter(c => c !== cat);
      } else {
        if (!state.disabledCategories.includes(cat)) {
          state.disabledCategories.push(cat);
        }
      }
      saveState();
      renderParentsControlsTab();
    });
  });
}

export function renderParentsProfilesTab() {
  const content = document.getElementById('parents-tab-content');
  if (!content) return;
  
  const avatarsList = ["🦖", "🦄", "🐼", "🦁", "🐯", "🐰", "🐨", "🐱"];
  
  content.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div>
        <h3 style="font-size:18px; font-weight:800; margin:0 0 16px 0; color:var(--text-color);">👶 Manage Child Profiles (Max 4)</h3>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:20px;">
          ${state.profiles.map(prof => {
            const isActive = prof.id === state.currentProfileId;
            return `
              <div style="background:var(--card-bg); border:3px solid ${isActive ? 'var(--primary-color)' : 'var(--border-color)'}; border-radius:20px; padding:20px; text-align:center; box-shadow: 0 6px 0 ${isActive ? 'var(--primary-light)' : 'var(--border-color)'}; display:flex; flex-direction:column; align-items:center; justify-content:space-between; position:relative;">
                ${isActive ? `<span style="position:absolute; top:12px; right:12px; background:var(--primary-color); color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">✓</span>` : ''}
                
                <div>
                  <div style="font-size:54px; margin-bottom:12px;">${prof.avatar || '👶'}</div>
                  <h4 style="font-size:18px; font-weight:800; margin:0 0 4px 0; color:var(--text-color);">${prof.name}</h4>
                  <p style="margin:0 0 12px 0; font-size:13px; color:var(--text-light); font-weight:700;">Age: ${prof.age} years | Level: ${prof.unlockedLevelId}</p>
                  <p style="margin:0 0 16px 0; font-size:12px; background:rgba(0,0,0,0.04); padding:4px 8px; border-radius:8px; font-weight:800; color:var(--text-light);">${prof.xp} XP | ${prof.gems} 💎</p>
                </div>
                
                <div style="width:100%; display:flex; flex-direction:column; gap:8px;">
                  ${isActive ? `
                    <button disabled style="width:100%; padding:10px 0; border-radius:12px; border:none; background:var(--primary-light); color:var(--primary-color); font-weight:800;">Active</button>
                  ` : `
                    <button class="btn-profile-switch" data-id="${prof.id}" style="width:100%; padding:10px 0; border-radius:12px; border:3px solid var(--primary-color); background:var(--primary-color); color:white; font-weight:800; cursor:pointer;">Switch Profile</button>
                  `}
                  
                  ${state.profiles.length > 1 && !isActive ? `
                    <button class="btn-profile-delete" data-id="${prof.id}" style="width:100%; padding:8px 0; border-radius:12px; border:3px solid #EF4444; background:none; color:#EF4444; font-weight:800; font-size:12px; cursor:pointer;">Delete</button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      ${state.profiles.length < 4 ? `
        <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:24px; box-shadow:0 6px 0 var(--border-color);">
          <h3 style="font-size:18px; font-weight:800; margin:0 0 16px 0; color:var(--text-color);">➕ Add a Child Profile</h3>
          <form id="form-create-profile" style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div>
                <label style="display:block; font-size:14px; font-weight:800; color:var(--text-light); margin-bottom:8px;">Child's Name</label>
                <input type="text" id="prof-name-input" required placeholder="E.g. Minh" style="width:100%; padding:12px; border:2px solid var(--border-color); border-radius:12px; font-weight:800; font-family:inherit;">
              </div>
              <div>
                <label style="display:block; font-size:14px; font-weight:800; color:var(--text-light); margin-bottom:8px;">Age: <span id="prof-age-val" style="color:var(--primary-color);">4</span> years</label>
                <input type="range" id="prof-age-input" min="2" max="10" value="4" style="width:100%; height:8px; accent-color:var(--primary-color); cursor:pointer; margin-top:14px;">
              </div>
            </div>
            
            <div>
              <label style="display:block; font-size:14px; font-weight:800; color:var(--text-light); margin-bottom:8px;">Select Avatar</label>
              <div style="display:flex; gap:12px; flex-wrap:wrap;">
                ${avatarsList.map((av, index) => `
                  <label style="border:3px solid var(--border-color); border-radius:16px; padding:10px; font-size:32px; cursor:pointer; text-align:center; flex:1; min-width:50px; transition:all 0.15s; display:inline-block; user-select:none;" class="avatar-label-option ${index === 0 ? 'selected' : ''}">
                    <input type="radio" name="prof-avatar" value="${av}" ${index === 0 ? 'checked' : ''} style="display:none;">
                    <span>${av}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary" style="align-self:flex-start; padding:12px 24px;">Create Profile</button>
          </form>
        </div>
      ` : ''}
    </div>
  `;
  
  content.querySelectorAll('.btn-profile-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const id = btn.dataset.id;
      loadProfileState(id);
      renderParentsView();
      speak(`Switched to profile!`);
    });
  });
  
  content.querySelectorAll('.btn-profile-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const id = btn.dataset.id;
      const targetProf = state.profiles.find(p => p.id === id);
      if (confirm(`Are you sure you want to delete profile "${targetProf.name}"? This will erase all of their progress permanently.`)) {
        state.profiles = state.profiles.filter(p => p.id !== id);
        saveState();
        renderParentsView();
      }
    });
  });
  
  const ageSlider = document.getElementById('prof-age-input');
  if (ageSlider) {
    ageSlider.addEventListener('input', () => {
      document.getElementById('prof-age-val').innerText = ageSlider.value;
    });
  }
  
  const labels = content.querySelectorAll('.avatar-label-option');
  labels.forEach(lbl => {
    lbl.addEventListener('click', () => {
      playSound('click');
      labels.forEach(l => {
        l.classList.remove('selected');
        l.style.borderColor = 'var(--border-color)';
      });
      lbl.classList.add('selected');
      lbl.style.borderColor = 'var(--primary-color)';
    });
  });
  
  const form = document.getElementById('form-create-profile');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('correct');
      const name = document.getElementById('prof-name-input').value.trim();
      const age = parseInt(document.getElementById('prof-age-input').value);
      const avatar = form.querySelector('input[name="prof-avatar"]:checked').value;
      
      const newProfile = {
        id: "p_" + Date.now(),
        name: name,
        age: age,
        avatar: avatar,
        xp: 0,
        streak: 1,
        unlockedLevelId: 1,
        completedLessons: [],
        wordStats: {},
        gems: 120,
        purchasedOutfits: ['default'],
        activeOutfit: 'default',
        purchasedThemes: ['default'],
        activeTheme: 'default',
        companionEgg: null,
        companionAnimal: null,
        completedAchievements: []
      };
      
      state.profiles.push(newProfile);
      saveState();
      
      loadProfileState(newProfile.id);
      renderParentsView();
      speak(`Welcome, ${name}!`);
    });
  }
}

export function renderParentsExportTab() {
  const content = document.getElementById('parents-tab-content');
  if (!content) return;
  
  const encounteredWords = Object.keys(state.wordStats);
  
  content.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:20px; box-shadow:0 6px 0 var(--border-color); display:flex; justify-content:space-between; flex-wrap:wrap; gap:16px; align-items:center;">
        <div>
          <h3 style="font-size:18px; font-weight:800; margin:0 0 4px 0; color:var(--text-color);">📋 Learning Exports & Flashcards</h3>
          <p style="color:var(--text-light); margin:0; font-size:13px;">Generate physical activities or share accomplishments with teachers.</p>
        </div>
        <div style="display:flex; gap:12px;">
          <button id="btn-print-cards" class="btn btn-primary" style="padding:10px 18px;">🖨️ Print Sheet</button>
          <button id="btn-copy-csv" class="btn btn-outline" style="padding:10px 18px;">📋 Copy CSV</button>
        </div>
      </div>
      
      <div class="print-section-wrapper" style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:24px; box-shadow:0 6px 0 var(--border-color);">
        <h4 style="font-size:16px; font-weight:800; color:var(--text-color); margin:0 0 16px 0;">Printable Cut-out Flashcards Preview (Only prints cards)</h4>
        
        ${encounteredWords.length === 0 ? `
          <div style="text-align:center; padding:32px; color:var(--text-light);">
            <p style="margin:0; font-size:14px; font-style:italic;">No words practiced yet. Complete lessons to unlock flashcards.</p>
          </div>
        ` : `
          <div class="flashcards-print-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:16px; border:2px dashed var(--border-color); padding:16px; border-radius:12px; background:white;">
            ${encounteredWords.map(word => {
              const item = findWordEmoji(word);
              return `
                <div style="border: 2px dashed #94A3B8; border-radius:8px; padding:16px; text-align:center; background:#FFF; color:#000;">
                  <div style="font-size:36px; margin-bottom:8px;">${item ? item.emoji : '📝'}</div>
                  <div style="font-family:'Fredoka', sans-serif; font-size:18px; font-weight:800; color:#0F172A; text-transform:capitalize;">${word}</div>
                  <div style="font-size:12px; color:#64748B; margin-top:4px; font-style:italic;">"${item && item.translation ? item.translation : word}"</div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
      
      <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:24px; box-shadow:0 6px 0 var(--border-color);">
        <h4 style="font-size:16px; font-weight:800; color:var(--text-color); margin:0 0 16px 0;">WhatsApp/Social Share Card Collage</h4>
        
        <div style="display:flex; gap:24px; flex-wrap:wrap; align-items:center;">
          <div id="collage-preview-card" style="width:300px; background:linear-gradient(135deg, #059669 0%, #10B981 100%); border-radius:20px; padding:20px; color:white; box-shadow:0 10px 24px rgba(16, 185, 129, 0.3); text-align:center;">
            <h5 style="font-family:'Fredoka', sans-serif; font-size:18px; font-weight:800; margin:0 0 4px 0;">Zen-Duo Champ! 🏆</h5>
            <p style="font-size:12px; margin:0 0 16px 0; color:#ECFDF5;">Look what my child learned this week!</p>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:16px;">
              ${encounteredWords.slice(0, 4).map(word => {
                const item = findWordEmoji(word);
                return `
                  <div style="background:rgba(255,255,255,0.15); border-radius:12px; padding:10px; text-align:center;">
                    <div style="font-size:28px;">${item ? item.emoji : '📝'}</div>
                    <div style="font-size:12px; font-weight:800; text-transform:capitalize; margin-top:4px;">${word}</div>
                  </div>
                `;
              }).join('') || `
                <div style="grid-column: span 2; padding:20px; font-size:12px;">Complete lessons to fill collage!</div>
              `}
            </div>
            
            <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
              <span style="font-size:24px;">🦖</span>
              <span style="font-size:13px; font-weight:800;">Learned ${encounteredWords.length} words!</span>
            </div>
          </div>
          
          <div style="flex:1; min-width:200px;">
            <p style="margin:0 0 16px 0; font-size:14px; color:var(--text-light); line-height:1.5;">
              Showcase your child's learning journey! Copy this collage link to share directly on WhatsApp, Facebook, or with teachers.
            </p>
            <button id="btn-share-collage" class="btn btn-outline" style="padding:10px 18px;">
              🔗 Share Collage Link
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('btn-print-cards').addEventListener('click', () => {
    playSound('click');
    window.print();
  });
  
  document.getElementById('btn-copy-csv').addEventListener('click', () => {
    playSound('click');
    
    let csv = "Word,Emoji,Stars,Attempts\n";
    encounteredWords.forEach(word => {
      const stats = state.wordStats[word];
      const item = findWordEmoji(word);
      csv += `${word},${item ? item.emoji : '📝'},${stats.score},${stats.attempts}\n`;
    });
    
    navigator.clipboard.writeText(csv).then(() => {
      alert("CSV copied to clipboard!");
    });
  });
  
  document.getElementById('btn-share-collage').addEventListener('click', () => {
    playSound('click');
    const childName = state.profiles.find(p => p.id === state.currentProfileId)?.name || 'Junior';
    navigator.clipboard.writeText(`Look at what my child ${childName} learned this week on Zen-Duo! 🌟 They mastered ${encounteredWords.length} new words!`).then(() => {
      alert("Share link copied to clipboard!");
    });
  });
}

export function saveCurrentProfileState() {
  if (!state.currentProfileId) return;
  let prof = state.profiles.find(p => p.id === state.currentProfileId);
  if (!prof) return;
  
  prof.xp = state.xp;
  prof.streak = state.streak;
  prof.unlockedLevelId = state.unlockedLevelId;
  prof.completedLessons = [...state.completedLessons];
  prof.wordStats = { ...state.wordStats };
  prof.gems = state.gems;
  prof.purchasedOutfits = [...state.purchasedOutfits];
  prof.activeOutfit = state.activeOutfit;
  prof.purchasedThemes = [...state.purchasedThemes];
  prof.activeTheme = state.activeTheme;
  prof.companionEgg = state.companionEgg ? { ...state.companionEgg } : null;
  prof.companionAnimal = state.companionAnimal ? { ...state.companionAnimal } : null;
  prof.completedAchievements = [...state.completedAchievements];
  
  saveState();
}

export function loadProfileState(profileId) {
  saveCurrentProfileState();
  
  const prof = state.profiles.find(p => p.id === profileId);
  if (!prof) return;
  
  state.currentProfileId = profileId;
  state.xp = prof.xp || 0;
  state.streak = prof.streak || 1;
  state.unlockedLevelId = prof.unlockedLevelId || 1;
  state.completedLessons = prof.completedLessons || [];
  state.wordStats = prof.wordStats || {};
  state.gems = prof.gems !== undefined ? prof.gems : 120;
  state.purchasedOutfits = prof.purchasedOutfits || ['default'];
  state.activeOutfit = prof.activeOutfit || 'default';
  state.purchasedThemes = prof.purchasedThemes || ['default'];
  state.activeTheme = prof.activeTheme || 'default';
  state.companionEgg = prof.companionEgg || null;
  state.companionAnimal = prof.companionAnimal || null;
  state.completedAchievements = prof.completedAchievements || [];
  
  saveState();
}

export function initProfilesIfNeeded() {
  if (!state.profiles) state.profiles = [];
  if (state.profiles.length === 0) {
    const defaultProfile = {
      id: "p_" + Date.now(),
      name: "Junior",
      age: 4,
      avatar: "🦖",
      xp: state.xp,
      streak: state.streak,
      unlockedLevelId: state.unlockedLevelId,
      completedLessons: [...state.completedLessons],
      wordStats: { ...state.wordStats },
      gems: state.gems,
      purchasedOutfits: [...state.purchasedOutfits],
      activeOutfit: state.activeOutfit,
      purchasedThemes: [...state.purchasedThemes],
      activeTheme: state.activeTheme,
      companionEgg: state.companionEgg,
      companionAnimal: state.companionAnimal,
      completedAchievements: [...state.completedAchievements]
    };
    state.profiles.push(defaultProfile);
    state.currentProfileId = defaultProfile.id;
    saveState();
  }
}

export function renderProfileSelectionOverlay() {
  const existing = document.getElementById('profile-selection-overlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'profile-selection-overlay';
  overlay.className = 'profile-selection-overlay';
  
  overlay.innerHTML = `
    <div class="profile-selection-card">
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center; margin-bottom:24px;">
        <h2 style="font-family:'Fredoka', sans-serif; font-size:24px; color:var(--text-color); margin:0;">Who is learning today? 👶</h2>
        <button id="btn-profile-parent-gate" style="border:3px solid var(--border-color); background:none; border-radius:12px; padding:6px 12px; font-weight:800; cursor:pointer; font-size:13px; display:flex; align-items:center; gap:6px;">
          🔒 Parents
        </button>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap:16px; width:100%; max-width:480px; margin:0 auto 20px;">
        ${state.profiles.map(p => `
          <div class="profile-select-item" data-id="${p.id}" style="border:3px solid var(--border-color); border-radius:20px; padding:16px; text-align:center; cursor:pointer; background:var(--card-bg); box-shadow:0 6px 0 var(--border-color); transition:all 0.1s;">
            <div style="font-size:48px; margin-bottom:8px;">${p.avatar || '🦖'}</div>
            <div style="font-weight:800; font-size:14px; color:var(--text-color); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.name}</div>
          </div>
        `).join('')}
        
        ${state.profiles.length < 4 ? `
          <div id="btn-profile-add-new" style="border:3px dashed var(--border-color); border-radius:20px; padding:16px; text-align:center; cursor:pointer; background:var(--card-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:108px;">
            <div style="font-size:32px; color:var(--text-light); font-weight:800;">＋</div>
            <div style="font-weight:800; font-size:12px; color:var(--text-light); margin-top:4px;">Add Profile</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  overlay.querySelectorAll('.profile-select-item').forEach(item => {
    item.addEventListener('click', () => {
      playSound('click');
      const id = item.dataset.id;
      loadProfileState(id);
      overlay.remove();
      switchView('learn');
    });
  });
  
  document.getElementById('btn-profile-parent-gate').addEventListener('click', () => {
    playSound('click');
    promptParentPin(
      () => {
        setParentAuthorized(true);
        overlay.remove();
        switchView('parents');
      },
      () => {}
    );
  });
  
  const addBtn = document.getElementById('btn-profile-add-new');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      playSound('click');
      promptParentPin(
        () => {
          setParentAuthorized(true);
          overlay.remove();
          // We can use a module variable or export to track/active profile tab
          // But activeParentsTab can just be changed directly
          activeParentsTab = 'profiles';
          switchView('parents');
        },
        () => {}
      );
    });
  }
}

export function triggerTimeLimitLock() {
  if (isLockedByTimeLimit) return;
  isLockedByTimeLimit = true;
  
  playSound('error');
  
  const overlay = document.createElement('div');
  overlay.id = 'time-limit-lockoverlay';
  overlay.className = 'profile-selection-overlay';
  overlay.style.zIndex = '10000';
  
  overlay.innerHTML = `
    <div class="profile-selection-card" style="text-align:center;">
      <div style="font-size:72px; margin-bottom:16px;">😴</div>
      <h2 style="font-family:'Fredoka', sans-serif; font-size:28px; color:var(--text-color); margin:0 0 12px 0;">Zen says: Time for a break!</h2>
      <p style="color:var(--text-light); font-size:16px; line-height:1.6; margin-bottom:24px;">
        You have reached your daily learning limit of <strong>${state.dailyTimeLimit} minutes</strong>. Let's rest our eyes and play again tomorrow!
      </p>
      <button id="btn-unlock-time-limit" style="border:3px solid var(--border-color); background:none; border-radius:12px; padding:10px 20px; font-weight:800; cursor:pointer;">
        🔒 Parent Unlock
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('btn-unlock-time-limit').addEventListener('click', () => {
    playSound('click');
    promptParentPin(
      () => {
        state.dailyTimeLimit += 20;
        saveState();
        isLockedByTimeLimit = false;
        overlay.remove();
        speak("Unlocked! You have 20 more minutes.");
      },
      () => {}
    );
  });
}
