# Zen-Duo: Feature Backlog & Next Steps

This backlog tracks the upcoming enhancements to evolve Zen-Duo into a robust, offline-capable tablet app.

---

## 🗺️ Leftover Work & Roadmap

### 📦 Phase 1: Interactive Touchscreen & PWA Offline Setup
- [ ] **Drag-and-Drop Touch Events**:
  - Add native HTML5 Drag/Drop or pointer event handlers (`pointerdown`, `pointermove`, `pointerup`) to support dragging word blocks inside the sentence builder on mobile.
- [ ] **PWA Support**:
  - Install `@vite-pwa/plugin` in `vite.config.js`.
  - Configure `manifest.json` with app icons, custom branding theme color, and offline service-worker caching.
  - Setup service worker to cache the SVG icons, audio assets, and CSS font weights for offline use.

### 🎮 Phase 2: Game Loop & Content Expansion
- [ ] **Curriculum Expansion**:
  - Add Levels for Body Parts, Numbers, Colors, Family Relationships, and Time.
  - Introduce distractor words and punctuation validation in the sentence builder.
- [ ] **Interactive Milestones**:
  - Render actual dotted paths connecting the level circle nodes on the Map view.
  - Animate completion routes as the child unlocks next levels.
- [ ] **Sound Effect Expansion**:
  - Include cheerful reward sound files and gamified error buzzers instead of pure web-audio oscillators.

### 🧠 Phase 3: AI Speech & Active Curiosity
- [ ] **Mic Voice Pronunciation Validation**:
  - Integrate Web Audio API recording to capture child's speech.
  - Route recordings to a local lightweight speech-to-text validation backend (Whisper) to score pronunciation accuracy.
- [ ] **Dynamic Curiosity Levels**:
  - Track terms searched inside the Sandbox.
  - If a child repeatedly searches a category (e.g. "Space", "Dinosaur"), automatically inject a custom level on the map containing generated words from that topic.
- [ ] **Interactive Vector Coloring**:
  - Expose SVG path nodes in the Sandbox to allow children to select colors and fill sections of the vector illustration dynamically to promote fine motor skills.
