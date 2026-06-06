# From first tap to beating Duolingo

*A phase-by-phase growth plan for teaching babies & kids — seen through the eyes of a child who has never received any instructions.*

### Key Highlights
- 11 Phases of work
- Vietnamese–English focus
- Local AI powered (zen-tts + zen-lights)
- Offline-first PWA
- Ages 1–8 target

## Step 1 · Code Audit: What exists today — honest review

### ✓ Strong Foundations
- Clean Vite SPA — fast, easy to iterate on
- 4 solid challenge types: matching, choice, listening, builder
- Local AI stack (zen-tts + zen-lights) is genuinely unique
- XP / hearts / streak system with localStorage persistence
- Curiosity Sandbox — no equivalent in Duolingo Kids
- Fredoka font + 3D tactile buttons feel playful and right
- Dark / light mode support
- TTS speaks every word clicked — great passive listening

### ✗ Critical Problems Found
- `alert()` and `confirm()` used everywhere — kills immersion completely
- Lesson complete uses `alert()` — no celebration screen
- Hearts-runout uses `alert()` inside `setTimeout`
- Exit button uses `confirm()` — children cannot process this
- Sandbox has a text input field — toddlers cannot type
- Review mode is entirely hardcoded, ignores all lesson content
- No first-run onboarding — child has zero guidance
- Challenge instructions are text-only — pre-readers are lost
- Only 4 levels (~10–15 minutes of content total)
- Path map is a straight vertical line — no visual journey feeling

## Step 2 · Gap Analysis: Feature gaps vs Duolingo (Kids edition)

| Feature / Dimension | Duolingo | Zen-Duo (today) | Impact on a 3-year-old | Priority |
| --- | --- | --- | --- | --- |
| **Mascot / Guide character** | Duo the owl — iconic, emotional, ever-present | None | Child has no "friend" — no emotional attachment to the app | **[Critical]** |
| **Onboarding flow** | Guided first-lesson with Duo walking you through each step | None — cold start | Child opens app and sees a map with no explanation | **[Critical]** |
| **Lesson completion screen** | Full-screen celebration with stars, XP animation, character | `alert()` dialog | Jarring browser dialog in place of joyful celebration | **[Critical]** |
| **Animated path map** | Winding path with checkpoints, animations, scenery | Straight vertical column | No sense of journey or progress | **[High]** |
| **Audio-narrated instructions** | Instructions spoken aloud by Duo in kids mode | Text only | Pre-readers (age 2–4) cannot read challenge instructions | **[Critical]** |
| **Heart refill system** | Timed refill, gem purchase, or practice exercises | Hearts reset each lesson — no refill mechanic | No cost to mistakes — hearts have zero meaning | **[High]** |
| **Curriculum depth** | Hundreds of levels, years of content | 4 levels (~10–15 min) | Child exhausts content in one sitting | **[Critical]** |
| **Spaced repetition (SRS)** | Intelligent review scheduling for retention | None — review is hardcoded slideshow | Words are never revisited strategically — poor retention | **[High]** |
| **Achievement badges** | Dozens of achievement types, trophy collection | None | No milestone celebration beyond lesson end | **[Medium]** |
| **Streak rewards / protection** | Streak freeze, streak bonus, streak society | Streak counted but no meaning or protection | Streak is just a number — no motivation to protect it | **[Medium]** |
| **Pronunciation / speaking** | Speak challenges with voice recognition scoring | None | No output practice — only passive input | **[Medium]** |
| **Gem/coin economy** | Lingots / gems fund hearts, power-ups, cosmetics | None | No reward loop beyond XP number going up | **[Medium]** |
| **Parent dashboard** | Family plan with progress reports | None | Parents have no visibility into what child is learning | **[Medium]** |
| **Adaptive difficulty** | Adjusts challenge difficulty per learner | Fixed difficulty | No personalization — same experience for all ages | **[Medium]** |
| **PWA / offline support** | Full offline via mobile app | None (in TODO) | Cannot use in airplane, car, or poor-connectivity areas | **[High]** |

## Step 3 · Roadmap: Phased delivery timeline

### Roadmap Timeline
**P0** (Now) | **P1** (M1) | **P2** (M2) | **P3** (M2–3) | **P4** (M3–4) | **P5** (M4–5) | **P6** (M5–6) | **P7** (M6–7) | **P8** (M7–8) | **P9** (M8–10) | **P10** (M10+)

### P0: 🚨 Critical Fixes — Remove All Blockers
*The app must not crash a child's experience before they even start*

- **Impact**: Do first
- **Timeline**: ~1 week

> 👶 **Baby's eye view**
> A 3-year-old picks up the tablet. She taps the level icon. She finishes her first lesson. A gray browser alert box appears. She taps anywhere on the screen — the browser chrome. She's confused. She hands the tablet back. *Session over.*

These are bugs, not features. Every single `alert()` and `confirm()` must be replaced before shipping to any child. This is the minimum viable state for a real child to use the app unsupervised.

- 🚫 **alert() on lesson complete (line 600, main.js)**: Replace with a full-screen celebration modal: stars earned, XP animation, confetti burst, mascot celebrating, "Continue" button. This is the emotional peak of every lesson — treat it that way.
- 🚫 **alert() on hearts runout (line 562–565, main.js)**: Replace with an animated "hearts empty" screen — a sad/sleepy mascot, gentle music, a "Try Again" button. No jarring dialog. No browser chrome involvement.
- 🚫 **confirm() on lesson exit button (line 223, main.js)**: Replace with an in-app slide-up sheet: "Leave this lesson? Your progress will be lost." with Yes/No large-tap buttons. Children cannot read confirm dialogs.
- 🚫 **Text-only challenge instructions**: Add `speak(challenge.instruction)` on every challenge render. The instruction text must be read aloud automatically with a small delay. Pre-readers depend on this entirely.
- 🚫 **Hardcoded review vocabulary (line 698–710, main.js)**: The review slideshow shows a fixed list of 11 words completely disconnected from what the child has learned. Build a vocabulary index from LEVELS → lessons → challenges and pull from there.
- 🚫 **Sandbox text input field**: Children ages 2–5 cannot type. Add a "picture category picker" grid as the primary mode: big tap-friendly icons for Animals, Food, Colors, etc. Keep the text input as a secondary "Advanced" mode.

> 💡 **Implementation Note**: Create a shared `showModal(type, data)` function in a new `modal.js` file. Types: `'lesson-complete'` , `'hearts-empty'` , `'exit-confirm'` , `'level-unlock'` . This prevents future alert() regression and gives a consistent overlay system.

### P1: 💛 Heart & Soul — Mascot + World Building
*Give the app a personality a child will love and miss*

- **Impact**: High impact
- **Timeline**: Month 1

> 👶 **Baby's eye view**
> Without a mascot, zen-duo is a worksheet. With one, it's a friend. When Duo the owl celebrates with a child, Duolingo becomes emotionally sticky. Zen-duo needs that same character — a creature the child will ask to "visit" every day.

- **🐼 Design "Zen" — the mascot**: A small friendly creature (panda? cloud spirit? leaf-dragon?). SVG-based with 6 emotion states: Happy, Excited, Sleeping, Sad, Thinking, Celebrating. Designed as a simple SVG that zen-lights can render at any size.
- **🗺️ Winding path map**: Replace straight vertical column with a zigzag/winding path SVG. Level nodes sit on the path like Duolingo. Completed sections show a filled green trail. Locked sections are greyed out with a lock icon.
- **👋 First-run onboarding**: Zen appears on first launch. "Xin chào! I'm Zen! Let me show you around." 3-screen guided tour with large tap zones. No text reading required — Zen speaks everything. Stores completion flag in localStorage.
- **🎊 Animated celebration screens**: Lesson complete: Zen dances, stars animate in (1–3 based on mistakes made), XP counter ticks up, confetti rains. Level unlock: Zen gasps, the path glows, new node animates into the map. Full-screen modal every time.
- **💔 Emotional error recovery**: Wrong answer: Zen looks worried, shakes head gently, then shows "Let's try again!" Wrong answer 3× in a row: Zen says something encouraging in Vietnamese. Hearts empty: Zen looks sleepy, "Zen needs a rest..." — much softer than current behavior.
- **🌟 Daily greeting**: Each session start, Zen greets the child based on time of day: "Good morning!" / "Good afternoon!" / "Good night!". Streak shown as "Zen has visited X days in a row!". Creates daily attachment ritual.

> 💡 **Implementation Note**: Create `zen-mascot.js` as an SVG sprite system. Zen's states are SVG frames accessible via CSS class swap. The mascot component should be reusable anywhere — map, lesson, sandbox, review — with a `setEmotion(type)` API.

### P2: 📱 PWA + Touch Perfection
*Make it feel like a native app, work offline, and respond to tiny fingers*

- **Impact**: Technical
- **Timeline**: Month 2

> 👶 **Baby's eye view**
> A child on a car journey in a tunnel. Dad taps the app icon on the home screen (like a real app). It opens instantly. No loading spinner. No "you need internet" message. The child plays normally. This is the offline PWA promise.

- **⚡ PWA Installation**: Install `@vite-pwa/plugin` . Configure manifest with zen-duo icons, splash screen, theme color. Service worker caches: all SVG icons, CSS fonts (Fredoka), lesson data, TTS audio for completed levels.
- **✋ Drag-and-drop sentence builder**: Replace click-to-add with native `pointerdown/move/up` drag events. Word blocks can be physically dragged into the answer slot. This is how children instinctively interact with tablets — the current click-to-add feels unnatural.
- **📲 Bottom tab navigation**: Replace the hamburger + sidebar with a fixed bottom tab bar on mobile (like every native app). 4 tabs: Learn, Sandbox, Review, Profile. The current hidden sidebar is invisible to children.
- **👆 Touch target sizing**: Every tappable element must be at minimum 56×56px on mobile. Audit all option cards, word blocks, and nav items. Add generous padding. Children have imprecise fine motor control — small tap zones cause frustration.
- **📳 Haptic feedback**: Use `navigator.vibrate()` for key moments: correct answer (short double pulse), wrong answer (long buzz), lesson complete (triple pulse pattern). Adds physical reward sensation beyond just sound.
- **🔄 Orientation lock**: Add `screen.orientation.lock('portrait')` on install. Zen-duo is designed portrait. Accidental rotation to landscape during excited tapping should not break the layout.

> 💡 **Implementation Note**: Local service caching strategy:** zen-tts audio responses should be cached in IndexedDB keyed by word. zen-lights SVG outputs cached by word in localStorage. Once a child has heard and seen a word, it should load <50ms on every subsequent visit even offline.

### P3: 📚 Content Explosion — 20+ Levels
*Fill the learning world with vocabulary that matters to children*

- **Impact**: Most visible impact
- **Timeline**: Month 2–3

> 👶 **Baby's eye view**
> A child completes all 4 levels in one day. They tap the map the next morning. All levels are already gold. There's nothing new to do. They put the tablet down and don't come back. *Churn from content exhaustion.*

The current 4 levels represent roughly 10–15 minutes of content. A child who learns efficiently can exhaust this in a single session. We need at least 20 levels for the first month of engagement, growing toward 50+ over the year. Each level = 2–3 lessons = ~15 minutes of play.

**New challenge types to add in Phase 3:**

- **Tap the picture (type: "tap-image")** — Show 4–6 pictures, speak a word, child taps the right one. Zero reading required. Best exercise for ages 2–3.
- **Yes or No (type: "yes-no")** — Show a picture + say a word. Two giant YES / NO buttons. "Is this a cat? Yes!" Great for very early learners.
- **Drag to sort (type: "drag-sort")** — Two buckets (e.g. Animals / Foods). Drag each item to the right bucket. Uses pointer events from Phase 2.
- **Fill the blank (type: "fill-blank")** — "The ___ is red." with 3 word choices. Introduces simple grammar in context.

#### Level Directory
- 🐶 **L1 (exists)**: Pets & Sounds
- 🍎 **L2 (exists)**: Yummy Foods
- 🏠 **L3 (exists)**: My Sweet Home
- 🌈 **L4 (exists)**: Sky & Colors
- 🔢 **L5 · NEW**: Numbers 1–10
- 👋 **L6 · NEW**: Hello World
- 👨‍👩‍👧 **L7 · NEW**: My Family
- 😊 **L8 · NEW**: How I Feel
- 👕 **L9 · NEW**: Getting Dressed
- 🌦️ **L10 · NEW**: Weather & Sky
- 🚗 **L11 · NEW**: Vroom Vroom
- ⚽ **L12 · NEW**: Let's Play
- 🌿 **L13 · NEW**: Nature Walk
- 🎒 **L14 · NEW**: At School
- ⬛ **L15 · NEW**: Shapes
- 🕐 **L16 · NEW**: What Time Is It?
- 💪 **L17 · NEW**: My Body
- 🌸 **L18 · NEW**: Seasons & Tết
- 🔢 **L19 · NEW**: Numbers 10–20
- 🌍 **L20 · NEW**: My World

> 💡 **Implementation Note**: Content generation strategy:** Use zen-lights (the local Qwen-Coder model) to auto-generate lesson JSON from a topic + word list prompt. This dramatically speeds up authoring new levels. Define a `lesson-template.json` schema and have the AI fill it. Human review each generated lesson before shipping.

### P4: 🧠 Smart Learning Engine
*Make the app adapt to each child — not the other way around*

- **Impact**: Pedagogy
- **Timeline**: Month 3–4

> 👶 **Baby's eye view**
> A 4-year-old knows "dog" and "cat" perfectly but keeps getting "fish" wrong. The app keeps testing "dog" and "cat" anyway — and never drills "fish" enough. A smart system sees the weak word and serves it more often until it sticks. This is how human tutors work.

- **🔁 Spaced Repetition (SRS)**: Track per-word performance (attempts, correct rate, last seen). Score words 1–5 stars. Schedule review using a simplified Leitner box system: 5-star words appear weekly, 1-star words appear in every session.
- **📉 Adaptive difficulty**: Track rolling 5-challenge performance. If >80% correct → increase challenge complexity (fewer choices, harder distractors, longer sentences). If <50% → simplify (more visual cues, fewer options, shorter words).
- **🩹 Auto-generated mistake review**: After every session, collect all incorrectly answered words. If ≥3 errors, create a "Fix It!" mini-lesson on the map: a special red node that replays those specific words in simplified form until mastered.
- **🔬 Dynamic curiosity levels**: Track words searched in the Sandbox. If a child searches 3+ words in the same category (e.g. "dinosaur", "T-Rex", "volcano"), auto-generate and inject a "Dinosaur World" level on the map using zen-lights.
- **⭐ Word mastery stars**: Each word has 0–5 stars visible in a "My Words" dictionary view. Stars fill as the word is correctly answered across sessions (not just within one lesson). A word is "mastered" at 5 stars.
- **🌡️ Difficulty toggle**: A parent-accessible "pace" setting: Gentle (fewer choices, more audio hints), Standard, Explorer (harder distractors, less audio scaffolding, reverse translation). Defaults to Gentle for ages 0–3.

> 💡 **Implementation Note**: Data model:** Create a `wordBank` object in state/localStorage keyed by word ID. Each entry: `{ word, attempts, correct, lastSeen, level, starRating }` . The SRS scheduler runs at session start and appends flagged words to the lesson queue. This data also feeds the parent dashboard in Phase 8.

### P5: 🎤 Speaking & Pronunciation
*The child's voice becomes part of the learning loop*

- **Impact**: AI integration
- **Timeline**: Month 4–5

> 👶 **Baby's eye view**
> The child hears "cat" twenty times but never says it themselves. Passive input is valuable, but active output — actually speaking the word — creates far stronger neural pathways. When a child says "cat" and hears themselves say it correctly, something clicks that listening alone cannot create.

- **🎙️ "Say it!" challenge type**: New challenge type: show a picture, Zen asks "What is this?". Big microphone button. Child speaks. Local Whisper model transcribes. If the word matches → green explosion. Zero cloud, full privacy.
- **📊 Pronunciation scoring**: Compare Whisper's transcription to target word. Exact match = 100%. Phonetically close = partial credit (use edit distance on IPA representation). Show a simple "Great! / Almost! / Try again!" — not a number score for kids.
- **🔁 Echo mode**: New challenge: Zen says a word, then a waveform animates showing "your turn". Child says the word back. Whisper confirms. Simple imitation exercise — the lowest-friction speaking practice. Excellent for ages 2+.
- **🎵 Phonics module (pre-reading)**: Before age 4 can read, they learn sounds. Add a phonics track: learn the /a/ sound → words that start with /a/ → tap the ones that start with /a/. Connects letter shapes to mouth sounds. Foundation for reading in Phase 6.
- **🦜 Parrot mode in Sandbox**: In the Curiosity Sandbox, add a microphone button. Child can tap any word → hear it → tap microphone → say it → get score. Infinite speaking practice with any word they're curious about.
- **📻 Record & Playback**: After a speaking challenge, play back the child's own voice alongside the model pronunciation. Children are fascinated by hearing themselves. This metacognitive comparison accelerates pronunciation improvement dramatically.

> 💡 **Implementation Note**: Local Whisper integration:** Route audio via `/api/stt` proxy to a local Whisper endpoint (similar to existing zen-tts at :5055). Use Whisper Tiny or Base model for fast CPU inference. Add a new backend entry in `vite.config.js` proxy config. Web Audio API `MediaRecorder` captures .webm, converts to WAV, POSTs to endpoint.

### P6: 📖 Reading Foundation
*Bridge from pictures to written words, gently and naturally*

- **Impact**: Age 4+
- **Timeline**: Month 5–6

> 👶 **Baby's eye view**
> A 5-year-old sees the word "CAT" and sounds it out: /k/ /æ/ /t/. They've heard the word a hundred times in zen-duo. Now the letters connect. This moment — when spoken language and written symbols converge — is one of the most profound leaps in early childhood. Zen-duo can scaffold it.

- **🔤 Letter recognition track**: A separate "ABC" path alongside the main vocabulary path. Each letter: see the shape, hear the sound, trace it with a finger, find words that start with it. Uses phonics foundation from Phase 5.
- **✏️ Letter tracing**: Touch-based tracing: a letter displayed in dashed outline, child traces over it with finger. Use Canvas API to detect if path follows the letter guide within tolerance. Gentle sparkle trail follows the finger.
- **🔍 Sight words module**: The 100 most common English words (the, a, is, I, you, etc.) presented as a "power words" track. These cannot be sounded out phonetically — they must be memorized by sight. Flash-card style with SRS from Phase 4.
- **📕 First Readers**: 3–5 sentence illustrated stories using only mastered vocabulary. "The cat sat. The cat is red. The red cat runs." One sentence per screen, auto-spoken. Child can tap any word to hear it again. Beautiful illustrated backgrounds using zen-lights SVG.
- **🔡 Spell it! challenge**: New challenge type for age 5+: show a picture (e.g. cat), provide letter tiles, child arranges them to spell the word. A scaled-up version of the sentence builder, applied to individual letters. Great prerequisite for writing.
- **📚 My Word Dictionary**: All mastered words collected in a personal illustrated dictionary — the child's "book". Each entry: the word, its SVG illustration (from zen-lights), its Vietnamese translation, a star rating, and a tap-to-hear button. A trophy of learning.

### P7: 💎 Reward Ecosystem
*Give children reasons to return every single day*

- **Impact**: Engagement loop
- **Timeline**: Month 6–7

> 👶 **Baby's eye view**
> A child opens the app and sees their pet cloud-dragon has grown bigger since yesterday. It has a little hat because they earned enough gems. They want to come back tomorrow to see what happens next. This is the attachment mechanic that makes apps daily habits.

- **💎 Gem currency**: Gems earned from: perfect lessons (no mistakes), streak milestones, first completion of a level, daily bonus. Separate from XP (which measures progress). Gems buy cosmetics and consumables from the shop.
- **🥚 Zen's companion egg**: At Level 5, Zen gives the child a mystery egg. It hatches after 3 days of activity. Inside: a companion animal (one of 12 types). The companion appears on the map path and in lesson celebrations. Can be fed/leveled up with gems.
- **🛒 Cosmetics shop**: Spend gems on: Zen outfits (astronaut, chef, knight), map background themes (jungle, space, ocean), lesson card borders, celebration effect styles. All cosmetic — no pay-to-win. Children love customization.
- **🏆 Achievement badges**: 50+ badges categorized: Explorer (first lesson, first 5 levels), Scholar (10/50/100 words mastered), Streaker (7/30/100 day streak), Champion (perfect lesson, 5 perfect lessons in a row), Curious (20 sandbox searches). Shown in a trophy room.
- **🛡️ Streak freeze**: Streak shield: buy with 50 gems, auto-activates if a day is missed. Without this, a 30-day streak lost on a sick day feels devastating to a child (and ends engagement). Essential for sustainable daily habit.
- **📅 Daily challenge node**: A special "Star Challenge" node appears on the map every day. Completing it: 3× XP, gems, special badge. Auto-resets at midnight. This creates a daily reason to open the app independent of curriculum progress.

> ⚠️ **Design Principle**: All rewards must be cosmetic or consumable practice aids. Never put vocabulary content, curriculum levels, or learning advancement behind a paywall or gem wall. The learning must always be 100% free — rewards are for decoration and motivation only.

### P8: 👨‍👩‍👧 Parent Portal
*Give parents visibility, control, and peace of mind*

- **Impact**: Trust builder
- **Timeline**: Month 7–8

> 👶 **Baby's eye view**
> "Mama, I know 'elephant' in English!" — and the parent can verify this in the portal. They see that their 3-year-old has practiced 47 words this week, knows 'elephant' at 4 stars, and struggles with 'purple'. The parent knows exactly how their child is doing without needing to sit next to them.

- **🔒 PIN-protected parent mode**: Long-press the Zen mascot in the map → PIN entry (4-digit parent PIN set on first run). Enters parent mode overlay without disrupting child's session or progress.
- **📊 Weekly progress report**: Words learned this week (with illustrations). Lessons completed. Minutes spent each day (bar chart). Accuracy rate. Star ratings for each word category. Downloadable as PDF flashcard sheet.
- **⚙️ Learning controls**: Set daily time limit (e.g. 20 min). Set daily lesson goal. Enable/disable specific content categories. Adjust difficulty preset (from Phase 4). Toggle Vietnamese translation visibility (hide it to increase challenge).
- **👶 Multiple child profiles**: Support up to 4 child profiles per device. Each profile: name, age, avatar, separate progress/state. Child selects their profile on startup by tapping their picture. Profile switching is instant.
- **📅 Learning schedule**: Set preferred lesson time (morning / afternoon / evening). When the scheduled time arrives and the app hasn't been opened, Zen sends a push notification: "Zen misses you! Ready to learn?" (Web Push API).
- **📖 Word list export**: Export child's mastered word list as: printable flashcards (PDF), CSV for teachers, or WhatsApp-shareable image collage ("Look what Minh learned this week! 🎉"). Sharing creates social proof and parent engagement.

### P9: 🎨 Creative & Story Mode
*Language becomes a creative tool, not just a test*

- **Impact**: Unique to zen-duo
- **Timeline**: Month 8–10

> 👶 **Baby's eye view**
> The child searches "rainbow dragon" in the Sandbox. The AI draws it. The child colors it in with their finger. They say "rainbow dragon is red and yellow!" The sentence is recorded and played back. They show their creation to mum. Language is no longer something the app tests — it's something the child makes.

- **🖌️ SVG Coloring Book**: In Curiosity Sandbox: after an SVG loads from zen-lights, expose SVG path nodes. Child taps a section → color palette appears → they fill it. The completed colored image saves to their gallery. Promotes creative use of the vocabulary they know.
- **📖 Illustrated Story Builder**: Select 3–5 mastered words. The app arranges them into a simple story with AI-generated SVG scenes: "The red cat sat on a big book. A blue fish swam by. 'Hello!' said the cat." Read aloud by zen-tts. Child "reads" along tapping each word.
- **✂️ Print & Play Cards**: Generate a printable set of flashcards from mastered words: the SVG illustration on one side, the English word + Vietnamese on the other. Print to share with grandparents who don't have a device. Physical-digital bridge.
- **🎙️ Voice Story Recording**: After creating a story, child records themselves reading it aloud. Playback with their voice. Send as a voice note to parents. "Listen, mum — I read this!" The most powerful home engagement feature possible.
- **🔍 Word Scavenger Hunt**: Real-world mode: app shows a word and says "Find me something [red]!" Child uses device camera (or just looks around). They tap "Found it!" and say the word aloud. Bridges learning from screen to the physical world around them.
- **🏆 "My First Book" milestone**: At 100 mastered words: the app generates a personalized illustrated book — "Minh's English Adventure" — as a downloadable PDF. Every page uses the child's actual learned words with zen-lights illustrations. A physical achievement they can hold.

### P10: 🚀 Go Beyond Duolingo
*Features Duolingo cannot build — because zen-duo is built differently*

- **Impact**: Competitive moat
- **Timeline**: Month 10+

Everything so far closes the gap with Duolingo. Phase 10 opens a new gap — in zen-duo's favor. These features are possible *because* zen-duo uses local AI, serves Vietnamese families, and is open-source. Duolingo cannot replicate them without fundamentally changing their business model.

## Summary: Zen-duo vs Duolingo — by phase

| 🟢 Duolingo Kids — today | 🌿 Zen-duo — after all phases |
|---|---|
| ✓ Duo the owl mascot | → Zen mascot (Phase 1) |
| ✓ Animated winding path map | → Winding path (Phase 1) |
| ✓ Hundreds of levels | → 20+ levels (Phase 3), growing |
| ✓ Guided onboarding | → Zen-guided onboarding (Phase 1) |
| ✓ Lesson celebration screens | → Full celebration screens (Phase 0) |
| ✓ Heart refill mechanic | → Gem-based refill (Phase 7) |
| ✓ Gem economy + shop | → Gem shop + pets (Phase 7) |
| ✓ Achievement badges | → 50+ badges (Phase 7) |
| ✓ Speaking challenges | → Whisper pronunciation (Phase 5) |
| ✓ Mobile app (iOS/Android) | → PWA install (Phase 2) |
| ✗ Privacy-first (cloud dependent) | ✓ 100% local — zero cloud data |
| ✗ Offline full AI (needs connection) | ✓ Full offline AI stack (zen-tts + zen-lights) |
| ✗ Vietnamese cultural integration | ✓ Vietnamese culture + language bridge |
| ✗ Curiosity sandbox | ✓ Curiosity Sandbox (unique) |
| ✗ Parent-child co-play | → Co-play mode (Phase 10) |
| ✗ Custom AI lesson generation | → AI adventure generator (Phase 10) |
| ✗ SVG coloring / creative mode | → SVG coloring book (Phase 9) |
| ✗ Voice story recording | → Voice story recording (Phase 9) |

### The North Star principle for every decision
> Before implementing any feature, ask: **"If a 3-year-old opened this app alone, with no parent nearby, no instructions, and no prior experience — would they understand what to do, feel safe, feel delighted, and want to come back tomorrow?"**

> If the answer is no — the feature is not ready. If it requires reading, it needs audio. If it requires typing, it needs tapping. If it uses an alert(), it is broken. If there is no mascot reaction, it feels cold. Every screen must pass the *baby eye test* before it ships.

---
**Zen-Duo Master Roadmap** · Generated June 2026
 · For internal planning use Built with love for the next generation of bilingual Vietnamese children 🇻🇳