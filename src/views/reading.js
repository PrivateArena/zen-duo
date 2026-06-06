import { READING_LETTERS, READING_SIGHT_WORDS, READING_STORIES } from '../lessons.js';
import { state, readingSubState, saveState } from '../state.js';
import { playSound } from '../audio.js';
import { speak } from '../tts.js';
import { translate } from '../translate.js';
import { getZenMascotSVG } from '../zen-mascot.js';
import { updateStatsUI } from '../router.js';
import { renderStoryBuilderView, setSelectedBuilderWords, setActiveGeneratedStory } from './story.js';
import confetti from 'canvas-confetti';

let tracingAnimationFrameId = null;
let sightWordFlipped = false;

export function renderReadingView() {
  if (readingSubState.subView === 'dashboard') {
    renderReadingDashboard();
  } else if (readingSubState.subView === 'tracing') {
    renderTracingView(readingSubState.activeLetter);
  } else if (readingSubState.subView === 'sight-words') {
    renderSightWordsView();
  } else if (readingSubState.subView === 'stories') {
    renderStoriesView(readingSubState.activeStory);
  } else if (readingSubState.subView === 'story-builder') {
    renderStoryBuilderView();
  }
}

export function renderReadingDashboard() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  viewContainer.innerHTML = `
    <div class="reading-dashboard-container">
      <div class="reading-header">
        <h1>📖 Reading Foundation</h1>
        <p>Sound out letters, build sight words, and read cute mini-stories!</p>
      </div>

      <!-- Grid of Reading Tracks -->
      <div class="reading-tracks-grid">
        <!-- 1. Tracing Section -->
        <div class="reading-section-card">
          <h2>🔤 Phonics Letter Tracing</h2>
          <p>Tap a letter to learn its shape, sound, and trace it with your finger!</p>
          <div class="letters-grid">
            ${READING_LETTERS.map(item => `
              <button class="letter-btn btn-3d" data-char="${item.char}">
                <span class="letter-char">${item.char}</span>
                <span class="letter-emoji">${item.emoji}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 2. Sight Words Section -->
        <div class="reading-section-card sight-words-hero">
          <h2>🔍 Sight Words Arena</h2>
          <p>Master the top 10 core vocabulary words using high-impact spaced repetition memory cards.</p>
          <div class="sight-words-preview">
            ${READING_SIGHT_WORDS.slice(0, 5).map(sw => `<span class="sight-badge">${sw.word}</span>`).join('')}
            <span class="sight-badge-more">+5 more</span>
          </div>
          <button class="btn-3d btn-primary" id="start-sight-words-btn" style="width: 100%; margin-top: 15px;">
            Play Sight Words Deck ⚡
          </button>
        </div>

        <!-- 3. First Readers Section -->
        <div class="reading-section-card">
          <h2>📕 Illustrated First Readers</h2>
          <p>Short stories written specifically using sight words and simple phonics targets.</p>
          <div class="stories-grid">
            ${READING_STORIES.map(story => `
              <div class="story-card btn-3d" data-story-id="${story.id}">
                <div class="story-icon">${story.icon}</div>
                <div class="story-info">
                  <h3>${story.title}</h3>
                  <p>${story.pages.length} pages</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. Story Builder Section -->
        <div class="reading-section-card story-builder-hero" style="border: 3px solid var(--primary-color); background: linear-gradient(135deg, var(--card-bg) 0%, rgba(139, 92, 246, 0.05) 100%);">
          <h2>🪄 AI Illustrated Story Builder</h2>
          <p>Combine your mastered vocabulary words to dynamically generate custom AI-illustrated reading stories!</p>
          <div style="display:flex; gap:10px; font-size:32px; justify-content:center; margin: 15px 0;">
            <span>🦕</span>
            <span>🎁</span>
            <span>⚽</span>
          </div>
          <button class="btn-3d btn-primary" id="btn-start-story-builder" style="width: 100%; margin-top: 15px; background:var(--primary-color); box-shadow:0 6px 0 var(--primary-dark);">
            Create a Story ✨
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  viewContainer.querySelectorAll('.letter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      readingSubState.subView = 'tracing';
      readingSubState.activeLetter = btn.dataset.char;
      renderReadingView();
    });
  });

  const startSightWordsBtn = document.getElementById('start-sight-words-btn');
  if (startSightWordsBtn) {
    startSightWordsBtn.addEventListener('click', () => {
      playSound('click');
      readingSubState.subView = 'sight-words';
      readingSubState.sightWordIndex = 0;
      // Shuffle sight words deck
      readingSubState.sightWordDeck = [...READING_SIGHT_WORDS].sort(() => Math.random() - 0.5);
      renderReadingView();
    });
  }

  viewContainer.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      const storyId = card.dataset.storyId;
      const storyObj = READING_STORIES.find(s => s.id === storyId);
      if (storyObj) {
        readingSubState.subView = 'stories';
        readingSubState.activeStory = storyObj;
        readingSubState.storyPage = 0;
        renderReadingView();
      }
    });
  });

  const startStoryBuilderBtn = document.getElementById('btn-start-story-builder');
  if (startStoryBuilderBtn) {
    startStoryBuilderBtn.addEventListener('click', () => {
      playSound('click');
      readingSubState.subView = 'story-builder';
      setSelectedBuilderWords([]);
      setActiveGeneratedStory(null);
      renderReadingView();
    });
  }
}

export function renderTracingView(letterChar) {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const letterObj = READING_LETTERS.find(item => item.char === letterChar);
  if (!letterObj) return;

  viewContainer.innerHTML = `
    <div class="tracing-container">
      <div class="view-header">
        <button class="btn-3d btn-outline" id="btn-back-reading-dash">← Back</button>
        <h2>Trace the shape: ${letterObj.char}</h2>
      </div>

      <div class="tracing-workspace">
        <div class="tracing-canvas-wrapper">
          <canvas id="tracing-canvas" class="tracing-canvas" style="touch-action: none;"></canvas>
          <div class="sparkle-hint-overlay">
            Draw inside the dashed letter! <span id="trace-progress-val">0%</span>
          </div>
        </div>

        <div class="tracing-instruction-card">
          <div class="tracing-sound-tap" id="btn-play-letter-sound">
            <span class="sound-wave-icon">🔊</span>
            <span class="letter-speak-label">Sound out: "${letterObj.sound}"</span>
          </div>
          <div class="tracing-example-badge">
            <span style="font-size: 48px;">${letterObj.emoji}</span>
            <p>${letterObj.char} is for <strong>${letterObj.example}</strong></p>
          </div>
          <div class="mascot-guidance-bubble">
            <div class="mascot-svg-wrapper" id="tracing-mascot-area" style="width: 80px; height: 80px;"></div>
            <p id="tracing-instruction-bubble">Follow the guides with your finger to draw!</p>
          </div>
          <button class="btn-3d btn-success" id="btn-reset-tracing" style="width: 100%; margin-top: 15px;">
            Reset Drawing 🎨
          </button>
        </div>
      </div>
    </div>
  `;

  // Draw mascot expression
  const mascotArea = document.getElementById('tracing-mascot-area');
  if (mascotArea) {
    mascotArea.innerHTML = getZenMascotSVG('thinking', false);
  }

  // Play audio automatically on open
  speak(letterObj.char + ". " + letterObj.sound);

  // Wire back button
  document.getElementById('btn-back-reading-dash').addEventListener('click', () => {
    playSound('click');
    if (tracingAnimationFrameId) {
      cancelAnimationFrame(tracingAnimationFrameId);
    }
    readingSubState.subView = 'dashboard';
    renderReadingView();
  });

  // Play phonetic sound button
  document.getElementById('btn-play-letter-sound').addEventListener('click', () => {
    playSound('click');
    speak(letterObj.char + ". " + letterObj.sound);
  });

  // Initialize Canvas Tracing logic
  const canvas = document.getElementById('tracing-canvas');
  if (canvas) {
    const dpr = window.devicePixelRatio || 1;
    // Set fixed size layout of 300x300
    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = '300px';
    canvas.style.height = '300px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Set up offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = 300;
    offscreen.height = 300;
    const oCtx = offscreen.getContext('2d');
    oCtx.fillStyle = '#000000';
    oCtx.fillRect(0, 0, 300, 300);
    oCtx.fillStyle = '#FFFFFF';
    oCtx.font = 'bold 210px Outfit, Roboto, sans-serif';
    oCtx.textAlign = 'center';
    oCtx.textBaseline = 'middle';
    oCtx.fillText(letterObj.char, 150, 150);

    const imgData = oCtx.getImageData(0, 0, 300, 300);
    let totalTargetPixels = 0;
    const letterMap = new Uint8Array(300 * 300);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const isWhite = imgData.data[i] > 200 && imgData.data[i+1] > 200 && imgData.data[i+2] > 200;
      if (isWhite) {
        letterMap[i / 4] = 1;
        totalTargetPixels++;
      }
    }

    // Paint canvas layer
    const paintCanvas = document.createElement('canvas');
    paintCanvas.width = 300;
    paintCanvas.height = 300;
    const paintCtx = paintCanvas.getContext('2d');

    const coveredPixels = new Set();
    let particles = [];
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let isCompleted = false;
    let isDestroyed = false;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.round(((clientX - rect.left) / rect.width) * 300);
      const y = Math.round(((clientY - rect.top) / rect.height) * 300);
      return { x, y };
    }

    function drawStroke(x1, y1, x2, y2) {
      paintCtx.strokeStyle = '#10B981';
      paintCtx.lineWidth = 26;
      paintCtx.lineCap = 'round';
      paintCtx.lineJoin = 'round';
      paintCtx.beginPath();
      paintCtx.moveTo(x1, y1);
      paintCtx.lineTo(x2, y2);
      paintCtx.stroke();

      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.floor(dist / 2));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = Math.round(x1 + (x2 - x1) * t);
        const py = Math.round(y1 + (y2 - y1) * t);
        if (px >= 0 && px < 300 && py >= 0 && py < 300) {
          const idx = py * 300 + px;
          if (letterMap[idx] === 1) {
            coveredPixels.add(idx);
          }
        }
      }

      // Sparkles
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: x2 + (Math.random() - 0.5) * 12,
          y: y2 + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          alpha: 1.0,
          color: `hsl(${Math.random() * 360}, 100%, 75%)`,
          size: Math.random() * 5 + 3
        });
      }
    }

    function startDraw(e) {
      e.preventDefault();
      isDrawing = true;
      const coords = getCoords(e);
      lastX = coords.x;
      lastY = coords.y;
      drawStroke(lastX, lastY, lastX, lastY);
    }

    function moveDraw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const coords = getCoords(e);
      drawStroke(lastX, lastY, coords.x, coords.y);
      lastX = coords.x;
      lastY = coords.y;
    }

    function endDraw() {
      isDrawing = false;
    }

    // Attach canvas events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    // Reset button click
    document.getElementById('btn-reset-tracing').addEventListener('click', () => {
      playSound('click');
      paintCtx.clearRect(0, 0, 300, 300);
      coveredPixels.clear();
      isCompleted = false;
      const progressEl = document.getElementById('trace-progress-val');
      if (progressEl) progressEl.innerText = '0%';
      const bubbleEl = document.getElementById('tracing-instruction-bubble');
      if (bubbleEl) bubbleEl.innerText = "Follow the guides with your finger to draw!";
      if (mascotArea) mascotArea.innerHTML = getZenMascotSVG('thinking', false);
    });

    function handleTracingComplete() {
      playSound('correct');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      state.xp += 10;
      updateStatsUI();
      saveState();

      if (mascotArea) {
        mascotArea.innerHTML = getZenMascotSVG('celebrating', false);
      }

      const bubbleEl = document.getElementById('tracing-instruction-bubble');
      if (bubbleEl) {
        bubbleEl.innerText = `Great job! You traced the letter ${letterObj.char}! +10 XP ⭐`;
      }

      speak(`Amazing! ${letterObj.char} is for ${letterObj.example}.`);

      // Auto delay return
      setTimeout(() => {
        if (!isDestroyed) {
          isDestroyed = true;
          if (tracingAnimationFrameId) cancelAnimationFrame(tracingAnimationFrameId);
          readingSubState.subView = 'dashboard';
          renderReadingView();
        }
      }, 3000);
    }

    function renderFrame() {
      ctx.clearRect(0, 0, 300, 300);

      // Draw gray dashed outline letter
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.font = 'bold 210px Outfit, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(letterObj.char, 150, 150);

      // Draw light solid background fill
      ctx.fillStyle = 'rgba(226, 232, 240, 0.2)';
      ctx.fillText(letterObj.char, 150, 150);

      ctx.setLineDash([]); // Reset line dash

      // Draw user's painted strokes
      ctx.drawImage(paintCanvas, 0, 0);

      // Draw and clean particles
      particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      const progress = totalTargetPixels > 0 ? (coveredPixels.size / totalTargetPixels) : 0;
      const progressPercent = Math.min(100, Math.round(progress * 135)); // Scaled helper to feel responsive
      const progressEl = document.getElementById('trace-progress-val');
      if (progressEl) {
        progressEl.innerText = `${progressPercent}%`;
      }

      if (progressPercent >= 80 && !isCompleted) {
        isCompleted = true;
        handleTracingComplete();
      }

      if (!isDestroyed) {
        tracingAnimationFrameId = requestAnimationFrame(renderFrame);
      }
    }

    renderFrame();
  }
}

export function renderSightWordsView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const deck = readingSubState.sightWordDeck;
  const idx = readingSubState.sightWordIndex;
  
  if (!deck || deck.length === 0) {
    readingSubState.subView = 'dashboard';
    renderReadingView();
    return;
  }

  if (idx >= deck.length) {
    // Deck completed!
    playSound('correct');
    confetti({ particleCount: 100, spread: 80 });
    state.xp += 15;
    updateStatsUI();
    saveState();

    viewContainer.innerHTML = `
      <div class="deck-complete-card">
        <div class="complete-mascot-bubble" style="width: 120px; height: 120px; margin: 0 auto 20px;">
          ${getZenMascotSVG('celebrating', false)}
        </div>
        <h2>Perfect Deck Recall!</h2>
        <p>You mastered all 10 sight words today! That's awesome reading practice.</p>
        <div class="xp-reward">+15 XP ⭐</div>
        <button class="btn-3d btn-primary" id="btn-close-deck" style="margin-top: 20px; width: 100%;">
          Back to Reading Dashboard
        </button>
      </div>
    `;

    document.getElementById('btn-close-deck').addEventListener('click', () => {
      playSound('click');
      readingSubState.subView = 'dashboard';
      renderReadingView();
    });
    return;
  }

  const currentWord = deck[idx];

  viewContainer.innerHTML = `
    <div class="sight-words-container">
      <div class="view-header">
        <button class="btn-3d btn-outline" id="btn-back-reading-dash">← Back</button>
        <span class="deck-progress-label">Word ${idx + 1} of ${deck.length}</span>
      </div>

      <div class="deck-progress-bar">
        <div class="deck-progress-fill" style="width: ${((idx + 1) / deck.length) * 100}%;"></div>
      </div>

      <div class="flashcard-workspace">
        <div class="flashcard ${sightWordFlipped ? 'flipped' : ''}" id="sight-flashcard">
          <!-- Card Front -->
          <div class="flashcard-front">
            <div class="flashcard-tag">Look & Sound Out</div>
            <h1 class="flashcard-text">${currentWord.word}</h1>
            <p style="color: var(--text-light); font-size: 14px;">Tap card or speaker to hear pronunciation</p>
          </div>

          <!-- Card Back -->
          <div class="flashcard-back">
            <div class="flashcard-tag">Translation & Context</div>
            <h2 class="flashcard-text-back">${currentWord.word}</h2>
            ${state.hideTranslations ? '' : `<h3 class="flashcard-translation">"${currentWord.translation}"</h3>`}
            <p class="flashcard-example">Example: <strong>${currentWord.example}</strong></p>
          </div>
        </div>

        <div class="flashcard-actions">
          ${!sightWordFlipped ? `
            <button class="btn-3d btn-primary btn-speak-reveal" id="btn-reveal-speak">
              Reveal & Speak 🔊
            </button>
          ` : `
            <div class="srs-evaluation-row">
              <button class="btn-3d btn-danger srs-btn" id="btn-srs-hard">
                Hard 🔴
              </button>
              <button class="btn-3d btn-success srs-btn" id="btn-srs-easy">
                Easy! 🟢
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  // Play word sound on load
  speak(currentWord.word);

  // Wire back button
  document.getElementById('btn-back-reading-dash').addEventListener('click', () => {
    playSound('click');
    readingSubState.subView = 'dashboard';
    renderReadingView();
  });

  // Wire card tap flip
  const card = document.getElementById('sight-flashcard');
  if (card) {
    card.addEventListener('click', () => {
      playSound('click');
      speak(currentWord.word);
      if (!sightWordFlipped) {
        sightWordFlipped = true;
        renderSightWordsView();
      }
    });
  }

  // Wire speak button
  const revealBtn = document.getElementById('btn-reveal-speak');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      playSound('click');
      speak(currentWord.word);
      sightWordFlipped = true;
      renderSightWordsView();
    });
  }

  // Wire SRS buttons
  const easyBtn = document.getElementById('btn-srs-easy');
  if (easyBtn) {
    easyBtn.addEventListener('click', () => {
      playSound('click');
      // Record SRS state
      const stats = state.wordStats[currentWord.word] || { strength: 0, attempts: 0 };
      stats.attempts++;
      stats.strength = Math.min(5, stats.strength + 1);
      state.wordStats[currentWord.word] = stats;
      saveState();

      sightWordFlipped = false;
      readingSubState.sightWordIndex++;
      renderSightWordsView();
    });
  }

  const hardBtn = document.getElementById('btn-srs-hard');
  if (hardBtn) {
    hardBtn.addEventListener('click', () => {
      playSound('click');
      const stats = state.wordStats[currentWord.word] || { strength: 0, attempts: 0 };
      stats.attempts++;
      stats.strength = Math.max(0, stats.strength - 1);
      state.wordStats[currentWord.word] = stats;
      saveState();

      sightWordFlipped = false;
      readingSubState.sightWordIndex++;
      renderSightWordsView();
    });
  }
}

export function renderStoriesView(storyObj) {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const pageIdx = readingSubState.storyPage;
  const totalPages = storyObj.pages.length;
  const page = storyObj.pages[pageIdx];

  viewContainer.innerHTML = `
    <div class="story-reader-container">
      <div class="view-header">
        <button class="btn-3d btn-outline" id="btn-back-reading-dash">← Close</button>
        <span class="story-title-header">${storyObj.title}</span>
        <span class="story-progress-label">Page ${pageIdx + 1} of ${totalPages}</span>
      </div>

      <div class="story-progress-bar">
        <div class="story-progress-fill" style="width: ${((pageIdx + 1) / totalPages) * 100}%;"></div>
      </div>

      <div class="story-book-layout">
        <!-- Illustration -->
        <div class="story-illustration-card">
          <div class="story-mascot-character" id="story-mascot-portrait" style="width: 140px; height: 140px; margin: 0 auto 15px;"></div>
          <div class="story-illustration-emoji">${page.emoji}</div>
        </div>

        <!-- Text Reader -->
        <div class="story-text-container">
          <div class="story-sentence-text" id="story-sentence-click">
            ${page.text.split(' ').map(w => {
              const cleaned = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
              return `<span class="reader-word-token" data-word="${cleaned}">${w}</span>`;
            }).join(' ')}
          </div>
          ${state.hideTranslations ? '' : `
            <div class="story-sentence-translation">
              "${page.translation}"
            </div>
          `}
        </div>
      </div>

      <div class="story-reader-actions">
        <button class="btn-3d btn-outline btn-speak-page" id="btn-speak-entire-page">
          Read Sentence 🔊
        </button>
        ${pageIdx < totalPages - 1 ? `
          <button class="btn-3d btn-primary" id="btn-story-next">
            Next Page ➡️
          </button>
        ` : `
          <button class="btn-3d btn-success" id="btn-story-complete">
            Finish Story 🏆
          </button>
        `}
      </div>
    </div>
  `;

  // Set mascot portrait
  const portrait = document.getElementById('story-mascot-portrait');
  if (portrait) {
    portrait.innerHTML = getZenMascotSVG(page.svgState || 'excited', false);
  }

  // Speak page text automatically on load
  speak(page.text);

  // Wire close button
  document.getElementById('btn-back-reading-dash').addEventListener('click', () => {
    playSound('click');
    readingSubState.subView = 'dashboard';
    renderReadingView();
  });

  // Speak word tokens on click
  viewContainer.querySelectorAll('.reader-word-token').forEach(span => {
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('click');
      speak(span.dataset.word);
      // Brief visual click highlight
      span.classList.add('active-read');
      setTimeout(() => span.classList.remove('active-read'), 300);
    });
  });

  // Speak entire page text
  document.getElementById('btn-speak-entire-page').addEventListener('click', () => {
    playSound('click');
    speak(page.text);
  });

  // Next/Complete button click handlers
  const nextBtn = document.getElementById('btn-story-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('click');
      readingSubState.storyPage++;
      renderStoriesView(storyObj);
    });
  }

  const completeBtn = document.getElementById('btn-story-complete');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      playSound('correct');
      confetti({ particleCount: 120, spread: 80 });
      state.xp += 10;
      updateStatsUI();
      saveState();

      readingSubState.subView = 'dashboard';
      renderReadingView();
    });
  }
}
