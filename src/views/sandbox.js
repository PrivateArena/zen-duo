import { state, saveState, checkCuriosityUnlock } from '../state.js';
import { playSound } from '../audio.js';
import { speak } from '../tts.js';
import { translate, generateSVG } from '../translate.js';
import { showModal } from '../modal.js';

export let activeSelectedColor = '#EF4444';
export let sandboxSubView = 'search'; // 'search' or 'gallery'

export const SANDBOX_CATEGORIES = [
  {
    name: "Animals",
    emoji: "🐶",
    words: [
      { text: "Dog", emoji: "🐶" },
      { text: "Cat", emoji: "🐱" },
      { text: "Bird", emoji: "🐦" },
      { text: "Fish", emoji: "🐟" },
      { text: "Bear", emoji: "🐻" },
      { text: "Rabbit", emoji: "🐰" },
      { text: "Lion", emoji: "🦁" },
      { text: "Elephant", emoji: "🐘" }
    ]
  },
  {
    name: "Food",
    emoji: "🍎",
    words: [
      { text: "Apple", emoji: "🍎" },
      { text: "Banana", emoji: "🍌" },
      { text: "Grapes", emoji: "🍇" },
      { text: "Orange", emoji: "🍊" },
      { text: "Milk", emoji: "🥛" },
      { text: "Water", emoji: "💧" },
      { text: "Bread", emoji: "🍞" },
      { text: "Cake", emoji: "🍰" }
    ]
  },
  {
    name: "Colors",
    emoji: "🌈",
    words: [
      { text: "Red", emoji: "🟥" },
      { text: "Blue", emoji: "🟦" },
      { text: "Yellow", emoji: "🟨" },
      { text: "Green", emoji: "🟩" },
      { text: "Pink", emoji: "🌸" },
      { text: "Purple", emoji: "🍇" },
      { text: "Orange", emoji: "🍊" },
      { text: "Rainbow", emoji: "🌈" }
    ]
  },
  {
    name: "Home",
    emoji: "🏠",
    words: [
      { text: "Book", emoji: "📖" },
      { text: "Pen", emoji: "✏️" },
      { text: "Chair", emoji: "🪑" },
      { text: "Table", emoji: "🪵" },
      { text: "Bed", emoji: "🛏️" },
      { text: "Cup", emoji: "🥤" },
      { text: "Clock", emoji: "⏰" },
      { text: "Toy", emoji: "🧸" }
    ]
  }
];

export function renderSandboxView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  if (sandboxSubView === 'gallery') {
    renderSandboxGallery();
    return;
  }

  viewContainer.innerHTML = `
    <div class="sandbox-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="margin:0;">Curiosity Sandbox</h2>
          <p style="color: var(--text-light); margin:4px 0 0 0;">Explore words, color SVGs, and build your creation gallery!</p>
        </div>
        <button id="btn-sandbox-gallery-toggle" class="btn btn-outline" style="padding:8px 16px; font-size:13px; font-weight:800; display:flex; align-items:center; gap:6px;">
          🖼️ Creations Gallery
        </button>
      </div>
      
      <!-- Interactive Grid / Selection Area -->
      <div id="sandbox-interactive-area"></div>
      
      <!-- Canvas Display -->
      <div class="sandbox-canvas" id="sandbox-canvas" style="position:relative;">
        <div class="svg-display-area" id="svg-display" style="cursor: pointer; min-height:260px; display:flex; align-items:center; justify-content:center; flex-direction:column;" title="Tap to pronounce">
          <span style="font-size: 64px;">💡</span>
          <p style="color: var(--text-light); font-size: 14px; margin-top: 12px;">Tap a picture above to start</p>
        </div>
        <h3 id="sandbox-word-title" style="font-weight: 700; font-size: 24px; min-height: 32px; margin-top:12px; text-transform:capitalize;"></h3>
        <p id="sandbox-translation" style="color: var(--primary-color); font-weight: 600; min-height: 24px; margin:4px 0 16px 0;"></p>
        
        <!-- Palette & Save Buttons (Shown only when SVG is loaded) -->
        <div id="sandbox-coloring-controls" style="display:none; flex-direction:column; align-items:center; gap:16px; margin-top:12px; width:100%;">
          <div style="font-size:12px; font-weight:800; color:var(--text-light);">Select a color & tap any part of the image below to paint it! 🎨</div>
          <div class="sandbox-color-palette" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            ${['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF', '#000000', '#FDE047', '#A7F3D0', '#BFDBFE', '#E9D5FF'].map(color => `
              <button class="palette-color-btn ${color === activeSelectedColor ? 'active' : ''}" data-color="${color}" style="background:${color}; width:36px; height:36px; border-radius:50%; border:3px solid var(--border-color); cursor:pointer; box-shadow:0 3px 0 var(--border-color); transform:translateY(0); transition:all 0.1s; outline:none;"></button>
            `).join('')}
          </div>
          
          <button id="btn-sandbox-save-gallery" class="btn btn-primary" style="padding:10px 24px; font-size:14px; display:flex; align-items:center; gap:8px;">
            💾 Save to Gallery
          </button>
        </div>
      </div>

      <!-- Advanced Mode Toggle -->
      <div class="sandbox-advanced-toggle">
        <button type="button" class="toggle-advanced-btn" id="toggle-advanced-btn">⌨️ Advanced Mode (Type a word)</button>
      </div>

      <!-- Advanced Input Area -->
      <div class="sandbox-advanced-input-area" id="sandbox-input-area">
        <div class="sandbox-input-row">
          <input type="text" class="sandbox-input" id="sandbox-input" placeholder="Type a word (e.g. apple, sun, fish)...">
          <button type="button" class="btn-3d btn-primary" id="sandbox-search-btn">Go!</button>
        </div>
      </div>
    </div>
  `;

  const interactiveArea = document.getElementById('sandbox-interactive-area');
  const inputArea = document.getElementById('sandbox-input-area');
  const toggleAdvancedBtn = document.getElementById('toggle-advanced-btn');
  const inputEl = document.getElementById('sandbox-input');
  const searchBtn = document.getElementById('sandbox-search-btn');
  const displayEl = document.getElementById('svg-display');
  const titleEl = document.getElementById('sandbox-word-title');
  const transEl = document.getElementById('sandbox-translation');
  const coloringControls = document.getElementById('sandbox-coloring-controls');
  const saveGalleryBtn = document.getElementById('btn-sandbox-save-gallery');
  const galleryToggleBtn = document.getElementById('btn-sandbox-gallery-toggle');

  galleryToggleBtn.addEventListener('click', () => {
    playSound('click');
    sandboxSubView = 'gallery';
    renderSandboxView();
  });

  // Advanced mode toggle handler
  toggleAdvancedBtn.addEventListener('click', () => {
    playSound('click');
    inputArea.classList.toggle('visible');
  });

  async function triggerSandbox(word) {
    if (!word) return;
    const cleanWord = word.trim();
    playSound('click');
    
    // 1. Instantly speak the English word
    speak(cleanWord);
    titleEl.innerText = cleanWord;
    checkCuriosityUnlock(cleanWord);
    
    // 2. Fetch OCR translation to Vietnamese
    if (state.hideTranslations) {
      transEl.innerText = "";
    } else {
      transEl.innerText = "Translating...";
      const translation = await translate(cleanWord);
      transEl.innerText = translation ? `"${translation}"` : "";
    }

    // 3. Display loading and paint SVG
    displayEl.innerHTML = '<div class="loading-spinner"></div>';
    coloringControls.style.display = 'none';
    
    try {
      const svgUrl = await generateSVG(cleanWord);
      if (svgUrl) {
        // Fetch raw SVG content to inline it, exposing path nodes for color coloring!
        const response = await fetch(svgUrl);
        if (response.ok) {
          const svgText = await response.text();
          displayEl.innerHTML = svgText;
          
          const svgEl = displayEl.querySelector('svg');
          if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';
            svgEl.style.maxWidth = '240px';
            svgEl.style.maxHeight = '240px';
            
            // Expose styling styles
            const styleTags = svgEl.querySelectorAll('style');
            styleTags.forEach(st => st.remove());
            
            // Set event listeners on all path/polygon nodes
            const childNodes = svgEl.querySelectorAll('path, circle, rect, polygon, ellipse, line, polyline');
            childNodes.forEach(node => {
              node.style.cursor = 'pointer';
              node.style.transition = 'fill 0.15s ease';
              
              if (!node.getAttribute('fill') && !node.style.fill) {
                node.setAttribute('fill', '#FFFFFF');
              }
              
              node.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop click from reading the title
                playSound('click');
                node.setAttribute('fill', activeSelectedColor);
                node.style.fill = activeSelectedColor;
              });
            });
            
            // Reveal palette controls
            coloringControls.style.display = 'flex';
          } else {
            displayEl.innerHTML = '<span style="font-size: 64px;">❓</span><p>Invalid SVG format</p>';
          }
        } else {
          displayEl.innerHTML = '<span style="font-size: 64px;">❓</span><p>No SVG found</p>';
        }
      } else {
        displayEl.innerHTML = '<span style="font-size: 64px;">❓</span><p>No SVG found</p>';
      }
    } catch (e) {
      displayEl.innerHTML = '<span style="font-size: 64px;">❌</span><p>Error loading SVG</p>';
    }
  }

  // Save to Gallery
  saveGalleryBtn.addEventListener('click', () => {
    playSound('correct');
    const svgEl = displayEl.querySelector('svg');
    if (!svgEl) return;
    
    if (!state.galleryCreations) state.galleryCreations = [];
    
    if (state.galleryCreations.length >= 12) {
      state.galleryCreations.shift(); // Remove oldest to cap size
    }
    
    state.galleryCreations.push({
      id: "c_" + Date.now(),
      title: titleEl.innerText,
      svgContent: svgEl.outerHTML,
      date: new Date().toLocaleDateString()
    });
    
    saveState();
    
    showModal('custom', {
      title: "Saved to Gallery! 🎨",
      message: `Your beautiful colored "${titleEl.innerText}" is now preserved in your Creations Gallery room!`,
      buttonText: "Awesome!",
      onConfirm: () => {}
    });
  });

  // Palette button selectors
  viewContainer.querySelectorAll('.palette-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      viewContainer.querySelectorAll('.palette-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSelectedColor = btn.dataset.color;
    });
  });

  function showCategories() {
    interactiveArea.innerHTML = `
      <div class="sandbox-categories-title">Tap a category:</div>
      <div class="sandbox-category-grid">
        ${SANDBOX_CATEGORIES.map(cat => `
          <div class="category-card" data-category="${cat.name}">
            <div class="category-emoji">${cat.emoji}</div>
            <div class="category-name">${cat.name}</div>
          </div>
        `).join('')}
      </div>
    `;

    interactiveArea.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        playSound('click');
        const catName = card.dataset.category;
        showCategoryWords(catName);
      });
    });
  }

  function showCategoryWords(catName) {
    const category = SANDBOX_CATEGORIES.find(c => c.name === catName);
    if (!category) return;

    interactiveArea.innerHTML = `
      <div class="sandbox-words-container">
        <button type="button" class="sandbox-back-btn" id="sandbox-back-btn">⬅ Back to Categories</button>
        <div class="sandbox-categories-title">Tap an item:</div>
        <div class="word-items-grid">
          ${category.words.map(w => `
            <div class="word-card" data-word="${w.text}">
              <div class="word-card-emoji">${w.emoji}</div>
              <div class="word-card-text">${w.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('sandbox-back-btn').addEventListener('click', () => {
      playSound('click');
      showCategories();
    });

    interactiveArea.querySelectorAll('.word-card').forEach(card => {
      card.addEventListener('click', () => {
        const word = card.dataset.word;
        triggerSandbox(word);
      });
    });
  }

  searchBtn.addEventListener('click', () => triggerSandbox(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerSandbox(inputEl.value);
  });

  // Start with category picker active
  showCategories();
}

// Creations Gallery view rendering
export function renderSandboxGallery() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const creations = state.galleryCreations || [];
  
  viewContainer.innerHTML = `
    <div class="sandbox-card" style="animation: fadeIn 0.4s ease-out;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="margin:0;">🎨 Creations Gallery</h2>
          <p style="color:var(--text-light); margin:4px 0 0 0;">Admire your custom painted artworks!</p>
        </div>
        <button id="btn-gallery-back-sandbox" class="btn btn-outline" style="padding:8px 16px; font-weight:800;">
          ⬅ Back to Sandbox
        </button>
      </div>
      
      ${creations.length === 0 ? `
        <div style="text-align:center; padding:64px 32px; color:var(--text-light); border:3px dashed var(--border-color); border-radius:24px; background:rgba(0,0,0,0.01);">
          <div style="font-size:72px; margin-bottom:16px;">🎨</div>
          <h3 style="font-size:18px; font-weight:800; margin:0 0 8px 0; color:var(--text-color);">No creations saved yet</h3>
          <p style="margin:0; font-size:14px;">Color a picture in the sandbox and tap "Save to Gallery" to see it here!</p>
        </div>
      ` : `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:20px;">
          ${creations.map(c => `
            <div class="gallery-creation-card" style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:20px; padding:16px; text-align:center; box-shadow:0 6px 0 var(--border-color); display:flex; flex-direction:column; justify-content:space-between; align-items:center; min-height:240px; position:relative;">
              <div class="gallery-svg-preview" style="width:100%; height:120px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.02); border-radius:12px; border:2px solid var(--border-color); overflow:hidden;">
                ${c.svgContent}
              </div>
              
              <div style="margin-top:10px; width:100%;">
                <h4 style="font-size:15px; font-weight:800; margin:0 0 2px 0; text-transform:capitalize; color:var(--text-color); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${c.title}</h4>
                <div style="font-size:11px; color:var(--text-light); margin-bottom:12px;">${c.date}</div>
              </div>
              
              <div style="display:flex; width:100%; gap:8px;">
                <button class="btn-gallery-delete" data-id="${c.id}" style="flex:1; padding:6px 0; font-size:11px; border:2px solid #EF4444; color:#EF4444; background:none; font-weight:800; border-radius:8px; cursor:pointer;">🗑️</button>
                <button class="btn-gallery-edit" data-id="${c.id}" style="flex:2; padding:6px 0; font-size:11px; border:2px solid var(--primary-color); color:white; background:var(--primary-color); font-weight:800; border-radius:8px; cursor:pointer;">Recolor</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  
  document.getElementById('btn-gallery-back-sandbox').addEventListener('click', () => {
    playSound('click');
    sandboxSubView = 'search';
    renderSandboxView();
  });
  
  viewContainer.querySelectorAll('.btn-gallery-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this colored creation from your gallery?")) {
        state.galleryCreations = state.galleryCreations.filter(c => c.id !== id);
        saveState();
        renderSandboxGallery();
      }
    });
  });
  
  viewContainer.querySelectorAll('.btn-gallery-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const id = btn.dataset.id;
      const creation = state.galleryCreations.find(c => c.id === id);
      if (creation) {
        sandboxSubView = 'search';
        renderSandboxView();
        
        setTimeout(() => {
          const displayEl = document.getElementById('svg-display');
          const titleEl = document.getElementById('sandbox-word-title');
          const transEl = document.getElementById('sandbox-translation');
          const coloringControls = document.getElementById('sandbox-coloring-controls');
          
          if (titleEl) titleEl.innerText = creation.title;
          if (transEl) transEl.innerText = "";
          if (displayEl) displayEl.innerHTML = creation.svgContent;
          
          const svgEl = displayEl ? displayEl.querySelector('svg') : null;
          if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';
            svgEl.style.maxWidth = '240px';
            svgEl.style.maxHeight = '240px';
            
            const childNodes = svgEl.querySelectorAll('path, circle, rect, polygon, ellipse, line, polyline');
            childNodes.forEach(node => {
              node.style.cursor = 'pointer';
              node.style.transition = 'fill 0.15s ease';
              
              node.addEventListener('click', (e) => {
                e.stopPropagation();
                playSound('click');
                node.setAttribute('fill', activeSelectedColor);
                node.style.fill = activeSelectedColor;
              });
            });
            if (coloringControls) coloringControls.style.display = 'flex';
          }
        }, 50);
      }
    });
  });
}
