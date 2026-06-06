import { LEVELS as staticLevels } from './lessons.js';
import { showModal } from './modal.js';
import { renderLearnView } from './views/learn.js';
import { translate } from './translate.js';

export const CURIOSITY_CATEGORIES = {
  dinosaur: {
    name: "Dinosaur World",
    emoji: "🦖",
    keywords: ["dinosaur", "trex", "t-rex", "raptor", "volcano", "fossil", "dino", "egg"],
    words: [
      { text: "T-Rex", emoji: "🦖" },
      { text: "Volcano", emoji: "🌋" },
      { text: "Egg", emoji: "🥚" },
      { text: "Fossil", emoji: "🦴" }
    ]
  },
  space: {
    name: "Space Odyssey",
    emoji: "🚀",
    keywords: ["space", "rocket", "star", "moon", "planet", "alien", "astronaut", "mars", "sun"],
    words: [
      { text: "Rocket", emoji: "🚀" },
      { text: "Moon", emoji: "🌙" },
      { text: "Alien", emoji: "👽" },
      { text: "Planet", emoji: "🪐" }
    ]
  },
  ocean: {
    name: "Deep Ocean",
    emoji: "🐙",
    keywords: ["ocean", "shark", "whale", "fish", "octopus", "coral", "submarine", "sea", "crab"],
    words: [
      { text: "Shark", emoji: "🦈" },
      { text: "Whale", emoji: "🐋" },
      { text: "Octopus", emoji: "🐙" },
      { text: "Crab", emoji: "🦀" }
    ]
  }
};

export const state = {
  xp: parseInt(localStorage.getItem('zd_xp')) || 0,
  hearts: 5,
  streak: parseInt(localStorage.getItem('zd_streak')) || 1,
  unlockedLevelId: parseInt(localStorage.getItem('zd_unlocked_level')) || 1,
  completedLessons: JSON.parse(localStorage.getItem('zd_completed_lessons')) || [],
  activeView: 'learn', // 'learn', 'sandbox', 'review', 'lesson'
  currentLesson: null,
  currentChallengeIdx: 0,
  selectedOption: null,
  matchingPairsLeftSelected: null,
  matchingPairsRightSelected: null,
  matchedPairsCount: 0,
  sentenceBuilderAnswers: [],
  isChecking: false, // true during check state before clicking "Continue"
  isCorrect: false,
  reviewTimer: null,
  reviewIdx: 0,
  incorrectInARow: 0,
  
  // Smart learning engine states
  wordStats: JSON.parse(localStorage.getItem('zd_word_stats')) || {},
  rollingResults: JSON.parse(localStorage.getItem('zd_rolling_results')) || [],
  difficulty: localStorage.getItem('zd_difficulty') || 'medium',
  sessionMistakes: [],
  fixItLesson: JSON.parse(localStorage.getItem('zd_fix_it_lesson')) || null,
  sandboxHistory: JSON.parse(localStorage.getItem('zd_sandbox_history')) || [],
  customLevels: JSON.parse(localStorage.getItem('zd_custom_levels')) || [],

  // Reward Ecosystem states
  gems: parseInt(localStorage.getItem('zd_gems')) !== null && !isNaN(parseInt(localStorage.getItem('zd_gems'))) ? parseInt(localStorage.getItem('zd_gems')) : 120,
  purchasedOutfits: JSON.parse(localStorage.getItem('zd_purchased_outfits')) || ['default'],
  activeOutfit: localStorage.getItem('zd_active_outfit') || 'default',
  purchasedThemes: JSON.parse(localStorage.getItem('zd_purchased_themes')) || ['default'],
  activeTheme: localStorage.getItem('zd_active_theme') || 'default',
  companionEgg: JSON.parse(localStorage.getItem('zd_companion_egg')) || null,
  companionAnimal: JSON.parse(localStorage.getItem('zd_companion_animal')) || null,
  hasStreakFreeze: localStorage.getItem('zd_has_streak_freeze') === 'true',
  completedAchievements: JSON.parse(localStorage.getItem('zd_completed_achievements')) || [],
  lastActivityDate: localStorage.getItem('zd_last_activity_date') || null,

  // Parent Portal states
  parentPin: localStorage.getItem('zd_parent_pin') || null,
  profiles: JSON.parse(localStorage.getItem('zd_profiles')) || [],
  currentProfileId: localStorage.getItem('zd_current_profile_id') || null,
  dailyTimeLimit: localStorage.getItem('zd_daily_time_limit') !== null ? parseInt(localStorage.getItem('zd_daily_time_limit')) : 20,
  dailyGoal: localStorage.getItem('zd_daily_goal') !== null ? parseInt(localStorage.getItem('zd_daily_goal')) : 1,
  hideTranslations: localStorage.getItem('zd_hide_translations') === 'true',
  disabledCategories: JSON.parse(localStorage.getItem('zd_disabled_categories')) || [],
  todayMinutesSpent: localStorage.getItem('zd_today_minutes_spent') !== null ? parseInt(localStorage.getItem('zd_today_minutes_spent')) : 0,
  lastMinutesSpentDate: localStorage.getItem('zd_last_minutes_spent_date') || null
};

export let LEVELS = [...staticLevels, ...(state.customLevels || [])];

export let readingSubState = {
  subView: 'dashboard', // 'dashboard', 'tracing', 'sight-words', 'stories'
  activeLetter: null,
  sightWordIndex: 0,
  activeStory: null,
  storyPage: 0,
  sightWordDeck: []
};

export function updateDynamicLevels() {
  LEVELS = [...staticLevels, ...(state.customLevels || [])];
}

// --- Save State Helper ---
export function saveState() {
  localStorage.setItem('zd_xp', state.xp);
  localStorage.setItem('zd_streak', state.streak);
  localStorage.setItem('zd_unlocked_level', state.unlockedLevelId);
  localStorage.setItem('zd_completed_lessons', JSON.stringify(state.completedLessons));
  localStorage.setItem('zd_word_stats', JSON.stringify(state.wordStats));
  localStorage.setItem('zd_rolling_results', JSON.stringify(state.rollingResults));
  localStorage.setItem('zd_difficulty', state.difficulty);
  localStorage.setItem('zd_fix_it_lesson', JSON.stringify(state.fixItLesson));
  localStorage.setItem('zd_sandbox_history', JSON.stringify(state.sandboxHistory));
  localStorage.setItem('zd_custom_levels', JSON.stringify(state.customLevels));
  
  // Reward Ecosystem items
  localStorage.setItem('zd_gems', state.gems);
  localStorage.setItem('zd_purchased_outfits', JSON.stringify(state.purchasedOutfits));
  localStorage.setItem('zd_active_outfit', state.activeOutfit);
  localStorage.setItem('zd_purchased_themes', JSON.stringify(state.purchasedThemes));
  localStorage.setItem('zd_active_theme', state.activeTheme);
  localStorage.setItem('zd_companion_egg', JSON.stringify(state.companionEgg));
  localStorage.setItem('zd_companion_animal', JSON.stringify(state.companionAnimal));
  localStorage.setItem('zd_has_streak_freeze', state.hasStreakFreeze);
  localStorage.setItem('zd_completed_achievements', JSON.stringify(state.completedAchievements));
  localStorage.setItem('zd_last_activity_date', state.lastActivityDate);

  // Parent Portal items
  if (state.parentPin) localStorage.setItem('zd_parent_pin', state.parentPin);
  localStorage.setItem('zd_profiles', JSON.stringify(state.profiles));
  if (state.currentProfileId) localStorage.setItem('zd_current_profile_id', state.currentProfileId);
  localStorage.setItem('zd_daily_time_limit', state.dailyTimeLimit);
  localStorage.setItem('zd_daily_goal', state.dailyGoal);
  localStorage.setItem('zd_hide_translations', state.hideTranslations);
  localStorage.setItem('zd_disabled_categories', JSON.stringify(state.disabledCategories));
  localStorage.setItem('zd_today_minutes_spent', state.todayMinutesSpent);
  localStorage.setItem('zd_last_minutes_spent_date', state.lastMinutesSpentDate);
}

// --- Smart Learning Engine Helpers ---
export function trackWordPerformance(word, emoji, isCorrect) {
  if (!word) return;
  const key = word.toLowerCase().trim();
  if (!state.wordStats[key]) {
    state.wordStats[key] = { attempts: 0, correct: 0, score: 3, lastSeen: 0 };
  }
  const stats = state.wordStats[key];
  stats.attempts++;
  if (isCorrect) {
    stats.correct++;
  }
  
  // Leitner score rating (1-5 stars)
  if (isCorrect) {
    stats.score = Math.min(5, stats.score + 1);
  } else {
    stats.score = Math.max(1, stats.score - 1);
    
    // Add to session mistakes for Fix It lesson if not already present
    if (!state.sessionMistakes.some(m => m.word.toLowerCase() === key)) {
      state.sessionMistakes.push({ word, emoji: emoji || '💡' });
    }
  }
  stats.lastSeen = Date.now();
  saveState();
}

export function checkCuriosityUnlock(word) {
  const clean = word.toLowerCase().trim();
  if (!state.sandboxHistory.includes(clean)) {
    state.sandboxHistory.push(clean);
  }
  
  for (const [catId, cat] of Object.entries(CURIOSITY_CATEGORIES)) {
    if (state.customLevels.some(l => l.catId === catId)) continue;
    
    const matchedHistory = state.sandboxHistory.filter(w => cat.keywords.includes(w));
    if (matchedHistory.length >= 3) {
      // Build a dynamic level structure
      const newLevelId = LEVELS.length + 1;
      const newLevel = {
        id: newLevelId,
        catId: catId,
        title: `Curiosity: ${cat.name}`,
        icon: cat.emoji,
        lessons: [
          {
            id: `curiosity_${catId}_1`,
            title: `${cat.name} Explorers`,
            challenges: [
              {
                type: "matching",
                instruction: `Match the ${cat.name} elements!`,
                pairs: cat.words.reduce((acc, w) => { acc[w.text] = w.emoji; return acc; }, {})
              },
              {
                type: "yes-no",
                instruction: `Is this a ${cat.words[0].text}?`,
                emoji: cat.words[0].emoji,
                audioText: cat.words[0].text,
                answer: "yes"
              },
              {
                type: "choice",
                instruction: `Find the ${cat.words[1].text}!`,
                options: cat.words.map(w => ({ text: w.text, emoji: w.emoji })),
                answer: cat.words[1].text
              }
            ]
          }
        ]
      };
      
      state.customLevels.push(newLevel);
      updateDynamicLevels();
      saveState();
      
      setTimeout(async () => {
        await showModal('curiosity-unlocked', { catName: cat.name, emoji: cat.emoji });
        if (state.activeView === 'learn') {
          renderLearnView();
        }
      }, 1200);
    }
  }
}

export let dynamicVocabulary = [];

export async function initDynamicVocabulary() {
  if (dynamicVocabulary.length > 0) return dynamicVocabulary;

  const seen = new Set();
  const list = [];

  LEVELS.forEach(level => {
    level.lessons.forEach(lesson => {
      lesson.challenges.forEach(challenge => {
        if (challenge.type === 'matching') {
          Object.entries(challenge.pairs).forEach(([word, emoji]) => {
            const cleanWord = word.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji, val: '' });
            }
          });
        } else if (challenge.type === 'choice' || challenge.type === 'listening') {
          challenge.options.forEach(opt => {
            const cleanWord = opt.text.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji: opt.emoji, val: '' });
            }
          });
        } else if (challenge.type === 'yes-no') {
          const cleanWord = challenge.audioText.trim();
          if (!seen.has(cleanWord.toLowerCase())) {
            seen.add(cleanWord.toLowerCase());
            list.push({ word: cleanWord, emoji: challenge.emoji, val: '' });
          }
        } else if (challenge.type === 'drag-sort') {
          challenge.items.forEach(item => {
            const cleanWord = item.text.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji: item.emoji, val: '' });
            }
          });
        } else if (challenge.type === 'fill-blank') {
          challenge.options.forEach(word => {
            const cleanWord = word.trim();
            if (!seen.has(cleanWord.toLowerCase())) {
              seen.add(cleanWord.toLowerCase());
              list.push({ word: cleanWord, emoji: '💡', val: '' });
            }
          });
        } else if (challenge.type === 'speaking') {
          const cleanWord = challenge.word.trim();
          if (!seen.has(cleanWord.toLowerCase())) {
            seen.add(cleanWord.toLowerCase());
            list.push({ word: cleanWord, emoji: challenge.emoji || '🗣️', val: '' });
          }
        }
      });
    });
  });

  if (list.length === 0) {
    list.push(
      { word: "Dog", emoji: "🐶", val: "Con chó" },
      { word: "Cat", emoji: "🐱", val: "Con mèo" }
    );
  }

  dynamicVocabulary = list;

  // Asynchronously translate all words in the background
  list.forEach(async (item) => {
    try {
      const translated = await translate(item.word);
      item.val = translated || item.word;
    } catch (e) {
      item.val = item.word;
    }
  });

  return dynamicVocabulary;
}

export function findWordEmoji(wordStr) {
  const norm = wordStr.toLowerCase().trim();
  for (const lvl of LEVELS) {
    if (!lvl.words) continue;
    const match = lvl.words.find(w => w.text.toLowerCase().trim() === norm);
    if (match) return match;
  }
  return null;
}
