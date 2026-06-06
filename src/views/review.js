import { state, dynamicVocabulary } from '../state.js';
import { speak } from '../tts.js';
import { translate } from '../translate.js';
import { playSound } from '../audio.js';

export function renderReviewView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

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
    if (!visualEl || !wordEl || !transEl || !starsEl) return;
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
    setTimeout(() => { if (visualEl) visualEl.style.transform = 'scale(1)'; }, 300);
    
    speak(item.word);
  }

  showNextWord();
  state.reviewTimer = setInterval(showNextWord, 4000);

  if (playBtn) {
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
  }

  if (triggerEl) {
    triggerEl.addEventListener('click', () => {
      playSound('click');
      const item = vocabulary[(state.reviewIdx - 1 + vocabulary.length) % vocabulary.length];
      speak(item.word);
    });
  }
}
