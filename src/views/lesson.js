import confetti from 'canvas-confetti';
import { state, LEVELS, saveState, trackWordPerformance } from '../state.js';
import { playSound, triggerHaptic } from '../audio.js';
import { getZenMascotSVG } from '../zen-mascot.js';
import { speak } from '../tts.js';
import { showModal } from '../modal.js';
import { switchView } from '../router.js';
import { checkAchievementsProgress, triggerAchievement } from './rewards.js';

export function startLesson(lesson) {
  playSound('click');
  state.hearts = 5;
  state.currentLesson = lesson;
  state.currentChallengeIdx = 0;
  state.activeView = 'lesson';
  resetChallengeState();
  switchView('lesson');
}

export function resetChallengeState() {
  state.selectedOption = null;
  state.matchingPairsLeftSelected = null;
  state.matchingPairsRightSelected = null;
  state.matchedPairsCount = 0;
  state.sentenceBuilderAnswers = [];
  state.yesNoSelection = null;
  state.dragSortAnswers = {};
  state.fillBlankSelection = null;
  state.speakingCorrect = false;
  state.speakingHeard = '';
  state.isChecking = false;
  state.isCorrect = false;
}

export function renderLessonView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const lesson = state.currentLesson;
  const challengeIdx = state.currentChallengeIdx;
  const challenge = lesson.challenges[challengeIdx];
  const progressPercent = Math.round(((challengeIdx) / lesson.challenges.length) * 100);
  
  viewContainer.innerHTML = `
    <div class="lesson-card">
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
      <div class="lesson-header-row" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div class="lesson-mascot-inline" id="lesson-mascot-inline" style="width: 90px; height: 80px; flex-shrink: 0;"></div>
        <h2 class="question-title" style="margin: 0; flex: 1; font-size: 22px;">${challenge.instruction}</h2>
      </div>
      
      <div id="challenge-content-area"></div>
      
      <div class="lesson-footer">
        <button type="button" class="btn-3d btn-outline" id="lesson-exit-btn">Exit</button>
        <button type="button" class="btn-3d btn-primary" id="lesson-submit-btn" disabled>Check</button>
      </div>
    </div>
  `;
  
  const lessonMascot = document.getElementById('lesson-mascot-inline');
  if (lessonMascot) {
    lessonMascot.innerHTML = getZenMascotSVG('thinking', true);
  }
  
  document.getElementById('lesson-exit-btn').addEventListener('click', async () => {
    const shouldExit = await showModal('exit-confirm');
    if (shouldExit) {
      switchView('learn');
    }
  });
  
  const submitBtn = document.getElementById('lesson-submit-btn');
  submitBtn.addEventListener('click', () => {
    if (!state.isChecking) {
      checkChallengeAnswer();
    } else {
      nextChallenge();
    }
  });
  
  // Render specific challenge layouts
  const contentArea = document.getElementById('challenge-content-area');
  
  if (challenge.type === 'matching') {
    renderMatchingChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'choice') {
    renderChoiceChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'listening') {
    renderListeningChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'builder') {
    renderBuilderChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'yes-no') {
    renderYesNoChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'drag-sort') {
    renderDragSortChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'fill-blank') {
    renderFillBlankChallenge(challenge, contentArea, submitBtn);
  } else if (challenge.type === 'speaking') {
    renderSpeakingChallenge(challenge, contentArea, submitBtn);
  }

  // Speak challenge instruction with a small delay for child guidance
  setTimeout(() => {
    if (state.activeView === 'lesson' && state.currentChallengeIdx === challengeIdx) {
      speak(challenge.instruction);
    }
  }, 350);
}

// Choice challenge renderer
export function renderChoiceChallenge(challenge, container, submitBtn) {
  const grid = document.createElement('div');
  grid.className = 'options-grid';
  
  let options = [...challenge.options];
  if (state.difficulty === 'easy') {
    const correctOpt = options.find(o => o.text === challenge.answer);
    const distractors = options.filter(o => o.text !== challenge.answer);
    options = [correctOpt, distractors[0]].filter(Boolean);
  } else if (state.difficulty === 'hard' && options.length < 4) {
    const extraDistractors = ["Dog", "Cat", "Fish", "Apple", "Banana", "Milk", "Water", "Chair", "Table"]
      .filter(w => w !== challenge.answer && !options.some(o => o.text === w));
    if (extraDistractors.length > 0) {
      options.push({ text: extraDistractors[0], emoji: '💡' });
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <div class="option-visual" style="font-size: 54px;">${option.emoji}</div>
      <div class="option-text">${option.text}</div>
    `;
    
    card.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(option.text);
      
      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedOption = option.text;
      submitBtn.removeAttribute('disabled');
    });
    
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
}

// Matching Pairs challenge renderer
export function renderMatchingChallenge(challenge, container, submitBtn) {
  const matchContainer = document.createElement('div');
  matchContainer.className = 'matching-container';
  
  const leftList = document.createElement('div');
  leftList.className = 'matching-list';
  
  const rightList = document.createElement('div');
  rightList.className = 'matching-list';
  
  const leftWords = Object.keys(challenge.pairs).sort(() => Math.random() - 0.5);
  const rightEmojis = Object.values(challenge.pairs).sort(() => Math.random() - 0.5);
  
  leftWords.forEach(word => {
    const item = document.createElement('div');
    item.className = 'option-card';
    item.innerText = word;
    item.style.padding = '14px';
    
    item.addEventListener('click', () => {
      if (state.isChecking || item.classList.contains('correct')) return;
      playSound('click');
      speak(word);
      
      leftList.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');
      state.matchingPairsLeftSelected = { element: item, text: word };
      checkPairsMatching(challenge, submitBtn);
    });
    
    leftList.appendChild(item);
  });
  
  rightEmojis.forEach(emoji => {
    const item = document.createElement('div');
    item.className = 'option-card';
    item.innerText = emoji;
    item.style.fontSize = '32px';
    item.style.padding = '8px';
    
    item.addEventListener('click', () => {
      if (state.isChecking || item.classList.contains('correct')) return;
      playSound('click');
      
      rightList.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');
      state.matchingPairsRightSelected = { element: item, emoji: emoji };
      checkPairsMatching(challenge, submitBtn);
    });
    
    rightList.appendChild(item);
  });
  
  matchContainer.appendChild(leftList);
  matchContainer.appendChild(rightList);
  container.appendChild(matchContainer);
}

export function checkPairsMatching(challenge, submitBtn) {
  const left = state.matchingPairsLeftSelected;
  const right = state.matchingPairsRightSelected;
  
  if (left && right) {
    const expectedEmoji = challenge.pairs[left.text];
    if (expectedEmoji === right.emoji) {
      playSound('correct');
      left.element.className = 'option-card correct';
      right.element.className = 'option-card correct';
      state.matchedPairsCount++;
      
      state.matchingPairsLeftSelected = null;
      state.matchingPairsRightSelected = null;
      
      if (state.matchedPairsCount === Object.keys(challenge.pairs).length) {
        submitBtn.removeAttribute('disabled');
        submitBtn.click(); // Auto check on perfect matches
      }
    } else {
      playSound('incorrect');
      left.element.className = 'option-card incorrect';
      right.element.className = 'option-card incorrect';
      
      setTimeout(() => {
        left.element.className = 'option-card';
        right.element.className = 'option-card';
      }, 800);
      
      state.matchingPairsLeftSelected = null;
      state.matchingPairsRightSelected = null;
    }
  }
}

// Listening challenge renderer
export function renderListeningChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '24px';
  
  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'speaker-btn';
  speaker.innerHTML = '🔊';
  speaker.addEventListener('click', () => {
    playSound('click');
    speak(challenge.audioText);
  });
  
  // Auto-speak initially with minor delay
  setTimeout(() => speak(challenge.audioText), 400);
  
  const grid = document.createElement('div');
  grid.className = 'options-grid';
  grid.style.width = '100%';
  
  let options = [...challenge.options];
  if (state.difficulty === 'easy') {
    const correctOpt = options.find(o => o.text === challenge.answer);
    const distractors = options.filter(o => o.text !== challenge.answer);
    options = [correctOpt, distractors[0]].filter(Boolean);
  } else if (state.difficulty === 'hard' && options.length < 4) {
    const extraDistractors = ["Dog", "Cat", "Fish", "Apple", "Banana", "Milk", "Water", "Chair", "Table"]
      .filter(w => w !== challenge.answer && !options.some(o => o.text === w));
    if (extraDistractors.length > 0) {
      options.push({ text: extraDistractors[0], emoji: '💡' });
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <div class="option-visual" style="font-size: 54px;">${option.emoji}</div>
      <div class="option-text">${option.text}</div>
    `;
    
    card.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(option.text);
      
      grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedOption = option.text;
      submitBtn.removeAttribute('disabled');
    });
    
    grid.appendChild(card);
  });
  
  wrapper.appendChild(speaker);
  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

// Sentence Builder challenge renderer
export function renderBuilderChallenge(challenge, container, submitBtn) {
  const builderWrapper = document.createElement('div');
  builderWrapper.className = 'sentence-builder';
  
  const helpRow = document.createElement('div');
  helpRow.style.fontSize = '20px';
  helpRow.style.color = 'var(--text-light)';
  helpRow.innerText = `"${challenge.promptText}"`;
  
  const slot = document.createElement('div');
  slot.className = 'build-slot';
  
  const pool = document.createElement('div');
  pool.className = 'word-pool';
  
  let blocks = [...challenge.blocks];
  const targetWords = challenge.targetText.split(' ').map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase());
  
  if (state.difficulty === 'easy') {
    blocks = blocks.filter(b => targetWords.includes(b.toLowerCase()));
  } else if (state.difficulty === 'hard') {
    const potentialDistractors = ["the", "a", "is", "runs", "flies", "swims", "happy", "big", "small"];
    potentialDistractors.forEach(dist => {
      if (!blocks.map(b => b.toLowerCase()).includes(dist) && !targetWords.includes(dist) && blocks.length < 7) {
        blocks.push(dist);
      }
    });
  }
  
  blocks.forEach((word, idx) => {
    const block = document.createElement('button');
    block.type = 'button';
    block.className = 'word-block';
    block.innerText = word;
    block.dataset.idx = idx;
    block.style.touchAction = 'none'; // Prevent browser scrolling while dragging
    
    block.addEventListener('pointerdown', (e) => {
      if (state.isChecking || block.classList.contains('used')) return;
      block.setPointerCapture(e.pointerId);
      
      const startX = e.clientX;
      const startY = e.clientY;
      let dragClone = null;
      let hasDragged = false;
      
      const onPointerMove = (moveEvent) => {
        if (state.isChecking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        if (!hasDragged && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          hasDragged = true;
          
          dragClone = document.createElement('div');
          dragClone.className = 'word-block dragging-ghost';
          dragClone.innerText = word;
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '9999';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.opacity = '0.9';
          dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          dragClone.style.transform = 'scale(1.05)';
          dragClone.style.transition = 'none';
          
          const rect = block.getBoundingClientRect();
          dragClone.style.width = `${rect.width}px`;
          dragClone.style.height = `${rect.height}px`;
          document.body.appendChild(dragClone);
        }
        
        if (dragClone) {
          const rect = block.getBoundingClientRect();
          dragClone.style.left = `${moveEvent.clientX - rect.width / 2}px`;
          dragClone.style.top = `${moveEvent.clientY - rect.height / 2}px`;
          
          const slotRect = slot.getBoundingClientRect();
          const isOver = (
            moveEvent.clientX >= slotRect.left &&
            moveEvent.clientX <= slotRect.right &&
            moveEvent.clientY >= slotRect.top &&
            moveEvent.clientY <= slotRect.bottom
          );
          if (isOver) {
            slot.classList.add('drag-over');
          } else {
            slot.classList.remove('drag-over');
          }
        }
      };
      
      const onPointerUp = (upEvent) => {
        block.releasePointerCapture(e.pointerId);
        block.removeEventListener('pointermove', onPointerMove);
        block.removeEventListener('pointerup', onPointerUp);
        
        if (dragClone) {
          dragClone.remove();
        }
        slot.classList.remove('drag-over');
        
        if (state.isChecking) return;
        
        if (hasDragged) {
          const slotRect = slot.getBoundingClientRect();
          const isOver = (
            upEvent.clientX >= slotRect.left &&
            upEvent.clientX <= slotRect.right &&
            upEvent.clientY >= slotRect.top &&
            upEvent.clientY <= slotRect.bottom
          );
          if (isOver) {
            playSound('click');
            block.classList.add('used');
            addWordToSlot(word, idx, slot, pool);
            speak(word);
            toggleSubmitBtn();
          }
        } else {
          playSound('click');
          speak(word);
          block.classList.add('used');
          addWordToSlot(word, idx, slot, pool);
          toggleSubmitBtn();
        }
      };
      
      block.addEventListener('pointermove', onPointerMove);
      block.addEventListener('pointerup', onPointerUp);
    });
    
    pool.appendChild(block);
  });
  
  function addWordToSlot(word, originalIdx, slotEl, poolEl) {
    const placed = document.createElement('button');
    placed.type = 'button';
    placed.className = 'word-block';
    placed.innerText = word;
    placed.style.touchAction = 'none';
    
    placed.addEventListener('pointerdown', (e) => {
      if (state.isChecking) return;
      placed.setPointerCapture(e.pointerId);
      
      const startX = e.clientX;
      const startY = e.clientY;
      let dragClone = null;
      let hasDragged = false;
      
      const onPointerMove = (moveEvent) => {
        if (state.isChecking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        if (!hasDragged && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          hasDragged = true;
          
          dragClone = document.createElement('div');
          dragClone.className = 'word-block dragging-ghost';
          dragClone.innerText = word;
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '9999';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.opacity = '0.9';
          dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          dragClone.style.transform = 'scale(1.05)';
          dragClone.style.transition = 'none';
          
          const rect = placed.getBoundingClientRect();
          dragClone.style.width = `${rect.width}px`;
          dragClone.style.height = `${rect.height}px`;
          document.body.appendChild(dragClone);
        }
        
        if (dragClone) {
          const rect = placed.getBoundingClientRect();
          dragClone.style.left = `${moveEvent.clientX - rect.width / 2}px`;
          dragClone.style.top = `${moveEvent.clientY - rect.height / 2}px`;
        }
      };
      
      const onPointerUp = (upEvent) => {
        placed.releasePointerCapture(e.pointerId);
        placed.removeEventListener('pointermove', onPointerMove);
        placed.removeEventListener('pointerup', onPointerUp);
        
        if (dragClone) {
          dragClone.remove();
        }
        
        if (state.isChecking) return;
        
        if (hasDragged) {
          const slotRect = slotEl.getBoundingClientRect();
          const isOutsideSlot = (
            upEvent.clientX < slotRect.left ||
            upEvent.clientX > slotRect.right ||
            upEvent.clientY < slotRect.top ||
            upEvent.clientY > slotRect.bottom
          );
          if (isOutsideSlot) {
            playSound('click');
            placed.remove();
            const originalBlock = poolEl.querySelector(`[data-idx="${originalIdx}"]`);
            if (originalBlock) originalBlock.classList.remove('used');
            
            state.sentenceBuilderAnswers = state.sentenceBuilderAnswers.filter(item => item.idx !== originalIdx);
            toggleSubmitBtn();
          }
        } else {
          playSound('click');
          placed.remove();
          const originalBlock = poolEl.querySelector(`[data-idx="${originalIdx}"]`);
          if (originalBlock) originalBlock.classList.remove('used');
          
          state.sentenceBuilderAnswers = state.sentenceBuilderAnswers.filter(item => item.idx !== originalIdx);
          toggleSubmitBtn();
        }
      };
      
      placed.addEventListener('pointermove', onPointerMove);
      placed.addEventListener('pointerup', onPointerUp);
    });
    
    slotEl.appendChild(placed);
    state.sentenceBuilderAnswers.push({ word, idx: originalIdx });
  }
  
  function toggleSubmitBtn() {
    if (state.sentenceBuilderAnswers.length > 0) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', 'true');
    }
  }
  
  builderWrapper.appendChild(helpRow);
  builderWrapper.appendChild(slot);
  builderWrapper.appendChild(pool);
  container.appendChild(builderWrapper);
}

// Yes or No challenge renderer
export function renderYesNoChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'yes-no-challenge';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.width = '100%';

  const emojiEl = document.createElement('div');
  emojiEl.style.fontSize = '80px';
  emojiEl.style.userSelect = 'none';
  emojiEl.innerText = challenge.emoji;

  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'speaker-btn';
  speaker.innerHTML = '🔊 Hear Word';
  speaker.addEventListener('click', () => {
    playSound('click');
    speak(challenge.audioText);
  });

  const buttonsRow = document.createElement('div');
  buttonsRow.className = 'yes-no-row';
  buttonsRow.style.display = 'flex';
  buttonsRow.style.gap = '24px';
  buttonsRow.style.width = '100%';
  buttonsRow.style.justifyContent = 'center';

  const yesBtn = document.createElement('button');
  yesBtn.type = 'button';
  yesBtn.className = 'btn-3d yes-btn';
  yesBtn.style.flex = '1';
  yesBtn.style.maxWidth = '160px';
  yesBtn.style.setProperty('--btn-bg', '#10B981');
  yesBtn.style.setProperty('--btn-border', '#059669');
  yesBtn.style.setProperty('--btn-shadow', '#047857');
  yesBtn.style.setProperty('--btn-text', '#ffffff');
  yesBtn.innerHTML = '<span>🟢 YES</span>';

  const noBtn = document.createElement('button');
  noBtn.type = 'button';
  noBtn.className = 'btn-3d no-btn';
  noBtn.style.flex = '1';
  noBtn.style.maxWidth = '160px';
  noBtn.style.setProperty('--btn-bg', '#EF4444');
  noBtn.style.setProperty('--btn-border', '#DC2626');
  noBtn.style.setProperty('--btn-shadow', '#B91C1C');
  noBtn.style.setProperty('--btn-text', '#ffffff');
  noBtn.innerHTML = '<span>🔴 NO</span>';

  yesBtn.addEventListener('click', () => {
    if (state.isChecking) return;
    playSound('click');
    yesBtn.style.outline = '4px solid #047857';
    noBtn.style.outline = 'none';
    state.yesNoSelection = 'yes';
    submitBtn.removeAttribute('disabled');
  });

  noBtn.addEventListener('click', () => {
    if (state.isChecking) return;
    playSound('click');
    noBtn.style.outline = '4px solid #B91C1C';
    yesBtn.style.outline = 'none';
    state.yesNoSelection = 'no';
    submitBtn.removeAttribute('disabled');
  });

  wrapper.appendChild(emojiEl);
  wrapper.appendChild(speaker);
  wrapper.appendChild(buttonsRow);
  buttonsRow.appendChild(yesBtn);
  buttonsRow.appendChild(noBtn);
  container.appendChild(wrapper);

  setTimeout(() => {
    if (state.activeView === 'lesson') {
      speak(challenge.audioText);
    }
  }, 700);
}

// Drag to Sort challenge renderer
export function renderDragSortChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'drag-sort-challenge';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.width = '100%';

  const bucketsContainer = document.createElement('div');
  bucketsContainer.style.display = 'flex';
  bucketsContainer.style.gap = '20px';
  bucketsContainer.style.width = '100%';
  bucketsContainer.style.justifyContent = 'center';
  bucketsContainer.style.flexWrap = 'wrap';

  const bucketEls = {};
  challenge.buckets.forEach(bucket => {
    const bEl = document.createElement('div');
    bEl.className = 'sort-bucket';
    bEl.dataset.id = bucket.id;
    bEl.style.flex = '1';
    bEl.style.minWidth = '140px';
    bEl.style.minHeight = '140px';
    bEl.style.border = '3px dashed var(--border-color)';
    bEl.style.borderRadius = '16px';
    bEl.style.padding = '12px';
    bEl.style.display = 'flex';
    bEl.style.flexDirection = 'column';
    bEl.style.alignItems = 'center';
    bEl.style.backgroundColor = 'var(--bg-card)';
    bEl.style.transition = 'all 0.2s ease';

    const title = document.createElement('div');
    title.style.fontWeight = '800';
    title.style.fontSize = '16px';
    title.style.marginBottom = '8px';
    title.style.userSelect = 'none';
    title.innerText = `${bucket.emoji} ${bucket.name}`;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'bucket-items';
    itemsContainer.style.display = 'flex';
    itemsContainer.style.flexWrap = 'wrap';
    itemsContainer.style.gap = '6px';
    itemsContainer.style.width = '100%';
    itemsContainer.style.minHeight = '60px';
    itemsContainer.style.justifyContent = 'center';

    bEl.appendChild(title);
    bEl.appendChild(itemsContainer);
    bucketsContainer.appendChild(bEl);
    bucketEls[bucket.id] = bEl;
  });

  const pool = document.createElement('div');
  pool.className = 'sort-pool';
  pool.style.display = 'flex';
  pool.style.flexWrap = 'wrap';
  pool.style.gap = '10px';
  pool.style.padding = '16px';
  pool.style.backgroundColor = 'var(--bg-color)';
  pool.style.borderRadius = '16px';
  pool.style.width = '100%';
  pool.style.minHeight = '80px';
  pool.style.justifyContent = 'center';
  pool.style.alignItems = 'center';

  challenge.items.forEach((item, idx) => {
    const itemEl = document.createElement('button');
    itemEl.type = 'button';
    itemEl.className = 'word-block';
    itemEl.innerText = `${item.emoji} ${item.text}`;
    itemEl.dataset.idx = idx;
    itemEl.style.touchAction = 'none';

    itemEl.addEventListener('pointerdown', (e) => {
      if (state.isChecking) return;
      itemEl.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      let dragClone = null;
      let hasDragged = false;

      const onPointerMove = (moveEvent) => {
        if (state.isChecking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!hasDragged && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          hasDragged = true;

          dragClone = document.createElement('div');
          dragClone.className = 'word-block dragging-ghost';
          dragClone.innerText = itemEl.innerText;
          dragClone.style.position = 'fixed';
          dragClone.style.zIndex = '9999';
          dragClone.style.pointerEvents = 'none';
          dragClone.style.opacity = '0.9';
          dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          dragClone.style.transform = 'scale(1.05)';

          const rect = itemEl.getBoundingClientRect();
          dragClone.style.width = `${rect.width}px`;
          dragClone.style.height = `${rect.height}px`;
          document.body.appendChild(dragClone);
        }

        if (dragClone) {
          const rect = itemEl.getBoundingClientRect();
          dragClone.style.left = `${moveEvent.clientX - rect.width / 2}px`;
          dragClone.style.top = `${moveEvent.clientY - rect.height / 2}px`;

          challenge.buckets.forEach(bucket => {
            const bEl = bucketEls[bucket.id];
            const bRect = bEl.getBoundingClientRect();
            const isOver = (
              moveEvent.clientX >= bRect.left &&
              moveEvent.clientX <= bRect.right &&
              moveEvent.clientY >= bRect.top &&
              moveEvent.clientY <= bRect.bottom
            );
            if (isOver) {
              bEl.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              bEl.style.borderColor = 'var(--primary-color)';
            } else {
              bEl.style.backgroundColor = 'var(--bg-card)';
              bEl.style.borderColor = 'var(--border-color)';
            }
          });
        }
      };

      const onPointerUp = (upEvent) => {
        itemEl.releasePointerCapture(e.pointerId);
        itemEl.removeEventListener('pointermove', onPointerMove);
        itemEl.removeEventListener('pointerup', onPointerUp);

        if (dragClone) {
          dragClone.remove();
        }

        challenge.buckets.forEach(bucket => {
          const bEl = bucketEls[bucket.id];
          bEl.style.backgroundColor = 'var(--bg-card)';
          bEl.style.borderColor = 'var(--border-color)';
        });

        if (state.isChecking) return;

        if (hasDragged) {
          let hitBucketId = null;
          challenge.buckets.forEach(bucket => {
            const bEl = bucketEls[bucket.id];
            const bRect = bEl.getBoundingClientRect();
            const isOver = (
              upEvent.clientX >= bRect.left &&
              upEvent.clientX <= bRect.right &&
              upEvent.clientY >= bRect.top &&
              upEvent.clientY <= bRect.bottom
            );
            if (isOver) hitBucketId = bucket.id;
          });

          if (hitBucketId) {
            playSound('click');
            bucketEls[hitBucketId].querySelector('.bucket-items').appendChild(itemEl);
            state.dragSortAnswers[idx] = hitBucketId;
            speak(item.text);
            checkAllItemsSorted();
          } else {
            pool.appendChild(itemEl);
            delete state.dragSortAnswers[idx];
            checkAllItemsSorted();
          }
        } else {
          playSound('click');
          speak(item.text);
          if (itemEl.parentElement === pool) {
            const firstBucketId = challenge.buckets[0].id;
            bucketEls[firstBucketId].querySelector('.bucket-items').appendChild(itemEl);
            state.dragSortAnswers[idx] = firstBucketId;
          } else {
            pool.appendChild(itemEl);
            delete state.dragSortAnswers[idx];
          }
          checkAllItemsSorted();
        }
      };

      itemEl.addEventListener('pointermove', onPointerMove);
      itemEl.addEventListener('pointerup', onPointerUp);
    });

    pool.appendChild(itemEl);
  });

  function checkAllItemsSorted() {
    const sortedCount = Object.keys(state.dragSortAnswers).length;
    if (sortedCount === challenge.items.length) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', 'true');
    }
  }

  wrapper.appendChild(bucketsContainer);
  wrapper.appendChild(pool);
  container.appendChild(wrapper);
}

// Fill in the Blank challenge renderer
export function renderFillBlankChallenge(challenge, container, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'fill-blank-challenge';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '24px';
  wrapper.style.width = '100%';

  const sentenceRow = document.createElement('div');
  sentenceRow.style.fontSize = '24px';
  sentenceRow.style.fontWeight = '800';
  sentenceRow.style.display = 'flex';
  sentenceRow.style.alignItems = 'center';
  sentenceRow.style.gap = '8px';
  sentenceRow.style.justifyContent = 'center';
  sentenceRow.style.margin = '20px 0';

  const beforeText = document.createElement('span');
  beforeText.innerText = challenge.sentenceBefore;

  const blankSlot = document.createElement('span');
  blankSlot.className = 'blank-slot';
  blankSlot.style.minWidth = '80px';
  blankSlot.style.borderBottom = '3px solid var(--border-color)';
  blankSlot.style.textAlign = 'center';
  blankSlot.style.color = 'var(--primary-color)';
  blankSlot.style.padding = '0 8px';
  blankSlot.innerText = '_____';

  const afterText = document.createElement('span');
  afterText.innerText = challenge.sentenceAfter;

  sentenceRow.appendChild(beforeText);
  sentenceRow.appendChild(blankSlot);
  sentenceRow.appendChild(afterText);

  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'speaker-btn';
  speaker.innerHTML = '🔊 Hear Sentence';
  speaker.style.textIndent = '0';
  speaker.style.marginBottom = '10px';
  speaker.addEventListener('click', () => {
    playSound('click');
    speak(`${challenge.sentenceBefore} ${challenge.answer} ${challenge.sentenceAfter}`);
  });

  const pool = document.createElement('div');
  pool.style.display = 'flex';
  pool.style.gap = '12px';
  pool.style.justifyContent = 'center';

  challenge.options.forEach(word => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'word-block';
    btn.innerText = word;

    btn.addEventListener('click', () => {
      if (state.isChecking) return;
      playSound('click');
      speak(word);

      pool.querySelectorAll('.word-block').forEach(b => {
        b.style.outline = 'none';
        b.style.borderColor = 'var(--border-color)';
      });
      btn.style.outline = '4px solid var(--primary-color)';
      btn.style.borderColor = 'var(--primary-color)';

      blankSlot.innerText = word;
      state.fillBlankSelection = word;
      submitBtn.removeAttribute('disabled');
    });

    pool.appendChild(btn);
  });

  wrapper.appendChild(sentenceRow);
  wrapper.appendChild(speaker);
  wrapper.appendChild(pool);
  container.appendChild(wrapper);
}

// Speaking challenge renderer
export function renderSpeakingChallenge(challenge, container, submitBtn) {
  submitBtn.innerText = 'Skip';
  submitBtn.className = 'btn-3d btn-secondary';
  submitBtn.removeAttribute('disabled');

  const wrapper = document.createElement('div');
  wrapper.className = 'speaking-container';

  // 1. Emoji Visual Card
  const visualCard = document.createElement('div');
  visualCard.className = 'speaking-visual-card';
  visualCard.innerText = challenge.emoji || '🗣️';
  visualCard.addEventListener('click', () => {
    playSound('click');
    speak(challenge.word);
  });

  // 2. Word with Speaker Icon
  const wordContainer = document.createElement('div');
  wordContainer.className = 'speaking-word-container';
  wordContainer.innerHTML = `
    <span>${challenge.word}</span>
    <svg viewBox="0 0 24 24">
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 .77L6.5 8H3v8h3.5l4.5 4V4zm6 8c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>
  `;
  wordContainer.addEventListener('click', () => {
    playSound('click');
    speak(challenge.word);
  });

  // Speak the word initially with small delay so kid hears it
  setTimeout(() => speak(challenge.word), 400);

  // 3. Mic button container
  const micBtnContainer = document.createElement('div');
  micBtnContainer.className = 'mic-btn-container';

  const micBtn = document.createElement('button');
  micBtn.type = 'button';
  micBtn.className = 'mic-btn';
  micBtn.innerHTML = '🎙️';

  // 4. Feedback label
  const feedback = document.createElement('div');
  feedback.className = 'speaking-feedback';
  feedback.innerText = 'Tap to Speak';

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let autoStopTimeout = null;

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());

        feedback.className = 'speaking-feedback';
        feedback.innerText = 'Zen is thinking... 🧐';
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speaking.webm');

        try {
          const response = await fetch('/api/stt?lang=en', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Transcription error');

          const data = await response.json();
          const heardText = (data.text || '').trim();
          
          if (heardText) {
            const isMatch = checkSpeakingMatch(heardText, challenge.word);
            state.speakingHeard = heardText;
            state.speakingCorrect = isMatch;

            if (isMatch) {
              feedback.className = 'speaking-feedback success';
              feedback.innerText = `Perfect! You said: "${challenge.word}"`;
              micBtn.innerHTML = '✅';
              micBtn.style.backgroundColor = 'var(--primary-color)';
              
              // Mascot celebrates!
              const inlineMascot = document.getElementById('lesson-mascot-inline');
              if (inlineMascot) {
                inlineMascot.innerHTML = getZenMascotSVG('excited', true);
              }

              playSound('correct');
              submitBtn.innerText = 'Continue';
              submitBtn.className = 'btn-3d btn-primary';
              state.isCorrect = true;
              state.isChecking = true;
            } else {
              feedback.className = 'speaking-feedback error';
              feedback.innerText = `Heard: "${heardText}" (Try again!)`;
              micBtn.innerHTML = '🎙️';
              submitBtn.innerText = 'Check';
              submitBtn.className = 'btn-3d btn-primary';
            }
          } else {
            feedback.className = 'speaking-feedback error';
            feedback.innerText = 'No speech heard! Try again 🎙️';
            micBtn.innerHTML = '🎙️';
          }
        } catch (err) {
          console.error(err);
          feedback.className = 'speaking-feedback error';
          feedback.innerText = 'Failed to recognize. Check your microphone!';
          micBtn.innerHTML = '🎙️';
        }
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.className = 'mic-btn recording';
      micBtn.innerHTML = '🛑';
      feedback.innerText = 'Listening... Speak now!';
      triggerHaptic(100);

      // Auto stop after 4 seconds
      autoStopTimeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 4000);

    } catch (err) {
      console.error(err);
      feedback.className = 'speaking-feedback error';
      feedback.innerText = 'Microphone permission denied!';
    }
  }

  function stopRecording() {
    if (autoStopTimeout) {
      clearTimeout(autoStopTimeout);
      autoStopTimeout = null;
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    isRecording = false;
    micBtn.className = 'mic-btn';
    triggerHaptic(50);
  }

  micBtn.addEventListener('click', () => {
    playSound('click');
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  micBtnContainer.appendChild(micBtn);
  wrapper.appendChild(visualCard);
  wrapper.appendChild(wordContainer);
  wrapper.appendChild(micBtnContainer);
  wrapper.appendChild(feedback);
  container.appendChild(wrapper);
}

export function checkSpeakingMatch(heard, target) {
  const h = heard.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
  const t = target.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
  return h.includes(t) || t.includes(h);
}

// Verify answer
export function checkChallengeAnswer() {
  const challenge = state.currentLesson.challenges[state.currentChallengeIdx];
  const submitBtn = document.getElementById('lesson-submit-btn');
  const heartsVal = document.getElementById('stat-hearts-val');
  let isCorrect = false;
  
  if (challenge.type === 'matching') {
    isCorrect = true; // Auto-matched and succeeded
  } else if (challenge.type === 'choice' || challenge.type === 'listening') {
    isCorrect = state.selectedOption === challenge.answer;
    
    // UI Feedback styling
    document.querySelectorAll('.option-card').forEach(card => {
      const cardText = card.querySelector('.option-text')?.innerText;
      if (cardText === challenge.answer) {
        card.className = 'option-card correct';
      } else if (cardText === state.selectedOption) {
        card.className = 'option-card incorrect';
      }
    });
  } else if (challenge.type === 'builder') {
    // Reconstruct builder sentence
    const buildSentence = state.sentenceBuilderAnswers.map(item => item.word).join(' ');
    isCorrect = buildSentence.toLowerCase().trim() === challenge.targetText.toLowerCase().trim();
    
    const slot = document.querySelector('.build-slot');
    if (isCorrect) {
      if (slot) {
        slot.style.borderBottomColor = 'var(--primary-color)';
        slot.querySelectorAll('.word-block').forEach(b => b.classList.add('correct'));
      }
    } else {
      if (slot) {
        slot.style.borderBottomColor = 'var(--red-color)';
        slot.querySelectorAll('.word-block').forEach(b => b.classList.add('incorrect'));
      }
      
      // Speak target text so the kid absorbs the correct answer passively
      setTimeout(() => speak(challenge.targetText), 600);
      
      // Render correct text helper below slot
      const helper = document.createElement('div');
      helper.style.color = 'var(--primary-color)';
      helper.style.fontWeight = 'bold';
      helper.style.marginTop = '8px';
      helper.innerText = `Correct: "${challenge.targetText}"`;
      const builderContainer = document.querySelector('.sentence-builder');
      if (builderContainer) builderContainer.appendChild(helper);
    }
  } else if (challenge.type === 'yes-no') {
    isCorrect = state.yesNoSelection === challenge.answer;
    
    const yesBtn = document.querySelector('.yes-btn');
    const noBtn = document.querySelector('.no-btn');
    if (yesBtn && noBtn) {
      if (challenge.answer === 'yes') {
        yesBtn.style.outline = '4px solid #047857';
        if (state.yesNoSelection === 'no') {
          noBtn.style.outline = '4px solid #B91C1C';
        }
      } else {
        noBtn.style.outline = '4px solid #B91C1C';
        if (state.yesNoSelection === 'yes') {
          yesBtn.style.outline = '4px solid #B91C1C';
        }
      }
    }
  } else if (challenge.type === 'drag-sort') {
    isCorrect = challenge.items.every((item, idx) => state.dragSortAnswers[idx] === item.bucket);
    
    document.querySelectorAll('.sort-bucket').forEach(bEl => {
      const bucketId = bEl.dataset.id;
      bEl.querySelectorAll('.word-block').forEach(itemEl => {
        const itemIdx = parseInt(itemEl.dataset.idx);
        const correctBucket = challenge.items[itemIdx].bucket;
        if (bucketId === correctBucket) {
          itemEl.classList.add('correct');
        } else {
          itemEl.classList.add('incorrect');
        }
      });
    });
  } else if (challenge.type === 'fill-blank') {
    isCorrect = state.fillBlankSelection === challenge.answer;
    
    const blankSlot = document.querySelector('.blank-slot');
    if (blankSlot) {
      if (isCorrect) {
        blankSlot.style.color = 'var(--primary-color)';
        blankSlot.style.borderBottomColor = 'var(--primary-color)';
      } else {
        blankSlot.style.color = 'var(--red-color)';
        blankSlot.style.borderBottomColor = 'var(--red-color)';
        
        const helper = document.createElement('div');
        helper.style.color = 'var(--primary-color)';
        helper.style.fontWeight = 'bold';
        helper.style.marginTop = '8px';
        helper.innerText = `Correct: "${challenge.answer}"`;
        const fbContainer = document.querySelector('.fill-blank-challenge');
        if (fbContainer) fbContainer.appendChild(helper);
      }
    }
  } else if (challenge.type === 'speaking') {
    isCorrect = !!state.speakingCorrect;
  }
  
  // Smart Learning Engine: Track word performance based on challenge type
  if (challenge.type === 'matching') {
    Object.entries(challenge.pairs).forEach(([w, em]) => {
      trackWordPerformance(w, em, true);
    });
  } else if (challenge.type === 'choice' || challenge.type === 'listening') {
    const opt = challenge.options.find(o => o.text === challenge.answer);
    trackWordPerformance(challenge.answer, opt ? opt.emoji : '💡', isCorrect);
  } else if (challenge.type === 'yes-no') {
    trackWordPerformance(challenge.audioText, challenge.emoji, isCorrect);
  } else if (challenge.type === 'builder') {
    trackWordPerformance(challenge.targetText, '✍️', isCorrect);
  } else if (challenge.type === 'drag-sort') {
    challenge.items.forEach(item => {
      const itemIdx = challenge.items.findIndex(it => it.text === item.text);
      const isItemCorrect = state.dragSortAnswers[itemIdx] === item.bucket;
      trackWordPerformance(item.text, item.emoji, isItemCorrect);
    });
  } else if (challenge.type === 'fill-blank') {
    trackWordPerformance(challenge.answer, '💡', isCorrect);
  } else if (challenge.type === 'speaking') {
    trackWordPerformance(challenge.word, challenge.emoji || '🗣️', isCorrect);
  }

  state.rollingResults.push(isCorrect);
  if (state.rollingResults.length > 5) {
    state.rollingResults.shift();
  }
  if (state.rollingResults.length >= 3) {
    const correctCount = state.rollingResults.filter(Boolean).length;
    const rate = correctCount / state.rollingResults.length;
    if (rate >= 0.8) {
      state.difficulty = 'hard';
    } else if (rate <= 0.4) {
      state.difficulty = 'easy';
    } else {
      state.difficulty = 'medium';
    }
  }
  saveState();

  state.isChecking = true;
  state.isCorrect = isCorrect;
  
  const lessonMascot = document.getElementById('lesson-mascot-inline');
  
  if (isCorrect) {
    state.incorrectInARow = 0;
    if (lessonMascot) {
      lessonMascot.innerHTML = getZenMascotSVG('excited', true);
    }
    playSound('correct');
    triggerHaptic([80, 50, 80]); // double pulse
    submitBtn.innerText = 'Continue';
    submitBtn.className = 'btn-3d btn-primary';
  } else {
    state.incorrectInARow++;
    if (lessonMascot) {
      lessonMascot.innerHTML = getZenMascotSVG('sad', true);
    }
    if (state.incorrectInARow >= 3) {
      setTimeout(() => speak("Không sao đâu, hãy cố gắng lên nhé!"), 600);
    }
    playSound('incorrect');
    triggerHaptic(250); // long buzz
    state.hearts--;
    if (heartsVal) heartsVal.innerText = state.hearts;
    submitBtn.innerText = 'Continue';
    submitBtn.className = 'btn-3d btn-secondary';
    
    if (state.hearts <= 0) {
      setTimeout(async () => {
        if (lessonMascot) {
          lessonMascot.innerHTML = getZenMascotSVG('sleeping', true);
        }
        await showModal('hearts-empty');
        switchView('learn');
      }, 800);
    }
  }
}

export function nextChallenge() {
  state.currentChallengeIdx++;
  const lesson = state.currentLesson;
  
  if (state.currentChallengeIdx < lesson.challenges.length) {
    resetChallengeState();
    renderLessonView();
  } else {
    // Lesson Complete!
    playSound('correct');
    triggerHaptic([100, 50, 100, 50, 200]); // triple pulse
    
    // Confetti celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    let earnedFixIt = false;
    let earnedXP = 10;
    let earnedGems = 8;
    
    if (lesson.isDaily) {
      earnedXP = 30;
      earnedGems = 20;
      localStorage.setItem('zd_daily_completed_date', new Date().toDateString());
      triggerAchievement('daily_challenger');
    } else if (state.hearts === 5) {
      // Perfect lesson bonus
      earnedGems = 15;
    }
    
    state.xp += earnedXP;
    state.gems += earnedGems;
    
    if (lesson.isFixIt) {
      state.fixItLesson = null;
    } else {
      if (lesson.id !== 'daily_challenge' && !state.completedLessons.includes(lesson.id)) {
        state.completedLessons.push(lesson.id);
      }
      
      const currentLevel = LEVELS.find(l => l.lessons.some(les => les.id === lesson.id));
      if (currentLevel) {
        const allLevelLessonsDone = currentLevel.lessons.every(les => state.completedLessons.includes(les.id));
        if (allLevelLessonsDone && currentLevel.id === state.unlockedLevelId && state.unlockedLevelId < LEVELS.length) {
          state.unlockedLevelId++;
          state.gems += 25; // First completion of level bonus!
          earnedGems += 25;
        }
      }

      if (state.sessionMistakes.length >= 3) {
        state.fixItLesson = {
          id: "fix_it",
          title: "🩹 Fix It! Mistake Review",
          isFixIt: true,
          challenges: state.sessionMistakes.map(mistake => {
            return {
              type: "choice",
              instruction: `Let's practice: ${mistake.word}!`,
              options: [
                { text: mistake.word, emoji: mistake.emoji },
                { text: mistake.word === 'Dog' ? 'Cat' : 'Dog', emoji: mistake.word === 'Dog' ? '🐱' : '🐶' }
              ],
              answer: mistake.word
            };
          })
        };
        earnedFixIt = true;
      }
    }
    
    // Check all achievements
    checkAchievementsProgress();
    
    state.sessionMistakes = [];
    saveState();
    
    setTimeout(async () => {
      await showModal('lesson-complete', { xp: earnedXP, gems: earnedGems, hearts: state.hearts });
      if (earnedFixIt) {
        speak("Hãy sửa các lỗi sai nhé!");
      }
      switchView('learn');
    }, 500);
  }
}
