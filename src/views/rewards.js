import { state, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { speak } from '../tts.js';
import { getZenMascotSVG } from '../zen-mascot.js';
import { updateStatsUI, switchView } from '../router.js';
import { showModal } from '../modal.js';
import confetti from 'canvas-confetti';

let activeRewardsTab = 'shop';

export const ACHIEVEMENTS_LIST = [
  { id: 'first_lesson', title: 'First Lesson 🌟', desc: 'Completed your very first lesson!', target: 1 },
  { id: 'explorer_5', title: 'Level Explorer 🗺️', desc: 'Reached Level 5 on the map path!', target: 5 },
  { id: 'scholar_10', title: 'Scholar Badge 🎓', desc: 'Mastered 10 or more words!', target: 10 },
  { id: 'streaker_7', title: 'Week Streaker 🔥', desc: 'Maintained a 7-day learning streak!', target: 7 },
  { id: 'champion_perfect', title: 'Champion Practitioner 🏆', desc: 'Completed a lesson with zero mistakes (5 hearts)!', target: 1 },
  { id: 'curious_sandbox', title: 'Curious Explorer 🔍', desc: 'Completed 20 sandbox dictionary looks!', target: 20 },
  { id: 'daily_challenger', title: 'Daily Star ✨', desc: 'Conquered a Daily Challenge node!', target: 1 }
];

export function checkStreakFreezeAndProgress() {
  const todayStr = new Date().toDateString();
  const lastDate = state.lastActivityDate;
  
  if (!lastDate) {
    state.lastActivityDate = todayStr;
    saveState();
    return;
  }
  
  if (lastDate === todayStr) return;
  
  const lastTime = new Date(lastDate).getTime();
  const todayTime = new Date(todayStr).getTime();
  const diffTime = todayTime - lastTime;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    if (state.hasStreakFreeze) {
      state.hasStreakFreeze = false;
      saveState();
      setTimeout(() => {
        speak("Streak shield activated! Your daily learning streak is safe!");
        showModal('curiosity-unlocked', { 
          catName: "Streak Freeze Used! 🛡️", 
          emoji: "✨" 
        });
      }, 1000);
    } else {
      state.streak = 1;
      saveState();
      setTimeout(() => {
        speak("Streak reset. Don't worry, let's start learning again today!");
        showModal('curiosity-unlocked', { 
          catName: "Streak Reset! 🔥", 
          emoji: "🐣" 
        });
      }, 1000);
    }
  } else if (diffDays === 1) {
    // Incremented streak
    state.streak++;
    saveState();
  }
  
  state.lastActivityDate = todayStr;
  saveState();
}

export function checkAchievementsProgress() {
  if (!state.completedAchievements) state.completedAchievements = [];
  
  // 1. First lesson
  if (state.completedLessons.length >= 1) {
    unlockAchievement('first_lesson');
  }
  // 2. Explorer 5
  if (state.unlockedLevelId >= 5) {
    unlockAchievement('explorer_5');
  }
  // 3. Scholar 10
  const masteredWords = Object.keys(state.wordStats).filter(w => state.wordStats[w].score >= 4).length;
  if (masteredWords >= 10) {
    unlockAchievement('scholar_10');
  }
  // 4. Streaker 7
  if (state.streak >= 7) {
    unlockAchievement('streaker_7');
  }
  // 5. Curious sandbox
  if (state.sandboxHistory.length >= 20) {
    unlockAchievement('curious_sandbox');
  }
}

export function unlockAchievement(id) {
  if (state.completedAchievements.includes(id)) return;
  state.completedAchievements.push(id);
  state.gems += 50; // Give 50 Gems reward!
  saveState();
  updateStatsUI();
  
  speak("Woohoo! Achievement unlocked!");
  const toast = document.createElement('div');
  toast.className = 'achievement-toast bounce-in';
  toast.innerHTML = `
    <span class="toast-trophy">🏆</span>
    <div class="toast-content">
      <div class="toast-title">Achievement Unlocked!</div>
      <div class="toast-desc">${ACHIEVEMENTS_LIST.find(a => a.id === id)?.title || id} (+50 💎)</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

export function triggerAchievement(id) {
  unlockAchievement(id);
}

export function applyActiveTheme() {
  document.body.classList.remove('theme-jungle', 'theme-space', 'theme-ocean');
  if (state.activeTheme && state.activeTheme !== 'default') {
    document.body.classList.add(`theme-${state.activeTheme}`);
  }
}

export function renderRewardsView() {
  applyActiveTheme();
  
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  viewContainer.innerHTML = `
    <div class="rewards-container">
      <div class="reading-header">
        <h1>💎 Rewards Center</h1>
        <p>Spend your gems, hatch companion animals, and check your trophy achievements!</p>
      </div>
      
      <!-- Sub Tabs navigation -->
      <div class="rewards-tabs-row" style="display:flex; justify-content:center; gap:12px; margin-bottom:24px;">
        <button type="button" class="btn-3d ${activeRewardsTab === 'shop' ? 'btn-primary' : 'btn-outline'}" id="tab-rewards-shop">🛒 Cosmetics Shop</button>
        <button type="button" class="btn-3d ${activeRewardsTab === 'companion' ? 'btn-primary' : 'btn-outline'}" id="tab-rewards-companion">🥚 Companion Egg</button>
        <button type="button" class="btn-3d ${activeRewardsTab === 'trophy' ? 'btn-primary' : 'btn-outline'}" id="tab-rewards-trophy">🏆 Trophy Room</button>
      </div>
      
      <div id="rewards-tab-content"></div>
    </div>
  `;
  
  document.getElementById('tab-rewards-shop').addEventListener('click', () => {
    playSound('click');
    activeRewardsTab = 'shop';
    renderRewardsView();
  });
  document.getElementById('tab-rewards-companion').addEventListener('click', () => {
    playSound('click');
    activeRewardsTab = 'companion';
    renderRewardsView();
  });
  document.getElementById('tab-rewards-trophy').addEventListener('click', () => {
    playSound('click');
    activeRewardsTab = 'trophy';
    renderRewardsView();
  });
  
  if (activeRewardsTab === 'shop') {
    renderShopTab();
  } else if (activeRewardsTab === 'companion') {
    renderCompanionTab();
  } else if (activeRewardsTab === 'trophy') {
    renderTrophyTab();
  }
}

export function renderShopTab() {
  const content = document.getElementById('rewards-tab-content');
  if (!content) return;
  
  const shopItems = {
    outfits: [
      { id: 'astronaut', title: 'Astronaut Helmet', desc: 'Outfit Zen with a shiny space helmet bubble.', cost: 100, icon: '👨‍🚀' },
      { id: 'chef', title: 'Chef Hat', desc: 'Make Zen look like a master gourmet chef.', cost: 60, icon: '👨‍🍳' },
      { id: 'knight', title: 'Knight Helmet', desc: 'Give Zen a silver helmet with a red feather plume.', cost: 80, icon: '🛡️' }
    ],
    themes: [
      { id: 'jungle', title: 'Jungle Wilderness', desc: 'A wild forest green theme background for the map path.', cost: 50, icon: '🌴' },
      { id: 'space', title: 'Cosmic Outer-space', desc: 'A dark cyber-space background pattern with stars.', cost: 75, icon: '🌌' },
      { id: 'ocean', title: 'Ocean Deep Sea', desc: 'A soothing aquamarine underwater background.', cost: 60, icon: '🐙' }
    ],
    consumables: [
      { id: 'freeze', title: 'Streak Freeze Shield', desc: 'Automatically saves your streak if you miss a day.', cost: 50, icon: '🛡️' }
    ]
  };
  
  content.innerHTML = `
    <div class="shop-grid">
      <div class="shop-category-section">
        <h2>🐧 Zen Mascot Outfits</h2>
        <div class="shop-cards-row">
          ${shopItems.outfits.map(item => {
            const isPurchased = state.purchasedOutfits.includes(item.id);
            const isActive = state.activeOutfit === item.id;
            let actionBtn = `<button class="btn-3d btn-primary btn-shop-buy" data-item-id="${item.id}" data-item-type="outfit" data-cost="${item.cost}">Buy for ${item.cost} 💎</button>`;
            if (isActive) {
              actionBtn = `<button class="btn-3d btn-secondary" disabled>Active ✅</button>`;
            } else if (isPurchased) {
              actionBtn = `<button class="btn-3d btn-outline btn-shop-equip" data-item-id="${item.id}" data-item-type="outfit">Equip</button>`;
            }
            return `
              <div class="shop-card">
                <span class="shop-item-icon">${item.icon}</span>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                ${actionBtn}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="shop-category-section" style="margin-top: 32px;">
        <h2>🗺️ Map Background Themes</h2>
        <div class="shop-cards-row">
          ${shopItems.themes.map(item => {
            const isPurchased = state.purchasedThemes.includes(item.id);
            const isActive = state.activeTheme === item.id;
            let actionBtn = `<button class="btn-3d btn-primary btn-shop-buy" data-item-id="${item.id}" data-item-type="theme" data-cost="${item.cost}">Buy for ${item.cost} 💎</button>`;
            if (isActive) {
              actionBtn = `<button class="btn-3d btn-secondary" disabled>Active ✅</button>`;
            } else if (isPurchased) {
              actionBtn = `<button class="btn-3d btn-outline btn-shop-equip" data-item-id="${item.id}" data-item-type="theme">Equip</button>`;
            }
            return `
              <div class="shop-card">
                <span class="shop-item-icon">${item.icon}</span>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                ${actionBtn}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="shop-category-section" style="margin-top: 32px;">
        <h2>🛡️ Protection & Shields</h2>
        <div class="shop-cards-row">
          ${shopItems.consumables.map(item => {
            const hasShield = state.hasStreakFreeze;
            let actionBtn = `<button class="btn-3d btn-primary btn-shop-buy" data-item-id="${item.id}" data-item-type="consumable" data-cost="${item.cost}">Buy for ${item.cost} 💎</button>`;
            if (hasShield) {
              actionBtn = `<button class="btn-3d btn-secondary" disabled>Shield Active 🛡️</button>`;
            }
            return `
              <div class="shop-card">
                <span class="shop-item-icon">${item.icon}</span>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                ${actionBtn}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
  
  // Wire buy handlers
  content.querySelectorAll('.btn-shop-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.itemId;
      const type = btn.dataset.itemType;
      const cost = parseInt(btn.dataset.cost);
      
      if (state.gems < cost) {
        playSound('incorrect');
        speak("Oh no! You don't have enough gems!");
        return;
      }
      
      state.gems -= cost;
      playSound('correct');
      confetti({ particleCount: 60, spread: 50 });
      
      if (type === 'outfit') {
        state.purchasedOutfits.push(id);
        state.activeOutfit = id;
      } else if (type === 'theme') {
        state.purchasedThemes.push(id);
        state.activeTheme = id;
      } else if (type === 'consumable') {
        state.hasStreakFreeze = true;
      }
      
      saveState();
      updateStatsUI();
      speak("Purchased! Nice choice!");
      renderRewardsView();
    });
  });
  
  // Wire equip handlers
  content.querySelectorAll('.btn-shop-equip').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.itemId;
      const type = btn.dataset.itemType;
      playSound('click');
      
      if (type === 'outfit') {
        state.activeOutfit = id;
      } else if (type === 'theme') {
        state.activeTheme = id;
      }
      
      saveState();
      speak("Equipped!");
      renderRewardsView();
    });
  });
}

export function renderCompanionTab() {
  const content = document.getElementById('rewards-tab-content');
  if (!content) return;
  
  if (!state.companionEgg && !state.companionAnimal) {
    if (state.unlockedLevelId < 5) {
      content.innerHTML = `
        <div class="deck-complete-card" style="max-width: 480px;">
          <span style="font-size: 64px;">🔒</span>
          <h2>Companion Egg Locked</h2>
          <p>Mystery Egg unlocks at Level 5! Continue playing your path lessons to level up and earn your special companion egg from Zen!</p>
          <button type="button" class="btn-3d btn-primary" id="btn-back-to-learn">Back to Map</button>
        </div>
      `;
      document.getElementById('btn-back-to-learn').addEventListener('click', () => {
        switchView('learn');
      });
      return;
    } else {
      content.innerHTML = `
        <div class="deck-complete-card" style="max-width: 480px;">
          <span style="font-size: 64px; animation: float 3s ease-in-out infinite;">🎁</span>
          <h2>A Gift From Zen!</h2>
          <p>You reached Level 5! Zen has a special mystery egg for you. Claim it and nurture it with your daily activity to hatch a magical companion animal!</p>
          <button type="button" class="btn-3d btn-primary" id="btn-claim-egg">Claim Mystery Egg! 🥚</button>
        </div>
      `;
      document.getElementById('btn-claim-egg').addEventListener('click', () => {
        playSound('correct');
        confetti({ particleCount: 80, spread: 60 });
        state.companionEgg = { dateReceived: Date.now(), activityCount: 0 };
        saveState();
        speak("You got a mystery egg!");
        renderRewardsView();
      });
      return;
    }
  }
  
  if (state.companionEgg) {
    const activity = state.companionEgg.activityCount;
    const isReadyToHatch = activity >= 3;
    content.innerHTML = `
      <div class="deck-complete-card" style="max-width: 480px;">
        <div class="egg-container" style="position: relative; height: 160px; margin-bottom: 20px;">
          <svg viewBox="0 0 100 120" width="100" height="120" style="display: block; margin: 0 auto; animation: float 3s ease-in-out infinite;">
            <!-- Mystery Egg SVG -->
            <path d="M 50,10 C 20,40 10,75 10,90 C 10,105 30,115 50,115 C 70,115 90,105 90,90 C 90,75 80,40 50,10 Z" fill="#FEF3C7" stroke="#F59E0B" stroke-width="4" />
            <!-- Spots -->
            <circle cx="35" cy="50" r="8" fill="#FBBF24" opacity="0.6" />
            <circle cx="68" cy="70" r="10" fill="#FBBF24" opacity="0.6" />
            <circle cx="45" cy="95" r="7" fill="#FBBF24" opacity="0.6" />
          </svg>
        </div>
        <h2>Mystery Companion Egg</h2>
        <p>Needs <strong>3</strong> days of learning activity to hatch!</p>
        <div class="hatch-progress" style="background:#E2E8F0; height:16px; border-radius:8px; overflow:hidden; margin: 15px 0;">
          <div style="background:var(--primary-color); height:100%; width: ${(activity / 3) * 100}%; transition: width 0.3s;"></div>
        </div>
        <p style="font-size:14px; color:var(--text-light); margin-bottom: 24px;">Activity Progress: ${activity} / 3 days completed</p>
        ${isReadyToHatch ? `
          <button type="button" class="btn-3d btn-primary" id="btn-hatch-egg" style="font-size:18px;">Hatch Companion! 🐣</button>
        ` : `
          <button type="button" class="btn-3d btn-secondary" disabled>Keep Learning to Hatch</button>
        `}
      </div>
    `;
    
    const hatchBtn = document.getElementById('btn-hatch-egg');
    if (hatchBtn) {
      hatchBtn.addEventListener('click', () => {
        playSound('correct');
        confetti({ particleCount: 150, spread: 80 });
        
        const animals = ['Dragon 🐲', 'Phoenix 🐦', 'Unicorn 🦄', 'Penguin 🐧', 'Tiger 🐯', 'Puppy 🐶', 'Kitten 🐱', 'Owl 🦉', 'Bunny 🐰', 'Fox 🦊', 'Koala 🐨', 'Panda 🐼'];
        const chosen = animals[Math.floor(Math.random() * animals.length)];
        
        state.companionEgg = null;
        state.companionAnimal = {
          name: chosen,
          level: 1,
          xp: 0
        };
        saveState();
        speak(`Hooray! You hatched a ${chosen.split(' ')[0]}!`);
        renderRewardsView();
      });
    }
    return;
  }
  
  if (state.companionAnimal) {
    const animal = state.companionAnimal;
    content.innerHTML = `
      <div class="deck-complete-card" style="max-width: 480px;">
        <span style="font-size: 80px; display:block; margin-bottom:15px; animation: float 3s ease-in-out infinite;">
          ${animal.name.split(' ')[1] || '🦊'}
        </span>
        <h2>${animal.name}</h2>
        <div class="xp-gain-badge" style="margin: 8px auto; max-width: max-content;">
          <span>👑</span> <span>Level ${animal.level}</span>
        </div>
        
        <div style="margin: 20px 0;">
          <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-light); margin-bottom:4px;">
            <span>Companion XP</span>
            <span>${animal.xp} / 100</span>
          </div>
          <div class="hatch-progress" style="background:#E2E8F0; height:12px; border-radius:6px; overflow:hidden;">
            <div style="background:#EAB308; height:100%; width: ${animal.xp}%; transition: width 0.3s;"></div>
          </div>
        </div>
        
        <p style="font-size: 14px; color:var(--text-light); margin-bottom: 24px;">Feed your companion to increase their level and make them grow!</p>
        <div style="display:flex; gap:16px;">
          <button type="button" class="btn-3d btn-primary" id="btn-feed-companion" style="flex:1;">Feed Cookie 🍪 (15 💎)</button>
        </div>
      </div>
    `;
    
    document.getElementById('btn-feed-companion').addEventListener('click', () => {
      if (state.gems < 15) {
        playSound('incorrect');
        speak("Not enough gems!");
        return;
      }
      
      playSound('correct');
      state.gems -= 15;
      animal.xp += 25;
      if (animal.xp >= 100) {
        animal.xp -= 100;
        animal.level++;
        speak("Level up! Your companion is growing!");
        confetti({ particleCount: 80, spread: 60 });
      } else {
        speak("Yum! Delicious!");
      }
      
      saveState();
      updateStatsUI();
      renderRewardsView();
    });
  }
}

export function renderTrophyTab() {
  const content = document.getElementById('rewards-tab-content');
  if (!content) return;
  
  if (!state.completedAchievements) state.completedAchievements = [];
  
  content.innerHTML = `
    <div class="trophy-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px; text-align:center;">
      ${ACHIEVEMENTS_LIST.map(ach => {
        const isUnlocked = state.completedAchievements.includes(ach.id);
        const cardClass = isUnlocked ? 'trophy-card unlocked' : 'trophy-card locked';
        return `
          <div class="${cardClass}" style="border: 2px solid var(--border-color); border-radius: 20px; padding: 16px; background: var(--card-bg); opacity: ${isUnlocked ? 1 : 0.45}; transform: ${isUnlocked ? 'scale(1)' : 'scale(0.95)'};">
            <span class="trophy-badge" style="font-size: 44px; display: block; margin-bottom: 10px; filter: ${isUnlocked ? 'none' : 'grayscale(100%)'};">${isUnlocked ? '🏆' : '🔒'}</span>
            <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 6px; color: var(--text-color);">${ach.title}</h3>
            <p style="font-size: 11px; color: var(--text-light); line-height: 1.3;">${ach.desc}</p>
            ${isUnlocked ? `
              <div class="trophy-status-label" style="font-size:10px; font-weight:800; color:var(--primary-color); text-transform:uppercase; margin-top:8px;">Claimed +50 💎</div>
            ` : `
              <div class="trophy-status-label" style="font-size:10px; font-weight:800; color:var(--text-light); text-transform:uppercase; margin-top:8px;">Locked</div>
            `}
          </div>
        `;
      }).join('')}
    </div>
  `;
}
