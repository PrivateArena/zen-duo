import { state, LEVELS, readingSubState, saveState, findWordEmoji } from '../state.js';
import { playSound } from '../audio.js';
import { speak } from '../tts.js';
import { translate, generateSVG } from '../translate.js';
import { showModal } from '../modal.js';
import { renderReadingView } from './reading.js';

// Dynamic Story Templates
export const STORY_TEMPLATES = [
  {
    title: "The Magic Adventure 🦕",
    pages: [
      { text: "One sunny day, a friendly {W0} looked around and smiled.", emoji: "{E0}" },
      { text: "It walked along the path and found a lovely {W1} near a tree.", emoji: "{E1}" },
      { text: "'How exciting!' said the {W0}. 'I will show this to the {W2}!'" , emoji: "{E2}" }
    ]
  },
  {
    title: "A Big Surprise 🎁",
    pages: [
      { text: "In a cozy house, there was a tiny {W0}.", emoji: "{E0}" },
      { text: "It was hungry, so it started searching for a tasty {W1}.", emoji: "{E1}" },
      { text: "Instead of food, it bumped into a magical {W2}! Oh my!", emoji: "{E2}" }
    ]
  },
  {
    title: "Best Friends Play ⚽",
    pages: [
      { text: "Let's meet {W0}, who loves playing in the park.", emoji: "{E0}" },
      { text: "Today, {W0} is playing with a colorful {W1}.", emoji: "{E1}" },
      { text: "Look! A happy {W2} is coming to join the fun!", emoji: "{E2}" }
    ]
  }
];

export let selectedBuilderWords = [];
export let activeGeneratedStory = null;
export let generatedStoryPage = 0;

export function setSelectedBuilderWords(val) {
  selectedBuilderWords = val;
}

export function setActiveGeneratedStory(val) {
  activeGeneratedStory = val;
}

export function setGeneratedStoryPage(val) {
  generatedStoryPage = val;
}

export function getWordsForStoryBuilder() {
  const mastered = Object.keys(state.wordStats).filter(w => state.wordStats[w].score >= 3);
  if (mastered.length >= 6) {
    return mastered.map(w => ({ text: w, emoji: findWordEmoji(w)?.emoji || '📝' }));
  }
  const defaultWords = [];
  LEVELS.slice(0, 3).forEach(lvl => {
    if (lvl.words) {
      lvl.words.forEach(w => {
        if (!defaultWords.find(dw => dw.text === w.text)) {
          defaultWords.push({ text: w.text, emoji: w.emoji });
        }
      });
    }
  });
  return defaultWords;
}

export async function generateGeneratedStoryData(selectedWords, template) {
  const words = selectedWords.map(w => w.text);
  const emojis = selectedWords.map(w => w.emoji);
  
  const pages = [];
  for (let i = 0; i < template.pages.length; i++) {
    const p = template.pages[i];
    let pageText = p.text
      .replace(/{W0}/g, words[0])
      .replace(/{W1}/g, words[1])
      .replace(/{W2}/g, words[2]);
    let pageEmoji = p.emoji
      .replace(/{E0}/g, emojis[0])
      .replace(/{E1}/g, emojis[1])
      .replace(/{E2}/g, emojis[2]);
      
    pages.push({
      text: pageText,
      emoji: pageEmoji,
      translation: "",
      imagePath: ""
    });
  }
  
  return {
    title: template.title,
    pages: pages
  };
}

export async function fetchDynamicAssetsForStory(story) {
  for (let i = 0; i < story.pages.length; i++) {
    const p = story.pages[i];
    translate(p.text).then(transText => {
      p.translation = transText;
      if (activeGeneratedStory === story && generatedStoryPage === i) {
        renderGeneratedStoryReader();
      }
    });
    
    const cleanPrompt = "cute cartoon " + p.text.replace(/[.,'!?]/g, "");
    generateSVG(cleanPrompt).then(url => {
      if (url) {
        p.imagePath = url;
        if (activeGeneratedStory === story && generatedStoryPage === i) {
          renderGeneratedStoryReader();
        }
      }
    });
  }
}

export function renderStoryBuilderView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  if (activeGeneratedStory) {
    renderGeneratedStoryReader();
    return;
  }
  
  const availableWords = getWordsForStoryBuilder();
  
  viewContainer.innerHTML = `
    <div class="story-builder-container" style="animation: fadeIn 0.4s ease-out;">
      <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <button class="btn-3d btn-outline" id="btn-story-builder-back">← Back</button>
        <h2 style="font-family:'Fredoka', sans-serif; font-size:26px; color:var(--text-color); margin:0;">📖 Illustrated Story Builder</h2>
      </div>
      
      <div style="background:var(--card-bg); border:3px solid var(--border-color); border-radius:24px; padding:24px; box-shadow:0 8px 0 var(--border-color); margin-bottom:24px; text-align:center;">
        <h3 style="margin:0 0 8px 0; color:var(--text-color); font-size:18px;">Pick 3 words to create a magic story! ✨</h3>
        <p style="color:var(--text-light); margin:0 0 20px 0; font-size:14px;">Tapping words puts them in your story generator machine.</p>
        
        <div style="display:flex; justify-content:center; gap:12px; margin-bottom:24px; min-height:80px;">
          ${[0, 1, 2].map(idx => {
            const w = selectedBuilderWords[idx];
            return `
              <div style="border:3px dashed var(--border-color); border-radius:16px; width:90px; height:80px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.02); position:relative;">
                ${w ? `
                  <div style="font-size:32px;">${w.emoji}</div>
                  <div style="font-size:11px; font-weight:800; text-transform:capitalize; margin-top:2px;">${w.text}</div>
                  <button class="btn-remove-selected-word" data-idx="${idx}" style="position:absolute; top:-6px; right:-6px; background:#EF4444; border:2px solid var(--border-color); border-radius:50%; width:20px; height:20px; color:white; font-size:10px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
                ` : `
                  <span style="font-size:20px; color:var(--text-light); font-weight:800;">?</span>
                `}
              </div>
            `;
          }).join('')}
        </div>
        
        <button id="btn-generate-story" class="btn btn-primary" ${selectedBuilderWords.length === 3 ? '' : 'disabled'} style="padding:12px 36px; font-size:16px;">
          Build Story! 🪄
        </button>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap:16px;">
        ${availableWords.map(w => {
          const isSelected = selectedBuilderWords.some(sw => sw.text === w.text);
          return `
            <div class="word-selector-card btn-3d ${isSelected ? 'active' : ''}" data-word="${w.text}" data-emoji="${w.emoji}" style="border:3px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}; border-radius:20px; padding:16px; text-align:center; cursor:pointer; background:${isSelected ? 'var(--primary-light)' : 'var(--card-bg)'}; box-shadow:0 6px 0 ${isSelected ? 'var(--primary-dark)' : 'var(--border-color)'};">
              <div style="font-size:36px; margin-bottom:6px;">${w.emoji}</div>
              <div style="font-weight:800; font-size:14px; text-transform:capitalize; color:var(--text-color);">${w.text}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  document.getElementById('btn-story-builder-back').addEventListener('click', () => {
    playSound('click');
    readingSubState.subView = 'dashboard';
    renderReadingView();
  });
  
  viewContainer.querySelectorAll('.word-selector-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      const text = card.dataset.word;
      const emoji = card.dataset.emoji;
      
      const foundIdx = selectedBuilderWords.findIndex(sw => sw.text === text);
      if (foundIdx > -1) {
        selectedBuilderWords.splice(foundIdx, 1);
      } else {
        if (selectedBuilderWords.length < 3) {
          selectedBuilderWords.push({ text, emoji });
        } else {
          speak("You can only choose 3 words!");
          return;
        }
      }
      renderStoryBuilderView();
    });
  });
  
  viewContainer.querySelectorAll('.btn-remove-selected-word').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('click');
      const idx = parseInt(btn.dataset.idx);
      selectedBuilderWords.splice(idx, 1);
      renderStoryBuilderView();
    });
  });
  
  const genBtn = document.getElementById('btn-generate-story');
  if (genBtn) {
    genBtn.addEventListener('click', async () => {
      playSound('correct');
      genBtn.disabled = true;
      genBtn.innerText = "Building story... 🪄";
      
      const randomTemplate = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
      activeGeneratedStory = await generateGeneratedStoryData(selectedBuilderWords, randomTemplate);
      generatedStoryPage = 0;
      
      renderStoryBuilderView();
      fetchDynamicAssetsForStory(activeGeneratedStory);
    });
  }
}

export function renderGeneratedStoryReader() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const p = activeGeneratedStory.pages[generatedStoryPage];
  const wordsArray = p.text.split(' ');
  
  viewContainer.innerHTML = `
    <div class="story-reader-container" style="animation: fadeIn 0.4s ease-out; max-width:600px; margin:0 auto;">
      <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <button class="btn-3d btn-outline" id="btn-story-reader-back">← Back</button>
        <h2 style="font-family:'Fredoka', sans-serif; font-size:22px; color:var(--text-color); margin:0;">${activeGeneratedStory.title}</h2>
        <span style="font-weight:800; font-size:14px; background:rgba(0,0,0,0.05); padding:4px 10px; border-radius:12px;">
          ${generatedStoryPage + 1} / ${activeGeneratedStory.pages.length}
        </span>
      </div>
      
      <div style="background:var(--card-bg); border:4px solid var(--border-color); border-radius:28px; padding:32px; box-shadow:0 12px 0 var(--border-color); text-align:center; min-height:400px; display:flex; flex-direction:column; justify-content:space-between; margin-bottom:24px;">
        <div style="height:200px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; border-radius:20px; background:rgba(0,0,0,0.02); overflow:hidden; border:2px solid var(--border-color);">
          ${p.imagePath ? `
            <img src="${p.imagePath}" style="max-height:100%; max-width:100%; object-fit:contain; animation: popIn 0.3s ease-out;" />
          ` : `
            <div style="font-size:96px; animation: float 3s ease-in-out infinite;">${p.emoji}</div>
          `}
        </div>
        
        <div>
          <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:8px 6px; font-size:22px; font-weight:800; color:var(--text-color); font-family:'Fredoka', sans-serif; line-height:1.5; margin-bottom:12px;">
            ${wordsArray.map((w, idx) => {
              const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
              return `
                <span class="interactive-word-span" data-word="${cleanWord}" style="cursor:pointer; transition:all 0.1s; padding:2px 4px; border-radius:6px;">${w}</span>
              `;
            }).join('')}
          </div>
          
          ${!state.hideTranslations ? `
            <p style="font-size:16px; color:var(--primary-color); font-weight:700; margin:0; min-height:24px;">
              ${p.translation || '<span style="opacity:0.5; font-weight:400; font-size:14px; font-style:italic;">Translating story...</span>'}
            </p>
          ` : ''}
        </div>
        
        <button id="btn-speak-story-page" style="align-self:center; border:none; background:none; cursor:pointer; font-size:36px; margin-top:10px;" title="Listen">🔊</button>
      </div>
      
      <div style="display:flex; justify-content:space-between; gap:16px;">
        <button class="btn btn-outline" id="btn-story-prev" ${generatedStoryPage === 0 ? 'disabled' : ''} style="flex:1;">
          ← Prev
        </button>
        
        ${generatedStoryPage === activeGeneratedStory.pages.length - 1 ? `
          <button class="btn btn-primary" id="btn-story-finish" style="flex:2;">
            Finish Story! 🎉
          </button>
        ` : `
          <button class="btn btn-primary" id="btn-story-next" style="flex:2;">
            Next Page →
          </button>
        `}
      </div>
    </div>
  `;
  
  speak(p.text);
  
  viewContainer.querySelectorAll('.interactive-word-span').forEach(span => {
    span.addEventListener('click', () => {
      playSound('click');
      span.style.background = 'var(--primary-light)';
      span.style.color = 'var(--primary-color)';
      setTimeout(() => {
        span.style.background = 'none';
        span.style.color = 'inherit';
      }, 300);
      speak(span.dataset.word);
    });
  });
  
  document.getElementById('btn-speak-story-page').addEventListener('click', () => {
    playSound('click');
    speak(p.text);
  });
  
  document.getElementById('btn-story-reader-back').addEventListener('click', () => {
    playSound('click');
    activeGeneratedStory = null;
    renderStoryBuilderView();
  });
  
  const prevBtn = document.getElementById('btn-story-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playSound('click');
      generatedStoryPage--;
      renderGeneratedStoryReader();
    });
  }
  
  const nextBtn = document.getElementById('btn-story-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('click');
      generatedStoryPage++;
      renderGeneratedStoryReader();
    });
  }
  
  const finishBtn = document.getElementById('btn-story-finish');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      playSound('correct');
      state.xp += 15;
      state.gems += 5;
      saveState();
      
      activeGeneratedStory = null;
      selectedBuilderWords = [];
      readingSubState.subView = 'dashboard';
      renderReadingView();
      
      showModal('curiosity-unlocked', {
        catName: "Story Completed! 📖",
        emoji: "🏆"
      });
    });
  }
}
