import { getZenMascotSVG } from './zen-mascot.js';

export function getZenSVG(emotion) {
  return getZenMascotSVG(emotion, true);
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
      const { xp = 10, gems = 0, hearts = 5 } = data;
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
          <div class="rewards-gain-container" style="display: flex; gap: 16px; justify-content: center; margin: 15px 0;">
            <div class="xp-gain-badge">
              <span class="xp-icon">⭐</span>
              <span class="xp-text">+${xp} XP</span>
            </div>
            ${gems > 0 ? `
            <div class="gems-gain-badge" style="background: rgba(59, 130, 246, 0.1); color: #2563EB; font-weight: 800; font-size: 16px; padding: 10px 16px; border-radius: 16px; display: flex; align-items: center; gap: 6px; border: 2px solid rgba(59, 130, 246, 0.2);">
              <span class="gems-icon">💎</span>
              <span class="gems-text">+${gems} Gems</span>
            </div>
            ` : ''}
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
    } else if (type === 'curiosity-unlocked') {
      const { catName = 'New World', emoji = '🦖' } = data;
      container.innerHTML = `
        <div class="modal-card bounce-in">
          <div class="modal-mascot-container">
            ${getZenSVG('excited')}
          </div>
          <h1 class="modal-title animate-rainbow" style="font-size: 24px;">Curiosity Unlocked!</h1>
          <p class="modal-body-text" style="font-size: 16px;">
            Wow! You are super curious about <strong>${catName}</strong> ${emoji}!
            I have built a special, custom level for you on the map!
          </p>
          <button type="button" class="btn-3d btn-primary btn-large" id="modal-action-btn">Let's Explore!</button>
        </div>
      `;

      document.getElementById('modal-action-btn').addEventListener('click', () => {
        container.classList.remove('visible');
        resolve(true);
      });
    }
  });
}
