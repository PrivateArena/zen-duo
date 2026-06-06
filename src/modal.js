// --- Zen the Cute-Ugly Penguin Mascot SVG Generator ---
export function getZenSVG(emotion) {
  let eyesHTML = '';
  let beakHTML = '';
  let wingsHTML = '';
  let extraHTML = '';

  if (emotion === 'celebrating') {
    // Joyful squinty eyes, waving wings, open beak, party hat
    eyesHTML = `
      <!-- squinting eyes -->
      <path d="M 55,42 Q 62,35 69,42" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M 91,42 Q 98,35 105,42" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round" />
      <!-- blushing cheeks -->
      <ellipse cx="48" cy="48" rx="8" ry="5" fill="#f472b6" opacity="0.6" />
      <ellipse cx="112" cy="48" rx="8" ry="5" fill="#f472b6" opacity="0.6" />
    `;
    beakHTML = `
      <!-- open joyful beak -->
      <path d="M 72,48 L 88,48 L 80,62 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
      <path d="M 74,48 Q 80,54 86,48 Z" fill="#dc2626" />
    `;
    wingsHTML = `
      <!-- wings flapping up -->
      <path d="M 32,70 Q 15,50 22,42 Q 30,40 38,62" fill="#374151" />
      <path d="M 128,70 Q 145,50 138,42 Q 130,40 122,62" fill="#374151" />
    `;
    extraHTML = `
      <!-- cute little party hat -->
      <path d="M 70,18 L 90,18 L 80,2 Z" fill="#ec4899" />
      <circle cx="80" cy="1" r="3" fill="#fcd34d" />
      <!-- sparkles -->
      <path d="M 35,20 L 37,25 L 42,27 L 37,29 L 35,34 L 33,29 L 28,27 L 33,25 Z" fill="#fcd34d" />
      <path d="M 125,22 L 127,25 L 131,27 L 127,29 L 125,33 L 123,29 L 119,27 L 123,25 Z" fill="#fcd34d" />
    `;
  } else if (emotion === 'sad') {
    // Sad droopy eyes, downward beak, slumped wings
    eyesHTML = `
      <!-- droopy sad eyes -->
      <path d="M 56,38 Q 63,45 70,40" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M 90,40 Q 97,45 104,38" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round" />
      <!-- tear -->
      <path d="M 60,46 Q 60,54 57,54 Q 54,54 54,46 Z" fill="#3b82f6" />
    `;
    beakHTML = `
      <!-- sad downward beak -->
      <path d="M 72,52 Q 80,44 88,52 Q 80,58 72,52 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
    `;
    wingsHTML = `
      <!-- wings hanging down sadly -->
      <path d="M 32,75 Q 18,92 24,96 Q 32,96 36,80" fill="#374151" />
      <path d="M 128,75 Q 142,92 136,96 Q 128,96 124,80" fill="#374151" />
    `;
  } else {
    // Thinking / default curious: one big eye, one small eye (quirky cute-ugly look), hand on beak
    eyesHTML = `
      <!-- quirky unequal eyes -->
      <circle cx="62" cy="40" r="8" fill="#1f2937" />
      <circle cx="60" cy="38" r="3" fill="#ffffff" />
      <circle cx="98" cy="40" r="5" fill="#1f2937" />
      <circle cx="97" cy="39" r="1.5" fill="#ffffff" />
      <!-- crooked eyebrows -->
      <path d="M 54,30 Q 62,28 70,33" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M 92,33 Q 98,27 104,30" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
    `;
    beakHTML = `
      <!-- slightly open inquisitive beak -->
      <path d="M 72,48 Q 80,48 88,48 Q 80,58 72,48 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
    `;
    wingsHTML = `
      <!-- one wing scratching chin/beak, one resting -->
      <path d="M 32,75 Q 48,70 68,60 Q 70,66 36,80" fill="#374151" />
      <path d="M 128,75 Q 142,88 136,92 Q 128,92 124,80" fill="#374151" />
    `;
    extraHTML = `
      <!-- lightbulb overhead -->
      <circle cx="80" cy="-8" r="8" fill="#fcd34d" opacity="0.9" />
      <path d="M 77,-2 L 83,-2" stroke="#1f2937" stroke-width="2" />
      <path d="M 80,-8 L 80,-14" stroke="#d97706" stroke-width="2" />
    `;
  }

  return `
    <svg viewBox="0 0 160 140" width="160" height="140" class="zen-mascot-svg">
      <!-- Shadow -->
      <ellipse cx="80" cy="128" rx="45" ry="8" fill="#000000" opacity="0.15" />
      
      <!-- Penguin Main Body (Egg shaped, slightly asymmetrical/quirky) -->
      <path d="M 80,18 Q 122,18 126,72 Q 130,122 80,122 Q 30,122 34,72 Q 38,18 80,18 Z" fill="#374151" />
      
      <!-- White Belly / Face Area -->
      <path d="M 80,30 Q 110,30 112,70 Q 114,114 80,114 Q 46,114 48,70 Q 50,30 80,30 Z" fill="#ffffff" />
      
      <!-- Orange Feet (Cute, slightly clumsy) -->
      <path d="M 45,118 Q 38,132 52,130 Q 60,128 58,118 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
      <path d="M 115,118 Q 122,132 108,130 Q 100,128 102,118 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
      
      <!-- Wings -->
      ${wingsHTML}
      
      <!-- Eyes & Blushing -->
      ${eyesHTML}
      
      <!-- Beak -->
      ${beakHTML}
      
      <!-- Extras -->
      ${extraHTML}
    </svg>
  `;
}

// --- Dynamic Modal System Container ---
let modalContainer = null;

function ensureModalContainer() {
  if (modalContainer) return modalContainer;
  modalContainer = document.createElement('div');
  modalContainer.id = 'zd-modal-container';
  modalContainer.className = 'modal-backdrop';
  document.body.appendChild(modalContainer);
  return modalContainer;
}

export function showModal(type, data = {}) {
  const container = ensureModalContainer();
  container.classList.add('visible');

  return new Promise((resolve) => {
    if (type === 'lesson-complete') {
      const { xp = 10, hearts = 5 } = data;
      // Stars earned: 5 hearts -> 3 stars; 3-4 hearts -> 2 stars; 1-2 hearts -> 1 star
      const starsCount = hearts === 5 ? 3 : (hearts >= 3 ? 2 : 1);
      const starEmojis = '⭐'.repeat(starsCount) + '☆'.repeat(3 - starsCount);

      container.innerHTML = `
        <div class="modal-card bounce-in">
          <div class="modal-mascot-container">
            ${getZenSVG('celebrating')}
          </div>
          <h1 class="modal-title animate-rainbow">Awesome Job!</h1>
          <div class="stars-display">${starEmojis}</div>
          <p class="modal-body-text">You completed the lesson with <strong>${hearts}</strong> hearts remaining!</p>
          <div class="xp-gain-badge">
            <span class="xp-icon">⭐</span>
            <span class="xp-text">+${xp} XP</span>
          </div>
          <button type="button" class="btn-3d btn-primary btn-large" id="modal-action-btn">Continue</button>
        </div>
      `;

      document.getElementById('modal-action-btn').addEventListener('click', () => {
        container.classList.remove('visible');
        resolve(true);
      });

    } else if (type === 'hearts-empty') {
      container.innerHTML = `
        <div class="modal-card bounce-in">
          <div class="modal-mascot-container">
            ${getZenSVG('sad')}
          </div>
          <h1 class="modal-title text-red">Out of Hearts!</h1>
          <p class="modal-body-text">Oh no, you ran out of energy! Let's practice some more and try again.</p>
          <button type="button" class="btn-3d btn-secondary btn-large" id="modal-action-btn">Try Again</button>
        </div>
      `;

      document.getElementById('modal-action-btn').addEventListener('click', () => {
        container.classList.remove('visible');
        resolve(true);
      });

    } else if (type === 'exit-confirm') {
      container.innerHTML = `
        <div class="modal-card slide-up-sheet">
          <div class="modal-mascot-container" style="margin-bottom: 8px;">
            ${getZenSVG('thinking')}
          </div>
          <h2 class="modal-title">Leave Lesson?</h2>
          <p class="modal-body-text" style="color: var(--text-light); margin-bottom: 24px;">Progress for this lesson will be lost!</p>
          <div class="modal-actions-row">
            <button type="button" class="btn-3d btn-outline" style="flex: 1;" id="modal-cancel-btn">Keep Playing</button>
            <button type="button" class="btn-3d btn-secondary" style="flex: 1;" id="modal-exit-btn">Quit Lesson</button>
          </div>
        </div>
      `;

      document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        container.classList.remove('visible');
        resolve(false);
      });

      document.getElementById('modal-exit-btn').addEventListener('click', () => {
        container.classList.remove('visible');
        resolve(true);
      });
    }
  });
}
