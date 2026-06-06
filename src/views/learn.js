import { state, LEVELS } from '../state.js';
import { playSound } from '../audio.js';
import { getZenMascotSVG } from '../zen-mascot.js';
import { speak } from '../tts.js';
import { startLesson } from './lesson.js';

export function drawPathTrail() {
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

export function checkFirstRunOnboarding() {
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

export function isLevelDisabledByParent(level) {
  if (!state.disabledCategories || state.disabledCategories.length === 0) return false;
  const title = level.title.toLowerCase();
  const mappings = {
    animals: ['pets', 'animal', 'bird', 'dog', 'cat'],
    fruits: ['food', 'fruit', 'eat', 'drink', 'apple', 'banana'],
    colors: ['color', 'sky & colors'],
    family: ['family', 'home', 'people', 'hello world'],
    shapes: ['shape'],
    numbers: ['number', '1-10', '10-20'],
    space: ['space', 'star', 'planet', 'sky', 'weather'],
    ocean: ['ocean', 'sea', 'fish', 'shark', 'octopus']
  };
  for (const cat of state.disabledCategories) {
    const keywords = mappings[cat] || [];
    if (keywords.some(kw => title.includes(kw))) {
      return true;
    }
  }
  return false;
}

export function renderLearnView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  viewContainer.innerHTML = `
    <div class="path-map" id="path-map">
      <svg class="path-map-svg" id="path-map-svg">
        <path class="locked" id="path-locked"></path>
        <path class="completed" id="path-completed"></path>
      </svg>
      <div class="map-mascot-container" id="map-mascot"></div>
      
      <!-- Daily Challenge widget -->
      <div class="daily-challenge-node" id="daily-challenge-btn" title="Daily Challenge">
        <div class="daily-pulse-ring"></div>
        <span class="daily-icon">⭐</span>
        <div class="daily-badge-tooltip">Daily Challenge</div>
      </div>
    </div>
  `;
  
  const mapContainer = document.getElementById('path-map');
  
  // Wire up Daily Challenge node handler
  const dailyBtn = document.getElementById('daily-challenge-btn');
  if (dailyBtn) {
    const todayStr = new Date().toDateString();
    const lastDailyCompleted = localStorage.getItem('zd_daily_completed_date');
    if (lastDailyCompleted === todayStr) {
      dailyBtn.classList.add('completed');
      dailyBtn.querySelector('.daily-icon').innerText = '✅';
    }
    dailyBtn.addEventListener('click', () => {
      playSound('click');
      if (localStorage.getItem('zd_daily_completed_date') === todayStr) {
        speak("You already completed the daily challenge! Come back tomorrow!");
        return;
      }
      const allChallenges = [];
      LEVELS.forEach(lvl => {
        lvl.lessons.forEach(l => {
          l.challenges.forEach(ch => {
            allChallenges.push(ch);
          });
        });
      });
      if (allChallenges.length === 0) return;
      const dailyChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 3);
      const dailyLesson = {
        id: "daily_challenge",
        title: "⭐ Daily Star Challenge",
        challenges: dailyChallenges,
        isDaily: true
      };
      startLesson(dailyLesson);
    });
  }
  
  LEVELS.forEach((level) => {
    const isDisabled = isLevelDisabledByParent(level);
    const isUnlocked = level.id <= state.unlockedLevelId && !isDisabled;
    const isCompleted = level.lessons.every(l => state.completedLessons.includes(l.id));
    
    let nodeClass = 'locked';
    if (isDisabled) nodeClass = 'locked disabled-parent';
    else if (isCompleted) nodeClass = 'completed';
    else if (isUnlocked) nodeClass = 'active';
    
    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'map-node-container';
    
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `map-node ${nodeClass}`;
    node.dataset.levelId = level.id;
    node.innerHTML = `<span>${isDisabled ? '🔒' : level.icon}</span>`;
    
    if (isDisabled) {
      node.addEventListener('click', () => {
        playSound('error');
        speak("This topic is turned off by your parents in the Parent Portal.");
      });
    } else if (isUnlocked) {
      node.addEventListener('click', () => {
        const nextLesson = level.lessons.find(l => !state.completedLessons.includes(l.id)) || level.lessons[0];
        startLesson(nextLesson);
      });
    }
    
    const label = document.createElement('div');
    label.className = 'node-label';
    label.innerText = isDisabled ? `${level.title} (Hidden)` : level.title;
    
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
