import { state } from '../state.js';
import { playSound } from '../audio.js';
import { speak } from '../tts.js';
import { getZenMascotSVG } from '../zen-mascot.js';
import confetti from 'canvas-confetti';

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

export function renderFeelingsView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

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
  viewContainer.querySelectorAll('.feeling-selector-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      currentFeelingState = card.dataset.feeling;
      interactiveState = false;
      updateFeelingsDisplay();
    });
  });

  // Wire up header text audio click
  const infoClick = document.getElementById('feelings-info-click');
  if (infoClick) {
    infoClick.addEventListener('click', () => {
      playSound('click');
      const data = FEELINGS_DATA[currentFeelingState];
      speak(`${data.en}. ${data.vi}`);
    });
  }

  function updateFeelingsDisplay() {
    // 1. Update Selector Active state
    viewContainer.querySelectorAll('.feeling-selector-card').forEach(card => {
      if (card.dataset.feeling === currentFeelingState) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // 2. Update text info
    const data = FEELINGS_DATA[currentFeelingState];
    const wordEn = document.getElementById('feelings-word-en');
    const wordVi = document.getElementById('feelings-word-vi');
    const hint = document.getElementById('feelings-hint');

    if (wordEn) wordEn.innerText = data.en;
    if (wordVi) wordVi.innerText = `"${data.vi}"`;
    if (hint) hint.innerText = data.instruction;

    // 3. Render the dynamic SVG scene
    const sceneArea = document.getElementById('feelings-scene-area');
    if (sceneArea) {
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
  }

  // Initial draw
  updateFeelingsDisplay();
}
